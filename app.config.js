import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    eas: {
      projectId: 'b516d3da-fe35-4f76-9e27-5cee5d915cfd',
    },
  },
});
