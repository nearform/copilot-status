# GitHub Copilot Status Mobile App - Full Implementation

## TL;DR

> **Quick Summary**: Implement a complete GitHub Copilot Status mobile app with OAuth authentication, quota dashboard, iOS WidgetKit widgets (3 sizes), Android AppWidget, and hourly background refresh using Expo SDK 54.
>
> **Deliverables**:
>
> - GitHub OAuth login flow with secure token storage
> - Dashboard screen with circular progress, stats card, pull-to-refresh
> - iOS widgets (Small, Medium, Large) via @bacons/apple-targets
> - Android widget via react-native-android-widget
> - Background hourly quota refresh via expo-background-task
> - State management with Zustand + MMKV
>
> **Estimated Effort**: Large (40-60 hours)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Task 1 → Task 2 → Task 5 → Task 8 → Task 11 → Task 14

---

## Context

### Original Request

User requested a comprehensive parallel task graph for implementing a full GitHub Copilot Status app in an existing Expo project with:

- GitHub OAuth authentication
- Dashboard with quota visualization
- iOS and Android home screen widgets
- Background refresh services

### Interview Summary

**Key Discussions**:

- Project uses Expo SDK 54 with expo-router file-based navigation
- PRD document provides detailed specifications for all features
- Environment variables contain GitHub OAuth credentials
- User constraint: DO NOT touch native folders directly (use Expo config plugins)

**Research Findings**:

- Widgets require development build via `npx expo run:*` (not compatible with Expo Go)
- `react-native-android-widget@0.20.1` best for Android widgets
- `@bacons/apple-targets` best for iOS WidgetKit
- `expo-background-task` replaces deprecated expo-background-fetch
- MMKV is 30x faster than AsyncStorage, works with background tasks
- GitHub OAuth requires manual token exchange (no full PKCE support)

### Gap Analysis (Metis Review)

**Identified Gaps** (addressed):

- Apple Team ID needed for iOS widgets → Added as required input
- EAS Build requirement not explicit → Added as prerequisite
- Edge cases for quota boundaries → Defined: 50% = warning, 20% = critical
- Token refresh strategy → Implement re-auth on 401 response

---

## Work Objectives

### Core Objective

Build a production-ready GitHub Copilot Status mobile app that allows users to monitor their quota usage through a native dashboard and home screen widgets on both iOS and Android.

### Concrete Deliverables

1. `/app/(auth)/login.tsx` - Login screen with GitHub OAuth
2. `/app/(tabs)/index.tsx` - Dashboard with quota visualization
3. `/app/(tabs)/settings.tsx` - Settings screen with sign out
4. `/services/api.ts` - GitHub API client
5. `/services/auth.ts` - OAuth authentication service
6. `/stores/quota.ts` - Zustand store with MMKV persistence
7. `/widgets/QuotaWidget.tsx` - Android widget component
8. `/targets/widget/` - iOS WidgetKit implementation (Swift)
9. `/tasks/quota-refresh.ts` - Background task definition

### Definition of Done

- [ ] User can sign in with GitHub OAuth and see dashboard
- [ ] Dashboard shows quota circle, stats, and handles refresh
- [ ] iOS widgets (3 sizes) display quota data
- [ ] Android widget displays quota data
- [ ] Background task refreshes data hourly
- [ ] App works on local development build (`npx expo run:*`)

### Must Have

- GitHub OAuth flow with expo-auth-session
- Secure token storage with expo-secure-store
- Circular progress indicator with color-coded status
- Pull-to-refresh functionality
- Cached data fallback with indicator banner
- iOS widgets (Small, Medium, Large)
- Android widget (single size)
- Background hourly refresh

### Must NOT Have (Guardrails)

- NO direct native folder modifications (ios/, android/)
- NO internationalization (i18n) for v1
- NO Live Activities or Dynamic Island
- NO Lock Screen widgets
- NO usage history charts
- NO push notifications
- NO multiple account support
- NO analytics or crash reporting
- NO custom widget theming

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: NO
- **User wants tests**: NO (personal app, manual verification)
- **QA approach**: Manual verification via local development build (`npx expo run:*`)

### Automated Verification Approach

Each TODO includes EXECUTABLE verification procedures:

| Type            | Verification Method                            |
| --------------- | ---------------------------------------------- |
| Authentication  | OAuth flow in simulator, token in secure store |
| Dashboard UI    | Visual inspection, pull-to-refresh action      |
| Widgets         | Add widget to home screen, verify data display |
| Background Task | Check timestamps, view logs                    |
| API Integration | curl commands to verify endpoint               |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Project setup & dependencies
├── Task 2: Types and constants
└── Task 3: Storage layer (MMKV)

Wave 2 (After Wave 1):
├── Task 4: Auth service & store
├── Task 5: API client
└── Task 6: Quota store

Wave 3 (After Wave 2):
├── Task 7: Auth UI (login screen)
├── Task 8: Dashboard components
└── Task 9: Settings screen

Wave 4 (After Wave 3):
├── Task 10: App navigation integration
├── Task 11: Android widget
└── Task 12: iOS widget setup

Wave 5 (After Wave 4):
├── Task 13: Background task
├── Task 14: Widget data sync service
└── Task 15: Final integration & polish

Critical Path: 1 → 2 → 5 → 8 → 10 → 14
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks     | Can Parallelize With |
| ---- | ---------- | ---------- | -------------------- |
| 1    | None       | 2,3,4,5,6  | None                 |
| 2    | 1          | 4,5,6,8    | 3                    |
| 3    | 1          | 4,6,14     | 2                    |
| 4    | 2,3        | 7,10       | 5,6                  |
| 5    | 2          | 6,8,13,14  | 4,6                  |
| 6    | 2,3,5      | 8,11,12,14 | None                 |
| 7    | 4          | 10         | 8,9                  |
| 8    | 5,6        | 10         | 7,9                  |
| 9    | 4          | 10         | 7,8                  |
| 10   | 7,8,9      | 11,12,13   | None                 |
| 11   | 6,10       | 14         | 12                   |
| 12   | 6,10       | 14         | 11                   |
| 13   | 5,10       | 15         | 14                   |
| 14   | 6,11,12    | 15         | 13                   |
| 15   | 13,14      | None       | None                 |

### Agent Dispatch Summary

| Wave | Tasks    | Recommended Approach                |
| ---- | -------- | ----------------------------------- |
| 1    | 1,2,3    | Sequential (1), then parallel (2,3) |
| 2    | 4,5,6    | Parallel after dependencies met     |
| 3    | 7,8,9    | Parallel after dependencies met     |
| 4    | 10,11,12 | 10 first, then parallel (11,12)     |
| 5    | 13,14,15 | Parallel (13,14), then 15           |

---

## TODOs

### Wave 1: Foundation

- [ ] 1. Project Setup & Dependencies

  **What to do**:
  - Update app.json: scheme to `com.nearform.copilotstatus`
  - Update app.json: Add iOS bundle identifier and Android package
  - Update app.json: Add App Groups entitlement for iOS widgets
  - Update app.json: Add expo-background-task plugin config
  - Install core dependencies:
    ```bash
    npx expo install expo-auth-session expo-crypto expo-secure-store
    npx expo install expo-background-task expo-task-manager
    npm install zustand react-native-mmkv
    npm install react-native-android-widget
    npm install @bacons/apple-targets react-native-shared-group-preferences
    ```
  - Configure react-native-android-widget in app.json plugins

  **Must NOT do**:
  - DO NOT modify ios/ or android/ folders directly
  - DO NOT add any internationalization packages
  - DO NOT add analytics packages

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration and dependency installation is straightforward
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed for setup

  **Parallelization**:
  - **Can Run In Parallel**: NO (must complete first)
  - **Parallel Group**: Wave 1 - Start
  - **Blocks**: Tasks 2, 3, 4, 5, 6
  - **Blocked By**: None

  **References**:
  - `app.json` - Current Expo configuration to update
  - `package.json` - Current dependencies list
  - PRD Section 3.4 - Build configuration requirements

  **Acceptance Criteria**:

  ```bash
  # Verify dependencies installed
  cat package.json | grep -E "(zustand|mmkv|android-widget|apple-targets|auth-session|background-task)"
  # Expected: All packages listed

  # Verify app.json scheme updated
  cat app.json | grep '"scheme"'
  # Expected: "com.nearform.copilotstatus"

  # Verify plugins configured
  cat app.json | grep -A2 '"plugins"'
  # Expected: expo-router, expo-splash-screen, expo-background-task, react-native-android-widget
  ```

  **Commit**: YES
  - Message: `chore(setup): add dependencies and configure app.json for widgets`
  - Files: `package.json`, `app.json`, `package-lock.json`

---

- [ ] 2. Types and Constants

  **What to do**:
  - Create `/types/quota.ts` with QuotaInfo interface and QuotaStatus type
  - Create `/types/api.ts` with GitHub API response types
  - Update `/constants/theme.ts` to add status colors (green, orange, red)
  - Create `/constants/api.ts` with API endpoints and required headers

  **Must NOT do**:
  - DO NOT change existing color values in theme.ts
  - DO NOT add internationalization keys

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple type definitions and constants
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 3)
  - **Blocks**: Tasks 4, 5, 6, 8
  - **Blocked By**: Task 1

  **References**:
  - `constants/theme.ts` - Existing theme pattern to extend
  - PRD Section 2.5.1 - QuotaInfo data model
  - PRD Section 3.2 - API response format

  **Acceptance Criteria**:

  ```bash
  # Verify types file exists and exports QuotaInfo
  cat types/quota.ts | grep "export interface QuotaInfo"
  # Expected: interface definition with all fields

  # Verify status colors added
  cat constants/theme.ts | grep -E "(statusGood|statusWarning|statusCritical)"
  # Expected: Three color definitions for each theme

  # Verify API constants
  cat constants/api.ts | grep "COPILOT_API_ENDPOINT"
  # Expected: https://api.github.com/copilot_internal/user
  ```

  **Commit**: YES
  - Message: `feat(types): add quota types and API constants`
  - Files: `types/quota.ts`, `types/api.ts`, `constants/theme.ts`, `constants/api.ts`

---

- [ ] 3. Storage Layer (MMKV)

  **What to do**:
  - Create `/services/storage.ts` with MMKV instance and typed getters/setters
  - Create storage keys enum for quota data, last fetch time, sync status
  - Create Zustand storage adapter for MMKV persistence
  - Add platform check for web fallback to localStorage

  **Must NOT do**:
  - DO NOT store tokens in MMKV (use expo-secure-store instead)
  - DO NOT add encryption for MMKV (quota data is not sensitive)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward storage wrapper implementation
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 4, 6, 14
  - **Blocked By**: Task 1

  **References**:
  - Librarian research on MMKV + Zustand integration patterns
  - `hooks/use-theme-color.ts` - Example of utility hook pattern

  **Acceptance Criteria**:

  ```bash
  # Verify storage file exists
  cat services/storage.ts | grep "MMKV"
  # Expected: MMKV import and instance creation

  # Verify Zustand adapter
  cat services/storage.ts | grep "StateStorage"
  # Expected: Zustand StateStorage adapter implementation
  ```

  **Commit**: YES
  - Message: `feat(storage): add MMKV storage layer with Zustand adapter`
  - Files: `services/storage.ts`

---

### Wave 2: Services & State

- [ ] 4. Auth Service & Store

  **What to do**:
  - Create `/services/auth.ts`:
    - `signInWithGitHub()` - Initiates OAuth flow with expo-auth-session
    - `exchangeCodeForToken()` - Exchanges auth code for access token
    - `getStoredToken()` - Retrieves token from expo-secure-store
    - `signOut()` - Clears stored token
    - `isAuthenticated()` - Checks if valid token exists
  - Create `/stores/auth.ts` Zustand store:
    - State: `isAuthenticated`, `isLoading`, `user`
    - Actions: `signIn`, `signOut`, `checkAuth`
  - Configure redirect URI: `com.nearform.copilotstatus://oauth`

  **Must NOT do**:
  - DO NOT implement refresh token flow (GitHub tokens are long-lived)
  - DO NOT store client secret in code (keep in .env)

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: OAuth flow requires careful security handling
  - **Skills**: None (expo-auth-session is well-documented)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Tasks 7, 10
  - **Blocked By**: Tasks 2, 3

  **References**:
  - Librarian research on expo-auth-session + GitHub OAuth
  - `.env` - GitHub OAuth credentials
  - PRD Section 2.1 - Authentication requirements

  **Acceptance Criteria**:

  ```bash
  # Verify auth service exports
  cat services/auth.ts | grep -E "export (async function|function)"
  # Expected: signInWithGitHub, exchangeCodeForToken, getStoredToken, signOut, isAuthenticated

  # Verify Zustand store
  cat stores/auth.ts | grep "create<"
  # Expected: Zustand store with AuthState type
  ```

  **Commit**: YES
  - Message: `feat(auth): add GitHub OAuth service and auth store`
  - Files: `services/auth.ts`, `stores/auth.ts`

---

- [ ] 5. API Client

  **What to do**:
  - Create `/services/api.ts`:
    - `fetchCopilotQuota(token: string)` - Fetches quota from GitHub API
    - Add required headers from PRD (Editor-Version, User-Agent, etc.)
    - Parse response into QuotaInfo format
    - Handle errors: 401, 403, 429, 5xx, network errors
  - Calculate computed fields:
    - `remainingQuota = entitlement * (percent_remaining / 100)`
    - `usedQuota = totalQuota - remainingQuota`
    - `status = percent > 50 ? 'good' : percent > 20 ? 'warning' : 'critical'`

  **Must NOT do**:
  - DO NOT implement ETag caching (keep simple for v1)
  - DO NOT implement retry logic (simple one-shot requests)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple fetch wrapper with type conversion
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Tasks 6, 8, 13, 14
  - **Blocked By**: Task 2

  **References**:
  - `constants/api.ts` - API endpoint and headers (from Task 2)
  - `types/quota.ts` - QuotaInfo interface (from Task 2)
  - PRD Section 3.2 - API integration details

  **Acceptance Criteria**:

  ```bash
  # Verify API client
  cat services/api.ts | grep "fetchCopilotQuota"
  # Expected: Function that fetches and parses quota

  # Verify headers
  cat services/api.ts | grep "Editor-Version"
  # Expected: vscode/1.96.2 header

  # Test API manually (with valid token)
  curl -s -H "Authorization: Bearer TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "Editor-Version: vscode/1.96.2" \
    -H "User-Agent: GitHubCopilotChat/0.26.7" \
    "https://api.github.com/copilot_internal/user" | head -5
  # Expected: JSON with username and quota_snapshots
  ```

  **Commit**: YES
  - Message: `feat(api): add GitHub Copilot API client`
  - Files: `services/api.ts`

---

- [ ] 6. Quota Store

  **What to do**:
  - Create `/stores/quota.ts` Zustand store with MMKV persistence:
    - State: `quota: QuotaInfo | null`, `lastFetch: number | null`, `isLoading`, `error`, `isCached`
    - Actions: `fetchQuota`, `setQuota`, `clearQuota`
  - Implement `fetchQuota`:
    - Call API client
    - On success: update store, save to MMKV, clear isCached flag
    - On error: set error, mark isCached if old data exists
  - Create `/hooks/useQuota.ts` for easy component access

  **Must NOT do**:
  - DO NOT implement automatic refresh interval (handled by background task)
  - DO NOT implement optimistic updates

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Zustand pattern with persistence
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on 5)
  - **Parallel Group**: Wave 2 - End
  - **Blocks**: Tasks 8, 11, 12, 14
  - **Blocked By**: Tasks 2, 3, 5

  **References**:
  - `services/storage.ts` - MMKV adapter (from Task 3)
  - `services/api.ts` - API client (from Task 5)
  - `stores/auth.ts` - Auth store pattern (from Task 4)

  **Acceptance Criteria**:

  ```bash
  # Verify quota store
  cat stores/quota.ts | grep "persist<QuotaState>"
  # Expected: Zustand store with MMKV persistence

  # Verify hook
  cat hooks/useQuota.ts | grep "export function useQuota"
  # Expected: Hook that exposes quota state and actions
  ```

  **Commit**: YES
  - Message: `feat(store): add quota store with MMKV persistence`
  - Files: `stores/quota.ts`, `hooks/useQuota.ts`

---

### Wave 3: UI Components

- [ ] 7. Auth UI (Login Screen)

  **What to do**:
  - Create `/app/(auth)/_layout.tsx` - Auth stack layout
  - Create `/app/(auth)/login.tsx` - Login screen:
    - GitHub logo/branding
    - "Sign in with GitHub" button
    - Loading state during OAuth flow
    - Error display with retry option
  - Create `/components/auth/GitHubButton.tsx` - Styled button component
  - Use existing ThemedView/ThemedText components

  **Must NOT do**:
  - DO NOT add other OAuth providers
  - DO NOT add "remember me" or other auth options

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with styling
  - **Skills**: `frontend-ui-ux`
    - Reason: Clean login screen design

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Task 4

  **References**:
  - `components/themed-text.tsx` - ThemedText pattern
  - `components/themed-view.tsx` - ThemedView pattern
  - `stores/auth.ts` - Auth store (from Task 4)
  - PRD Section 4.1.1 - First-time user flow

  **Acceptance Criteria**:

  ```
  # Playwright verification (via simulator):
  1. Navigate to: login screen (should be default when not authenticated)
  2. Assert: "Sign in with GitHub" button visible
  3. Click: Sign in button
  4. Assert: System browser opens (expo-web-browser)
  5. Screenshot: .sisyphus/evidence/task-7-login-screen.png
  ```

  **Commit**: YES
  - Message: `feat(auth): add login screen with GitHub OAuth`
  - Files: `app/(auth)/_layout.tsx`, `app/(auth)/login.tsx`, `components/auth/GitHubButton.tsx`

---

- [ ] 8. Dashboard Components

  **What to do**:
  - Create `/components/dashboard/CircularProgress.tsx`:
    - Large circular progress ring
    - Center text: remaining quota number
    - "of [total]" subtitle
    - Color based on status (green/orange/red)
    - Use react-native-reanimated for smooth animations
  - Create `/components/dashboard/StatsCard.tsx`:
    - Usage row: icon + "Usage" + percentage
    - Resets row: icon + "Resets" + human-readable time
    - Overage row (conditional): icon + "Overage" + count
  - Create `/components/dashboard/CachedBanner.tsx`:
    - Info icon + "Showing cached data" text
    - Only visible when isCached is true
  - Update `/app/(tabs)/index.tsx` to be Dashboard:
    - Replace starter content
    - Compose above components
    - Add pull-to-refresh (RefreshControl)
    - Add header with refresh button and sign out

  **Must NOT do**:
  - DO NOT add usage history chart
  - DO NOT add multiple sections/tabs
  - DO NOT implement custom themes

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI with animations
  - **Skills**: `frontend-ui-ux`
    - Reason: Visual design for dashboard

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 5, 6

  **References**:
  - `components/parallax-scroll-view.tsx:3-8,30-45` - Reanimated useAnimatedStyle, interpolate patterns
  - `constants/theme.ts` - Status colors (from Task 2)
  - PRD Section 2.2 - Dashboard screen specifications
  - Note: react-native-reanimated already installed in package.json

  **Acceptance Criteria**:

  ```
  # Playwright verification (via simulator):
  1. Navigate to: Dashboard (after sign in)
  2. Assert: Circular progress visible with number
  3. Assert: Stats card with Usage, Resets rows
  4. Pull down: Verify RefreshControl activates
  5. Screenshot: .sisyphus/evidence/task-8-dashboard.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add quota visualization components`
  - Files: `components/dashboard/*.tsx`, `app/(tabs)/index.tsx`

---

- [ ] 9. Settings Screen

  **What to do**:
  - Create `/app/(tabs)/settings.tsx`:
    - User info section (username from quota data)
    - Sign out button
    - App version display
  - Update `/app/(tabs)/_layout.tsx`:
    - Rename "Explore" tab to "Settings"
    - Update icon to gear/settings icon

  **Must NOT do**:
  - DO NOT add theme toggle
  - DO NOT add notification settings
  - DO NOT add account management

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple settings screen
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Task 10
  - **Blocked By**: Task 4

  **References**:
  - `app/(tabs)/explore.tsx` - Current explore screen to replace
  - `app/(tabs)/_layout.tsx` - Tab layout to update
  - `stores/auth.ts` - Auth store for sign out

  **Acceptance Criteria**:

  ```bash
  # Verify settings screen exists
  ls app/\(tabs\)/settings.tsx
  # Expected: File exists

  # Verify tab renamed
  cat app/\(tabs\)/_layout.tsx | grep "Settings"
  # Expected: Tab with name="settings" and title="Settings"
  ```

  **Commit**: YES
  - Message: `feat(settings): add settings screen with sign out`
  - Files: `app/(tabs)/settings.tsx`, `app/(tabs)/_layout.tsx`
  - Note: Delete `app/(tabs)/explore.tsx`

---

### Wave 4: Navigation & Widgets

- [ ] 10. App Navigation Integration

  **What to do**:
  - Update `/app/_layout.tsx`:
    - Wrap with AuthProvider (or use Zustand directly)
    - Add auth state check on mount
    - Redirect to login if not authenticated
    - Redirect to dashboard if authenticated
  - Add auth group to navigation:
    - `(auth)` group for login flow
    - `(tabs)` group for authenticated screens
  - Handle deep link callback for OAuth redirect

  **Must NOT do**:
  - DO NOT add complex navigation guards
  - DO NOT add splash/onboarding screens

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Navigation flow requires careful state management
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO (integration point)
  - **Parallel Group**: Wave 4 - Start
  - **Blocks**: Tasks 11, 12, 13
  - **Blocked By**: Tasks 7, 8, 9

  **References**:
  - `app/_layout.tsx` - Current root layout
  - `stores/auth.ts` - Auth store
  - Librarian research on expo-router auth patterns

  **Acceptance Criteria**:

  ```
  # Manual verification flow:
  1. Fresh app launch → Should show login screen
  2. Complete OAuth → Should navigate to dashboard
  3. Kill and reopen app → Should go directly to dashboard
  4. Sign out → Should return to login screen
  ```

  **Commit**: YES
  - Message: `feat(navigation): integrate auth flow with navigation`
  - Files: `app/_layout.tsx`

---

- [ ] 11. Android Widget

  **What to do**:
  - Create `/widgets/QuotaWidget.tsx`:
    - Use react-native-android-widget primitives
    - Layout: Title, username, remaining/total, status indicator, percentage, reset time
    - Match PRD Section 2.3.2 layout
  - Create `/widgets/widgetTaskHandler.ts`:
    - Handle WIDGET_ADDED, WIDGET_UPDATE, WIDGET_DELETED events
    - Read quota from MMKV storage
    - Render widget with current data
    - Handle "Sign in required" state
  - Update `index.js` (or create if needed):
    - Register widget task handler
  - Configure widget in app.json:
    - Name: "CopilotQuota"
    - Dimensions: minHeight 120dp, minWidth 250dp
    - Preview image (create simple placeholder)

  **Must NOT do**:
  - DO NOT implement multiple widget sizes
  - DO NOT implement widget configuration screen
  - DO NOT implement widget click actions (deep link to app)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Widget UI with specific constraints
  - **Skills**: None (react-native-android-widget specific)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 12)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 6, 10

  **References**:
  - Librarian research on react-native-android-widget examples
  - `stores/quota.ts` - Quota store (from Task 6)
  - PRD Section 2.3.2 - Android widget layout

  **Acceptance Criteria**:

  ```bash
  # Verify widget files exist
  ls widgets/QuotaWidget.tsx widgets/widgetTaskHandler.ts
  # Expected: Both files exist

  # Verify app.json widget config
  cat app.json | grep -A10 "react-native-android-widget"
  # Expected: Widget configuration with name "CopilotQuota"

  # Local build verification (manual):
  # 1. Build: npx expo prebuild && npx expo run:android
  # 2. App installs and launches on device/emulator
  # 3. Long-press home screen → Add widget
  # 4. Find "CopilotQuota" widget
  # 5. Add to home screen
  # 6. Verify displays quota or "Sign in required"
  ```

  **Commit**: YES
  - Message: `feat(widget): add Android home screen widget`
  - Files: `widgets/*.tsx`, `widgets/*.ts`, `index.js` (if modified), `app.json`

---

- [ ] 12. iOS Widget Setup

  **What to do**:
  - Run `npx create-target widget` to scaffold iOS widget target
  - Configure `/targets/widget/` Swift files:
    - Create `QuotaWidget.swift` with WidgetKit implementation
    - Create `QuotaData.swift` model matching QuotaInfo
    - Implement Small, Medium, Large widget views
    - Read from App Groups UserDefaults
  - Update `app.json`:
    - Add @bacons/apple-targets plugin config
    - Set Apple Team ID placeholder: `[APPLE_TEAM_ID]`
  - Create helper to write data to App Groups:
    - Use react-native-shared-group-preferences
    - Group ID: `group.com.nearform.copilotstatus`

  **Must NOT do**:
  - DO NOT implement Live Activities
  - DO NOT implement Lock Screen widgets
  - DO NOT implement interactive widget actions

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: iOS native code (Swift) + complex config
  - **Skills**: None (requires Swift knowledge)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 11)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 6, 10

  **References**:
  - Librarian research on @bacons/apple-targets
  - PRD Section 2.3.1 - iOS widget specifications
  - PRD Section 3.4.2 - iOS configuration

  **Acceptance Criteria**:

  ```bash
  # Verify widget target created
  ls targets/widget/
  # Expected: Swift files for widget

  # Verify app.json config
  cat app.json | grep -A5 "apple-targets"
  # Expected: @bacons/apple-targets plugin config

  # Local build verification (manual):
  # 1. Set APPLE_TEAM_ID in app.json (replace [APPLE_TEAM_ID] placeholder)
  # 2. Build: npx expo prebuild && npx expo run:ios
  # 3. App installs and launches on device/simulator
  # 4. Long-press home screen → Add widget
  # 5. Find "Copilot Status" widget (3 sizes)
  # 6. Add each size to home screen
  # 7. Verify displays quota or "Sign in required"
  ```

  **Commit**: YES
  - Message: `feat(widget): add iOS WidgetKit widgets`
  - Files: `targets/widget/*.swift`, `app.json`

---

### Wave 5: Background & Integration

- [ ] 13. Background Task

  **What to do**:
  - Create `/tasks/quota-refresh.ts`:
    - Define task with expo-task-manager
    - Implement refresh logic:
      1. Get token from secure store
      2. If no token, return Success (nothing to do)
      3. Fetch quota from API
      4. Save to MMKV storage
      5. Return Success or Failed based on result
  - Register task in app entry point
  - Configure task:
    - Minimum interval: 60 minutes
    - Requires network connection
  - Add unregister on sign out

  **Must NOT do**:
  - DO NOT show notifications on refresh
  - DO NOT retry on failure (wait for next interval)
  - DO NOT implement more frequent refresh

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward background task pattern
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Task 14)
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 5, 10

  **References**:
  - Librarian research on expo-background-task
  - `services/api.ts` - API client (from Task 5)
  - `services/storage.ts` - MMKV storage (from Task 3)

  **Acceptance Criteria**:

  ```bash
  # Verify task file exists
  cat tasks/quota-refresh.ts | grep "defineTask"
  # Expected: TaskManager.defineTask call

  # Verify registration
  cat tasks/quota-refresh.ts | grep "registerTaskAsync"
  # Expected: BackgroundTask.registerTaskAsync call

  # Manual verification:
  # 1. Sign in to app
  # 2. Check console logs for task registration
  # 3. Wait 15+ minutes (or trigger manually in dev)
  # 4. Check MMKV storage updated
  ```

  **Commit**: YES
  - Message: `feat(background): add hourly quota refresh task`
  - Files: `tasks/quota-refresh.ts`, entry point modifications

---

- [ ] 14. Widget Data Sync Service

  **What to do**:
  - Create `/services/widgets.ts`:
    - `syncWidgetData(quota: QuotaInfo)` - Writes quota to widget storage
    - For Android: MMKV is automatically shared
    - For iOS: Use react-native-shared-group-preferences
    - `clearWidgetData()` - Clears widget storage on sign out
  - Integrate sync into quota store:
    - Call syncWidgetData after successful fetch
    - Call clearWidgetData on sign out
  - Trigger widget refresh:
    - Android: Use requestWidgetUpdate from react-native-android-widget
    - iOS: WidgetKit refreshes on UserDefaults change (automatic)

  **Must NOT do**:
  - DO NOT implement manual widget refresh button
  - DO NOT sync on every store update (only on fetch)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Integration of existing pieces
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Task 13)
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 6, 11, 12

  **References**:
  - `services/storage.ts` - MMKV storage
  - `stores/quota.ts` - Quota store
  - Librarian research on widget data sharing patterns

  **Acceptance Criteria**:

  ```bash
  # Verify service exists
  cat services/widgets.ts | grep -E "syncWidgetData|clearWidgetData"
  # Expected: Both functions exported

  # Verify integration
  cat stores/quota.ts | grep "syncWidgetData"
  # Expected: Called after successful fetch

  # Manual verification:
  # 1. Sign in and load dashboard
  # 2. Check widget updates with current data
  # 3. Pull-to-refresh
  # 4. Check widget updates
  # 5. Sign out
  # 6. Check widget shows "Sign in required"
  ```

  **Commit**: YES
  - Message: `feat(widgets): add widget data sync service`
  - Files: `services/widgets.ts`, `stores/quota.ts` modifications

---

- [ ] 15. Final Integration & Polish

  **What to do**:
  - Test complete user flow:
    1. Fresh install → Login screen
    2. OAuth sign in → Dashboard with data
    3. Add widgets → Show quota
    4. Background refresh → Widgets update
    5. Sign out → Return to login, widgets show "Sign in"
  - Fix any integration issues found
  - Add error boundaries for crash protection
  - Ensure cached data indicator shows correctly
  - Verify all status colors work (test with mock data)
  - Clean up any unused starter code
  - Update README with setup instructions

  **Must NOT do**:
  - DO NOT add new features
  - DO NOT refactor working code
  - DO NOT add tests (manual verification sufficient)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Final polish and integration testing
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO (final integration)
  - **Parallel Group**: Wave 5 - Final
  - **Blocks**: None (end of plan)
  - **Blocked By**: Tasks 13, 14

  **References**:
  - All previous task outputs
  - PRD Section 4.1 - User flows
  - PRD Section 4.2 - Error states

  **Acceptance Criteria**:

  ```
  # Complete E2E flow verification:
  1. Fresh install test
  2. OAuth flow test
  3. Dashboard displays correctly
  4. Pull-to-refresh works
  5. Settings shows username, sign out works
  6. Android widget displays data
  7. iOS widgets (3 sizes) display data
  8. Sign out clears widgets
  9. Background task registered (check logs)

  # Screenshot evidence:
  - .sisyphus/evidence/task-15-e2e-login.png
  - .sisyphus/evidence/task-15-e2e-dashboard.png
  - .sisyphus/evidence/task-15-e2e-android-widget.png
  - .sisyphus/evidence/task-15-e2e-ios-widget-small.png
  - .sisyphus/evidence/task-15-e2e-ios-widget-medium.png
  - .sisyphus/evidence/task-15-e2e-ios-widget-large.png
  ```

  **Commit**: YES
  - Message: `chore(polish): final integration and cleanup`
  - Files: Various cleanup, README.md

---

## Commit Strategy

| After Task | Message                                                 | Files                                             | Verification         |
| ---------- | ------------------------------------------------------- | ------------------------------------------------- | -------------------- |
| 1          | `chore(setup): add dependencies and configure app.json` | package.json, app.json                            | npm install succeeds |
| 2          | `feat(types): add quota types and API constants`        | types/, constants/                                | TypeScript compiles  |
| 3          | `feat(storage): add MMKV storage layer`                 | services/storage.ts                               | Import works         |
| 4          | `feat(auth): add GitHub OAuth service and auth store`   | services/auth.ts, stores/auth.ts                  | TypeScript compiles  |
| 5          | `feat(api): add GitHub Copilot API client`              | services/api.ts                                   | curl test passes     |
| 6          | `feat(store): add quota store with MMKV persistence`    | stores/quota.ts, hooks/useQuota.ts                | Import works         |
| 7          | `feat(auth): add login screen with GitHub OAuth`        | app/(auth)/_.tsx, components/auth/_.tsx           | UI renders           |
| 8          | `feat(dashboard): add quota visualization components`   | components/dashboard/\*.tsx, app/(tabs)/index.tsx | UI renders           |
| 9          | `feat(settings): add settings screen with sign out`     | app/(tabs)/settings.tsx, app/(tabs)/\_layout.tsx  | UI renders           |
| 10         | `feat(navigation): integrate auth flow with navigation` | app/\_layout.tsx                                  | Auth flow works      |
| 11         | `feat(widget): add Android home screen widget`          | widgets/\*.tsx, app.json                          | Widget shows         |
| 12         | `feat(widget): add iOS WidgetKit widgets`               | targets/widget/\*.swift, app.json                 | Widget shows         |
| 13         | `feat(background): add hourly quota refresh task`       | tasks/quota-refresh.ts                            | Task registers       |
| 14         | `feat(widgets): add widget data sync service`           | services/widgets.ts                               | Widgets update       |
| 15         | `chore(polish): final integration and cleanup`          | Various                                           | E2E works            |

---

## Success Criteria

### Verification Commands

```bash
# Check all dependencies installed
npm ls zustand react-native-mmkv expo-auth-session expo-secure-store

# Verify TypeScript compiles
npx tsc --noEmit

# Verify Expo config valid
npx expo config --type introspect

# Build development client (local builds)
npx expo prebuild
npx expo run:android  # For Android
npx expo run:ios      # For iOS
```

### Final Checklist

- [ ] All "Must Have" features present
- [ ] All "Must NOT Have" items absent
- [ ] OAuth flow works on both platforms
- [ ] Dashboard shows correct data
- [ ] Widgets work on both platforms
- [ ] Background task registered
- [ ] Error states handled gracefully
- [ ] Cached data indicator works
- [ ] Sign out clears all data
