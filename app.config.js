import 'dotenv/config';

// Set by the release workflows (see RELEASING.md) so every store upload gets a
// unique, increasing build number. Unset locally, so app.json defaults apply.
const buildNumber = process.env.APP_BUILD_NUMBER;
if (buildNumber !== undefined && !/^[1-9]\d{0,9}$/.test(buildNumber)) {
  throw new Error(`APP_BUILD_NUMBER must be a positive integer, got "${buildNumber}"`);
}

export default ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    ...(buildNumber && { buildNumber }),
  },
  android: {
    ...config.android,
    ...(buildNumber && { versionCode: Number(buildNumber) }),
  },
  extra: {
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    eas: {
      projectId: 'b516d3da-fe35-4f76-9e27-5cee5d915cfd',
    },
  },
});
