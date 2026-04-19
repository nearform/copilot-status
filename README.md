# Copilot Status

A mobile app to monitor your GitHub Copilot usage quota with native home screen widgets for iOS and Android.

## Features

- **GitHub OAuth Authentication** — Secure sign-in via OAuth 2.0 with PKCE, tokens stored in `expo-secure-store`
- **Three Quota Tabs** — Dedicated tabs for Premium Requests, Chat, and Completions
- **Interactive Pie Chart** — Tap to toggle between used and available quota views
- **Daily Usage Insights** — Budget used per day, budget left per day, and days remaining until reset
- **Native Widgets** — Home screen widgets for iOS (WidgetKit) and Android (Glance), powered by [Voltra](https://github.com/nicepkg/voltra)
- **Dark / Light / System Theme** — Appearance preference with automatic system theme support
- **Offline-First** — React Query persistence via MMKV for cached data when offline
- **Pull-to-Refresh** — Swipe down on any quota tab to refresh data
- **Internationalization** — i18n-ready with `i18next` and `react-i18next`

## Screenshots

### Dashboard

![Dashboard](./assets/screenshots/dashboard.png)

### Widget

![Widget](./assets/screenshots/widget.png)

## Prerequisites

- Node.js (LTS — see `.nvmrc`)
- iOS: Xcode 15+ (for iOS development)
- Android: Android Studio (for Android development)

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/ilteoood/copilot-status.git
cd copilot-status
npm install
```

### 2. Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

```env
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

To get these credentials:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the callback URL to: `xyz.ilteoood.copilotstatus://`

### 3. iOS Setup

For iOS widgets to work, you need to:

1. Run `npx expo prebuild` to generate the native project
2. Open the project in Xcode
3. Enable the App Groups capability for both the main app and the widget extension
4. Use the App Group: `group.xyz.ilteoood.copilotstatus`

The widget configuration (ID, display name, supported families) is defined in the [Voltra plugin section of `app.json`](./app.json).

### 4. Run the App

```bash
# Development
npx expo start

# iOS (requires Mac)
npx expo run:ios

# Android
npx expo run:android
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start Expo dev server |
| `npm run lint` | Run ESLint via Expo |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Run Jest with coverage report |

## Project Structure

```
copilot-status/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout with auth guard
│   ├── settings.tsx              # Settings screen
│   ├── (auth)/                   # Authentication flow
│   │   └── login.tsx             # GitHub OAuth login
│   └── (tabs)/                   # Main app tabs
│       ├── _layout.tsx           # Tab bar configuration
│       ├── index.tsx             # Premium Requests tab
│       ├── chat.tsx              # Chat quota tab
│       └── completions.tsx       # Completions quota tab
├── components/                   # Reusable UI components
│   ├── CachedBanner.tsx          # Last-updated timestamp banner
│   ├── CircularProgress.tsx      # Interactive pie chart
│   ├── QuotaDisplay.tsx          # Quota data display with loading/error states
│   ├── QuotaScreen.tsx           # Screen wrapper with header
│   ├── QuotaValues.tsx           # Stats cards and chart layout
│   ├── RadioButton.tsx           # Themed radio button
│   ├── Separator.tsx             # List separator
│   ├── StatsCard.tsx             # Statistics card
│   └── settings/                 # Settings sub-components
│       ├── SettingsCategory.tsx   # Grouped settings section
│       ├── SettingsSection.tsx    # Section container
│       └── SettingsVoice.tsx      # Label + value row
├── constants/                    # App constants
│   └── api.ts                    # GitHub OAuth endpoints and scopes
├── hooks/                        # Custom React hooks
│   └── useGitHub.ts              # React Query hooks for user & quota data
├── locales/                      # i18n translation files
│   └── en.json                   # English translations
├── services/                     # Business logic
│   ├── api.ts                    # GitHub Copilot API (via @octokit/rest)
│   ├── auth.ts                   # OAuth authentication with PKCE
│   ├── i18n.ts                   # i18next configuration
│   ├── queryClient.ts            # React Query client with MMKV persistence
│   └── storage.ts                # MMKV storage instance
├── src/
│   └── styles/
│       └── unistyles.ts          # Unistyles theme and breakpoint configuration
├── stores/                       # State management
│   ├── auth.ts                   # Authentication state (Zustand)
│   ├── quota.ts                  # Quota cache clearing
│   ├── secureStorage.ts          # Secure token storage (expo-secure-store)
│   └── theme.ts                  # Theme preference state (Zustand + MMKV)
├── types/                        # TypeScript type definitions
│   ├── api.ts                    # GitHub Copilot API response types
│   └── quota.ts                  # Quota domain types
├── utils/                        # Utility functions
│   ├── colorUtils.ts             # Color-by-percentage helpers
│   ├── dateTimeUtils.ts          # Date formatting and daily quota insight
│   └── numberUtils.ts            # Number formatting
├── widgets/                      # Home screen widgets (Voltra)
│   ├── index.ts                  # Widget exports
│   ├── VoltraCopilotWidget.tsx   # iOS and Android widget components
│   ├── voltraWidgetService.tsx   # Widget update/clear logic
│   └── widgetStyles.ts           # Widget theme-aware styles
└── __tests__/                    # Test suites
```

## Tech Stack

- **Framework**: [Expo SDK 55](https://expo.dev/) + React Native
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with MMKV persistence
- **Data Fetching**: [TanStack React Query](https://tanstack.com/query) with offline-first caching
- **Authentication**: [expo-auth-session](https://docs.expo.dev/versions/latest/sdk/auth-session/) (OAuth 2.0 + PKCE)
- **Secure Storage**: [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)
- **API Client**: [@octokit/rest](https://github.com/octokit/rest.js)
- **Styling**: [react-native-unistyles](https://reactnativeunistyles.vercel.app/) with dark/light themes
- **Widgets**: [Voltra](https://github.com/nicepkg/voltra) — iOS WidgetKit + Android Glance
- **Persistence**: [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- **Charts**: [react-native-pie-chart](https://github.com/nicepkg/react-native-pie-chart)
- **i18n**: [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/)
- **Date Utils**: [date-fns](https://date-fns.org/)

## License

MIT

## Acknowledgements

This project is kindly sponsored by [Nearform](https://nearform.com/).