# Releasing CodeMeter

CodeMeter is built and shipped to the App Store and Google Play by GitHub Actions. EAS Build and EAS Submit are not used. Each run generates the native projects with `expo prebuild`, signs them with credentials stored as GitHub secrets, and uploads with the stores' own APIs.

- [Workflows](#workflows)
- [Cutting a release](#cutting-a-release)
- [Versioning](#versioning)
- [One-time setup](#one-time-setup)
- [Troubleshooting](#troubleshooting)

## Workflows

| Workflow      | File                                                       | Runs on                                   | What it does                                                                                                                             |
| ------------- | ---------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Release**   | [`release.yml`](.github/workflows/release.yml)             | Push of a `vX.Y.Z` tag                    | Checks that the tag matches `app.json`, then runs the Android and iOS workflows with one shared build number and uploads to both stores. |
| **Android**   | [`android.yml`](.github/workflows/android.yml)             | Push to `main`, manual, called by Release | Builds a signed `.aab` and `.apk` and uploads the bundle to a Google Play track. Pushes to `main` build only, without uploading.         |
| **iOS**       | [`ios.yml`](.github/workflows/ios.yml)                     | Manual, called by Release                 | Builds a signed App Store `.ipa` and uploads it to App Store Connect, where it appears in TestFlight.                                    |
| PR Validation | [`pr-validation.yml`](.github/workflows/pr-validation.yml) | Pull requests                             | Runs lint, typecheck and tests (unchanged).                                                                                              |

Every build keeps its binaries (and the dSYMs for iOS) as a workflow artifact for 30 days.

iOS builds only run on demand because macOS runner minutes are billed at 10× the Linux rate.

## Cutting a release

1. **Bump the version** in `app.json` (`expo.version`, e.g. `1.1.0`) in a pull request and merge it.
2. **Tag the merge commit** and push the tag:
   ```bash
   git checkout main && git pull
   git tag v1.1.0
   git push origin v1.1.0
   ```
3. **Watch the Release run** in the Actions tab. When it succeeds:
   - Android is on the Play **internal testing** track, or whichever track `ANDROID_RELEASE_TRACK` names.
   - iOS is in **TestFlight** once Apple finishes processing, which usually takes 5 to 30 minutes.
4. **Promote to production manually**. This step is deliberately left out of the automation:
   - Google Play Console → _Test and release_ → promote the internal release to production.
   - App Store Connect → the app's next version → choose the build → _Add for Review_.

If the tag doesn't match `app.json`, the run fails before building. Delete the tag (`git push --delete origin v1.1.0`), fix the version, and tag again.

### Manual builds

Run either platform on its own from _Actions → Android / iOS → Run workflow_, or with the GitHub CLI:

```bash
gh workflow run android.yml -f track=internal            # build + upload to internal testing
gh workflow run android.yml -f track=none                # build only, download the .aab/.apk artifact
gh workflow run android.yml -f track=production -f release_status=draft
gh workflow run ios.yml                                  # build + upload to TestFlight
gh workflow run ios.yml -f upload=false                  # build only, download the .ipa artifact
```

Manual runs use the version in `app.json` on the branch you pick.

## Versioning

|              | Source                                                   | iOS                          | Android       |
| ------------ | -------------------------------------------------------- | ---------------------------- | ------------- |
| Version      | `expo.version` in `app.json`                             | `CFBundleShortVersionString` | `versionName` |
| Build number | Generated per run as `yyDDDHHMM` (UTC), e.g. `263131402` | `CFBundleVersion`            | `versionCode` |

The workflows pass the build number to [`app.config.js`](app.config.js) through the `APP_BUILD_NUMBER` environment variable. Because it's derived from the time, it always increases and works on both platforms without storing a counter anywhere. Play's `versionCode` limit isn't reached until 2099. Local builds don't set the variable, so they use the defaults from `app.json`.

To force a specific number, for example to re-upload after a store rejected a duplicate, fill in the `build_number` input on a manual run. It must be higher than any build already uploaded.

> `eas.json` still has `appVersionSource: "remote"` and `autoIncrement`. These settings only apply to EAS builds, and the workflows ignore them.

## One-time setup

All credentials are **repository secrets** (_Settings → Secrets and variables → Actions_). It's easiest to set them with the GitHub CLI: binary files are base64-encoded, text files are passed as-is.

### Shared

| Secret          | Value                                               |
| --------------- | --------------------------------------------------- |
| `CLIENT_ID`     | GitHub OAuth app client ID (already configured)     |
| `CLIENT_SECRET` | GitHub OAuth app client secret (already configured) |

### Android

The Play package name is `com.nearform.copilotstatusapp` (`expo.android.package` in `app.json`).

**1. Upload keystore.** Google Play App Signing holds the real app signing key. CI signs with your _upload_ key.

- If the app already has an upload key, use it. If it was managed by EAS, `eas credentials -p android` can download the keystore. This uses only the EAS CLI, not EAS Build.
- Otherwise, generate one and keep it somewhere safe outside the repo:
  ```bash
  keytool -genkeypair -v -keystore upload-keystore.jks -alias upload \
    -keyalg RSA -keysize 2048 -validity 10000
  ```

```bash
base64 -i upload-keystore.jks | gh secret set ANDROID_KEYSTORE_BASE64
gh secret set ANDROID_KEYSTORE_PASSWORD   # prompts for the value
gh secret set ANDROID_KEY_ALIAS           # e.g. upload
gh secret set ANDROID_KEY_PASSWORD
```

Until `ANDROID_KEYSTORE_BASE64` is set, pushes to `main` still build but sign with the debug key, and the run shows a warning. Uploads refuse to run without it. Once it's set, every build checks that the bundle is not signed with the debug key.

**2. Create the app in Play Console** (skip this if it already exists). Google's API can't create an app or its first release:

1. Create the app in [Play Console](https://play.google.com/console) with the package name above, and enroll in Play App Signing.
2. Run `gh workflow run android.yml -f track=none`, download the `.aab` from the run's artifacts, and upload it by hand to the internal testing track.

While the app has never been published, Play only accepts **draft** releases. Set the repository variable `ANDROID_RELEASE_STATUS=draft`, or pick `draft` on manual runs, until the first review passes.

**3. Service account for uploads:**

1. In [Google Cloud Console](https://console.cloud.google.com/), pick or create a project and enable the **Google Play Android Developer API**.
2. Create a service account (no project roles needed), then create a **JSON key** for it.
3. In Play Console, go to _Users and permissions → Invite new users_, enter the service account's email, and grant access to this app with _Release apps to testing tracks_ and _Release to production, exclude devices, and use Play App Signing_.
4. Store the key:
   ```bash
   gh secret set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON < play-service-account.json
   ```

A newly invited service account can take up to a day before Google accepts it.

### iOS

Bundle IDs (team `VPLG3LLGBN`), both with the **App Groups** capability set to `group.com.nearform.copilotstatus`:

| Target           | Bundle ID                                              |
| ---------------- | ------------------------------------------------------ |
| App              | `com.nearform.copilotstatus`                           |
| Widget extension | `com.nearform.copilotstatus.CopilotStatusLiveActivity` |

> The widget's bundle ID comes from `targetName` in the Voltra plugin config in `app.json`. Don't change it without registering the new App ID and creating a new profile.

If you have the `credentials.json` from local EAS builds (`credentialsSource: "local"`), it already lists the `.p12`, its password and both profiles needed below.

**1. Distribution certificate.** Export the **Apple Distribution** certificate _with its private key_ from Keychain Access as a `.p12`, and set a password when prompted:

```bash
base64 -i distribution.p12 | gh secret set IOS_DIST_CERT_P12_BASE64
gh secret set IOS_DIST_CERT_PASSWORD
```

**2. Provisioning profiles.** In the [Apple Developer portal](https://developer.apple.com/account/resources/profiles/list), create an **App Store Connect** distribution profile for _each_ bundle ID above, using that certificate, and download both:

```bash
base64 -i CodeMeter_AppStore.mobileprovision | gh secret set IOS_APP_PROFILE_BASE64
base64 -i CodeMeter_Widget_AppStore.mobileprovision | gh secret set IOS_WIDGET_PROFILE_BASE64
```

Profiles expire after a year, or earlier if the certificate is revoked. When that happens, regenerate both and update the secrets. The workflow fails early with a clear message if a profile has expired or isn't an App Store profile.

**3. App Store Connect API key** (used for the upload). In [App Store Connect](https://appstoreconnect.apple.com/access/integrations/api), go to _Users and Access → Integrations → App Store Connect API → Team Keys_ and generate a key with the **App Manager** role. Note the Key ID and Issuer ID, and download the `.p8` file. Apple only lets you download it once.

```bash
gh secret set ASC_API_KEY_ID        # e.g. 2X9R4HXF34
gh secret set ASC_API_ISSUER_ID     # UUID shown above the keys table
gh secret set ASC_API_KEY_P8 < AuthKey_2X9R4HXF34.p8
```

The app already exists in App Store Connect (`ascAppId` `6763082674`).

#### How iOS signing works in CI

`expo prebuild` generates an Xcode project with automatic signing, which needs a signed-in Apple ID. After prebuild, [`scripts/ci/ios-signing.js`](scripts/ci/ios-signing.js) reads each provisioning profile and matches it to the Xcode target with the same bundle ID. It switches each target's Release configuration to manual signing with _Apple Distribution_, and writes the `ExportOptions.plist` used to export the `.ipa`. The certificate goes into a temporary keychain, which is deleted at the end of the job. If you add another app extension, add a profile secret for it and pass it to the script in `ios.yml`.

### Optional repository variables

Set these under _Settings → Secrets and variables → Actions → Variables_:

| Variable                 | Default        | Purpose                                                                                                                     |
| ------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `ANDROID_RELEASE_TRACK`  | `internal`     | Play track that tagged releases go to (`internal`, `alpha`, `beta`, `production`)                                           |
| `ANDROID_RELEASE_STATUS` | `completed`    | `draft` until the app has been published once                                                                               |
| `IOS_RUNNER`             | `macos-26`     | macOS runner image for iOS builds                                                                                           |
| `XCODE_VERSION`          | runner default | Selects `/Applications/Xcode_<version>.app`, e.g. `26.2`. Set it if the runner's default Xcode is too old for the Expo SDK. |

### Hardening (recommended)

The repository is public. Secrets are never passed to workflows triggered from forks, and these workflows only run on pushes, tags and manual dispatch. To also stop anyone with write access from shipping on their own:

- Move the store secrets into a GitHub **Environment** (e.g. `production`) with required reviewers, and add `environment: production` to the build jobs.
- Add a **tag ruleset** that restricts who can create `v*` tags.

## Troubleshooting

| Symptom                                                                        | Fix                                                                                                                                                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tag vX.Y.Z does not match app.json version`                                   | Bump `app.json`, merge, then re-tag.                                                                                                                                |
| `Missing secrets: …`                                                           | Add the listed secrets (see [One-time setup](#one-time-setup)).                                                                                                     |
| `No provisioning profile for target "…"`                                       | A target's bundle ID has no matching profile. Check that the profile secrets are for the bundle IDs above.                                                          |
| `Profile "…" is not an App Store distribution profile`                         | You uploaded a development or ad hoc profile. Create an _App Store Connect_ profile instead.                                                                        |
| `No signing certificate "iOS Distribution" found` / identity errors            | The `.p12` is missing its private key, or the profiles were made for a different certificate. Re-export the certificate _with_ its key, or regenerate the profiles. |
| iOS build fails on compiler or SDK errors only in CI                           | The runner's Xcode is too old. Set `XCODE_VERSION`, or `IOS_RUNNER` to a newer image.                                                                               |
| App Store: _bundle version must be higher_ / Play: _version code already used_ | Re-run manually with a higher `build_number`.                                                                                                                       |
| Play: _Only releases with status draft may be created on draft app_            | Use `release_status=draft` (or set `ANDROID_RELEASE_STATUS=draft`) until the first release is published.                                                            |
| Play: _The caller does not have permission_ / _Package not found_              | The service account isn't invited to the app yet, lacks release permissions, or is less than about a day old. The first upload must be done by hand.                |
| Play: _signed with the wrong key_                                              | The keystore in `ANDROID_KEYSTORE_BASE64` isn't the upload key registered in Play App Signing.                                                                      |
