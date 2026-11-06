global.__ExpoImportMetaRegistry = {};
global.structuredClone = global.structuredClone || ((obj) => JSON.parse(JSON.stringify(obj)));

const mockStorageInstance = {
  getString: jest.fn(),
  getNumber: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clearAll: jest.fn(),
};

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => mockStorageInstance),
}));

global.mockStorageInstance = mockStorageInstance;

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        githubClientId: 'test-client-id',
        githubClientSecret: 'test-client-secret',
      },
    },
  },
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'http://localhost:19000'),
  useAuthRequest: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn(),
  RestEndpointMethodTypes: {},
}));

jest.mock('@/widgets/voltraWidgetService', () => ({
  updateAppWidget: jest.fn(() => Promise.resolve()),
  clearAppWidget: jest.fn(() => Promise.resolve()),
}));
