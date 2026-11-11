#!/usr/bin/env node
/**
 * Switches the prebuilt iOS project to manual App Store signing.
 *
 * `expo prebuild` regenerates ios/ with automatic signing, which CI can't use
 * without an Apple ID session. This script reads the given App Store
 * provisioning profiles, matches each to an Xcode target by bundle ID (the
 * app and the widget extension each need their own), sets manual signing on
 * every Release configuration, and writes the ExportOptions.plist that
 * `xcodebuild -exportArchive` needs.
 *
 * Usage (from the project root, after prebuild):
 *   node scripts/ci/ios-signing.js [--install] <ExportOptions.plist> <profile.mobileprovision>...
 *
 *   --install  also copy the profiles to where Xcode looks for them
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { IOSConfig } = require('expo/config-plugins');

const PROFILE_DIRS = [
  path.join(os.homedir(), 'Library/MobileDevice/Provisioning Profiles'),
  path.join(os.homedir(), 'Library/Developer/Xcode/UserData/Provisioning Profiles'),
];

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function readProfile(file) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'profile-'));
  const plist = path.join(tmpDir, 'profile.plist');
  try {
    execFileSync('security', ['cms', '-D', '-i', file, '-o', plist]);
    const get = keyPath =>
      execFileSync('plutil', ['-extract', keyPath, 'raw', '-o', '-', plist], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
    const has = keyPath => {
      try {
        get(keyPath);
        return true;
      } catch {
        return false;
      }
    };

    const name = get('Name');
    const prefix = get('ApplicationIdentifierPrefix.0');
    const appId = get('Entitlements.application-identifier');
    const profile = {
      file,
      name,
      uuid: get('UUID'),
      teamId: get('TeamIdentifier.0'),
      bundleId: appId.slice(prefix.length + 1),
    };

    if (
      has('ProvisionedDevices') ||
      has('ProvisionsAllDevices') ||
      get('Entitlements.get-task-allow') === 'true'
    ) {
      fail(`Profile "${name}" is not an App Store distribution profile.`);
    }
    if (new Date(get('ExpirationDate')) <= new Date()) {
      fail(
        `Profile "${name}" expired on ${get('ExpirationDate')}. Regenerate it in the Apple Developer portal.`
      );
    }
    return profile;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

const unquote = value => String(value).replace(/^"(.*)"$/, '$1');
const quote = value => `"${value}"`;
const xmlEscape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function main() {
  const args = process.argv.slice(2);
  const install = args[0] === '--install';
  if (install) args.shift();
  const [exportOptionsPath, ...profileFiles] = args;
  if (!exportOptionsPath || profileFiles.length === 0) {
    fail('Usage: ios-signing.js [--install] <ExportOptions.plist> <profile.mobileprovision>...');
  }

  const profiles = new Map();
  for (const file of profileFiles) {
    const profile = readProfile(file);
    profiles.set(profile.bundleId, profile);
    console.log(`Profile "${profile.name}" -> ${profile.bundleId} (team ${profile.teamId})`);
  }
  const teamIds = new Set([...profiles.values()].map(p => p.teamId));
  if (teamIds.size !== 1) fail(`Profiles belong to different teams: ${[...teamIds].join(', ')}`);
  const [teamId] = teamIds;

  const project = IOSConfig.XcodeUtils.getPbxproj(process.cwd());
  const projectSection = project.pbxProjectSection()[project.getFirstProject().uuid];
  const targetAttributes = (projectSection.attributes.TargetAttributes ??= {});
  const used = new Set();

  for (const [targetId, target] of Object.entries(project.pbxNativeTargetSection())) {
    if (typeof target !== 'object') continue; // skip "<id>_comment" entries
    const targetName = unquote(target.name);
    const configs = IOSConfig.XcodeUtils.getBuildConfigurationsForListId(
      project,
      target.buildConfigurationList
    );

    for (const [, config] of configs) {
      if (config.name !== 'Release') continue;
      const settings = config.buildSettings;
      if (!settings.PRODUCT_BUNDLE_IDENTIFIER) continue;
      const bundleId = unquote(settings.PRODUCT_BUNDLE_IDENTIFIER);
      const profile = profiles.get(bundleId);
      if (!profile) {
        fail(
          `No provisioning profile for target "${targetName}" (${bundleId}). Add one to the workflow secrets.`
        );
      }

      settings.CODE_SIGN_STYLE = 'Manual';
      settings.DEVELOPMENT_TEAM = teamId;
      settings.CODE_SIGN_IDENTITY = quote('Apple Distribution');
      settings['"CODE_SIGN_IDENTITY[sdk=iphoneos*]"'] = quote('Apple Distribution');
      settings.PROVISIONING_PROFILE_SPECIFIER = quote(profile.name);
      targetAttributes[targetId] = {
        ...targetAttributes[targetId],
        DevelopmentTeam: teamId,
        ProvisioningStyle: 'Manual',
      };
      used.add(bundleId);
      console.log(`Target "${targetName}" (${bundleId}) signs with "${profile.name}"`);
    }
  }

  for (const bundleId of profiles.keys()) {
    if (!used.has(bundleId)) console.warn(`::warning::Profile for ${bundleId} matched no target.`);
  }
  fs.writeFileSync(project.filepath, project.writeSync());

  const profileEntries = [...profiles.values()]
    .filter(p => used.has(p.bundleId))
    .map(
      p => `      <key>${xmlEscape(p.bundleId)}</key>\n      <string>${xmlEscape(p.name)}</string>`
    )
    .join('\n');
  fs.mkdirSync(path.dirname(path.resolve(exportOptionsPath)), { recursive: true });
  fs.writeFileSync(
    exportOptionsPath,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>method</key>
    <string>app-store-connect</string>
    <key>teamID</key>
    <string>${teamId}</string>
    <key>signingStyle</key>
    <string>manual</string>
    <key>signingCertificate</key>
    <string>Apple Distribution</string>
    <key>provisioningProfiles</key>
    <dict>
${profileEntries}
    </dict>
    <key>uploadSymbols</key>
    <true/>
    <key>manageAppVersionAndBuildNumber</key>
    <false/>
  </dict>
</plist>
`
  );
  console.log(`Wrote ${exportOptionsPath}`);

  if (install) {
    for (const dir of PROFILE_DIRS) {
      fs.mkdirSync(dir, { recursive: true });
      for (const p of profiles.values()) {
        fs.copyFileSync(p.file, path.join(dir, `${p.uuid}.mobileprovision`));
      }
    }
    console.log(`Installed ${profiles.size} provisioning profile(s).`);
  }
}

main();
