# Product Requirements Document (PRD)

## GitHub Copilot Status - Mobile Application

**Version:** 1.0.0  
**Last Updated:** January 29, 2026  
**Platform:** iOS & Android (Flutter)

---

## 1. Executive Summary

### 1.1 Product Overview

GitHub Copilot Status is a cross-platform mobile application that enables users to monitor their personal GitHub Copilot quota usage in real-time. The app provides both an in-app dashboard and native home screen widgets (iOS & Android) to track request quotas, usage percentages, and reset schedules.

### 1.2 Target Audience

- GitHub Copilot subscribers
- Developers who need to monitor their Copilot request usage
- Users who want quick access to quota information via home screen widgets

### 1.3 Key Value Proposition

- **Real-time Monitoring**: Track Copilot request quota usage instantly
- **Native Experience**: System browser OAuth, native home screen widgets
- **Offline Support**: Cached data ensures widgets work without network
- **Background Sync**: Automatic hourly quota refresh
- **Multi-language Support**: Fully internationalized UI

---

## 2. Features & Capabilities

### 2.1 Authentication

#### 2.1.1 GitHub OAuth Sign-In

**Description**: Users authenticate via GitHub's OAuth 2.0 flow using the system browser for a native experience.

**Technical Implementation**:

- Opens system browser for GitHub login (not in-app WebView)
- Custom URL scheme callback: `com.nearform.copilotstatus://oauth`
- Manual token exchange via Dio HTTP client
- Requires GitHub OAuth App with Client ID and Client Secret

**User Flow**:

1. User taps "Sign in with GitHub" button
2. System browser opens GitHub authorization page
3. User authorizes the app (scopes: `read:org`, `read:user`)
4. Browser redirects back to app via custom URL scheme
5. App exchanges authorization code for access token
6. App fetches initial quota data
7. User is navigated to dashboard

**Security**:

- Access tokens stored in encrypted
- Client secret embedded in APK (acceptable for personal use)
- Token refresh supported (if GitHub provides refresh tokens)

**Error Handling**:

- User cancellation: Shows dismissible error message
- Network failure: Shows error with retry option
- Invalid credentials: Shows error message with details

---

### 2.2 Dashboard Screen

#### 2.2.1 Quota Visualization

**Description**: Primary screen displaying GitHub Copilot quota status in a visually clear format.

**Visual Components**:

1. **Circular Progress Indicator** (Center)
   - Displays remaining quota as large number
   - Shows "of [total]" below number
   - Color-coded by status:
     - Green: > 50% remaining (Good)
     - Orange: 20-50% remaining (Warning)
     - Red: < 20% remaining (Critical)
   - Progress ring around the number matches the status color

2. **Stats Card** (Below circle)
   - **Usage Row**:
     - Icon: Timeline icon
     - Label: "Usage"
     - Value: "[percentage]% remaining"
   - **Resets Row**:
     - Icon: Schedule icon
     - Label: "Resets"
     - Value: Human-readable time (e.g., "Resets in 15 days")
   - **Overage Row** (if applicable):
     - Icon: Warning icon (orange)
     - Label: "Overage"
     - Value: "[count] requests"

3. **Cached Data Indicator** (if shown)
   - Small banner at bottom of card
   - Info icon + "Showing cached data" text
   - Appears when network fetch fails but cached data exists

**Interactions**:

- **Pull-to-Refresh**: Swipe down to manually refresh quota data
- **Refresh Button** (AppBar): Icon button to trigger manual refresh
- **Sign Out Button** (AppBar): Icon button to log out

**Data Source**:

- Primary: GitHub API endpoint `/copilot_internal/user`
- Fallback: Cached data from SharedPreferences

**Localization**:

- All text uses `flutter_i18n` with translation keys
- Reset time supports singular/plural forms
- Percentage formatting locale-aware

---

### 2.3 Home Screen Widgets

#### 2.3.1 iOS Widget (WidgetKit)

**Supported Sizes**:

1. **Small Widget** (2x2)
   - Username
   - Remaining/Total quota
   - Status indicator (✓/⚠️/❌)
   - Reset time countdown

2. **Medium Widget** (4x2)
   - Username + GitHub Copilot label
   - Quota section with percentage
   - Reset section with countdown
   - Overage indicator (if applicable)

3. **Large Widget** (4x4)
   - Full quota breakdown
   - Metric rows with icons
   - Progress bar at bottom
   - Overage details (if applicable)

**Update Frequency**:

- Timeline updates every 15 minutes
- Uses cached data from App Group shared container
- No network requests from widget itself

**Data Source**:

- App Group: `group.com.nearform.copilotstatus`
- Shared UserDefaults key: `flutter.quotaInfo`
- JSON format: `QuotaData` struct

**Placeholder State**:

- Shows sample data when no real data available
- Username: "user"
- Total Quota: 2000
- Used Quota: 500

**No Data State**:

- Lock icon
- "Sign in required" message
- Gray background overlay

---

#### 2.3.2 Android Widget (AppWidget)

**Description**: Single-size home screen widget displaying quota information.

**Layout Components**:

- Title: "GitHub Copilot"
- Username display
- Quota: "[remaining] / [total] requests"
- Status indicator: ✓ Good / ⚠️ Low / ❌ Critical
- Percentage: "[percent]% remaining"
- Reset time: Human-readable countdown
- Update timestamp: "Updated just now"

**Update Triggers**:

- App data change (CopilotService saves to SharedPreferences)
- System widget update broadcast
- App launch/resume

**Data Source**:

- SharedPreferences: "FlutterSharedPreferences"
- Key: `flutter.quotaInfo`
- JSON format: `QuotaData` class

**No Data State**:

- Title: "GitHub Copilot"
- Subtitle: "Sign in required"
- All other fields: Empty or "No data"

---

### 2.4 Background Services

#### 2.4.1 Periodic Quota Refresh

**Description**: Automatically fetches updated quota data in the background to keep widgets current.

**Implementation**:

- Uses `workmanager` package for Flutter
- Task Name: `copilot_metrics_refresh`
- Unique Task ID: `copilot_refresh_task`

**Schedule**:

- Frequency: Every 1 hour
- Constraints:
  - Network connection required
  - Battery not low (Android)
  - No constraints for iOS (respects system limits)

**Behavior**:

- Runs in background isolate
- Fetches quota via `CopilotService.refreshQuota()`
- Updates SharedPreferences/UserDefaults
- Widgets automatically refresh with new data
- Silent failure: No user notification on error

**Lifecycle**:

- Registered on app first launch
- Continues until user uninstalls or explicitly cancels
- Survives app termination
- Respects system background execution limits

---

### 2.5 Data Architecture

#### 2.5.1 Data Models

**QuotaInfo** (Dart)

```dart
class QuotaInfo {
  final String username;         // GitHub username
  final int totalQuota;          // Total request quota
  final int usedQuota;           // Used request count
  final DateTime resetDate;      // ISO8601 UTC timestamp
  final bool hasOverage;         // Overage flag
  final int overageCount;        // Overage request count

  // Computed properties
  int get remainingQuota;        // totalQuota - usedQuota
  double get percentRemaining;   // (remaining / total) * 100
  QuotaStatus get status;        // good/warning/critical
  String resetTimeHuman(context); // Localized human time
}
```

**QuotaStatus** (Enum)

- `good`: > 50% remaining (Green)
- `warning`: 20-50% remaining (Orange)
- `critical`: < 20% remaining (Red)

**QuotaData** (iOS Swift, Android Kotlin)

- Mirror of `QuotaInfo` for native widgets
- Codable/Serializable for JSON conversion
- Stored in platform-specific shared storage

---

#### 2.5.2 Data Flow

**Authentication Flow**:

```
User → AuthService.signIn()
  ↓
flutter_appauth.authorize() → System Browser
  ↓
GitHub OAuth → Authorization Code
  ↓
post(tokenEndpoint) → Access Token
  ↓
 Encrypted Storage
```

**Quota Fetch Flow**:

```
CopilotService.fetchQuota()
  ↓
GitHubApiClient.fetchCopilotQuota()
  ↓
GET /copilot_internal/user
  Headers:
    - Authorization: Bearer [token]
    - Editor-Version: vscode/1.96.2
    - User-Agent: GitHubCopilotChat/0.26.7
  ↓
QuotaInfo.fromGitHubResponse()
  ↓
WidgetStorageService.saveQuotaInfo()
  ↓
SharedPreferences (Android) / UserDefaults (iOS)
  ↓
Native Widgets Read Data
```

**Background Refresh Flow**:

```
WorkManager (every 1 hour)
  ↓
callbackDispatcher() → Background Isolate
  ↓
CopilotService.refreshQuota()
  ↓
[Same as Quota Fetch Flow]
  ↓
Widgets Auto-Update
```

---

#### 2.5.3 Storage Layers

**1. Secure Storage** (`flutter_secure_storage`)

- **Purpose**: OAuth tokens
- **Keys**:
  - `github_access_token`: Access token
  - `github_refresh_token`: Refresh token (if available)
  - `github_token_expiry`: ISO8601 expiry timestamp
  - `github_user_login`: Username cache
- **Encryption**: Platform-specific (Keychain/KeyStore)

**2. SharedPreferences** (`shared_preferences`)

- **Purpose**: Widget data (non-sensitive)
- **Key**: `flutter.quotaInfo`
- **Format**: JSON string of `QuotaInfo`
- **Access**: Flutter app + Android widget

**3. iOS App Group UserDefaults**

- **Purpose**: Widget data for iOS
- **Group**: `group.com.nearform.copilotstatus`
- **Key**: `flutter.quotaInfo`
- **Format**: JSON string of `QuotaData`
- **Access**: Flutter app + iOS WidgetExtension

---

### 2.6 Internationalization

#### 2.6.1 Language Support

**Current**: English (en)
**Architecture**: Fully prepared for additional languages

**Translation System**:

- Package: `flutter_i18n` (v0.37.1)
- Translation files: `assets/flutter_i18n/[locale].json`
- 29 translation keys covering all user-facing text

**Key Categories**:

1. **App Structure**: appTitle, widgetDescription
2. **Authentication**: signInWithGitHub, signInCancelledOrFailed
3. **Actions**: refresh, signOut, retry
4. **Dashboard**: usage, resets, overage, requestsLeft
5. **Time Formats**: Plural-aware (days/day, hours/hour, minutes/minute)
6. **Status Messages**: noData, showingCachedData

**Adding New Language**:

1. Copy `assets/flutter_i18n/en.json`
2. Rename to `[locale].json` (e.g., `it.json` for Italian)
3. Translate all values
4. Add locale to `lib/main.dart` supportedLocales

**Dynamic Content**:

- Uses `translationParams` for runtime values
- Example: `resetsInDays: "Resets in {days} day"`
- Handles singular/plural forms automatically

---

## 3. Technical Architecture

### 3.1 Tech Stack

**Framework**: Flutter 3.2.0+

- **Language**: Dart
- **Minimum SDK**: Android API 21+ (Lollipop), iOS 12+
- **Target SDK**: Android API 35, iOS 17

**Native Platforms**:

- **iOS**: Swift, WidgetKit, SwiftUI
- **Android**: Kotlin, AppWidget, RemoteViews

---

### 3.2 API Integration

#### 3.2.1 GitHub Copilot Internal API

**Endpoint**: `GET https://api.github.com/copilot_internal/user`

**Required Headers**:

```
Authorization: Bearer [access_token]
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
Editor-Version: vscode/1.96.2
User-Agent: GitHubCopilotChat/0.26.7
```

**Response Format**:

```json
{
  "username": "user123",
  "quota_reset_date_utc": "2026-02-28T00:00:00Z",
  "quota_snapshots": {
    "premium_interactions": {
      "entitlement": 2000,
      "percent_remaining": 75.5,
      "overage_count": 0
    }
  }
}
```

**Response Mapping**:

- `username` → QuotaInfo.username
- `quota_reset_date_utc` → QuotaInfo.resetDate
- `entitlement` → QuotaInfo.totalQuota
- `percent_remaining` → Used to calculate QuotaInfo.usedQuota
- `overage_count` → QuotaInfo.overageCount

**Error Handling**:

- 401 Unauthorized: Token expired/invalid → Refresh token or re-auth
- 403 Forbidden: No Copilot access → Show error message
- 429 Rate Limited: Parse `X-RateLimit-Reset` header → Wait until reset
- 5xx Server Error: Fallback to cached data
- Network Error: Fallback to cached data

**ETag Caching**:

- Dio interceptor adds `If-None-Match` header
- 304 Not Modified: Return cached response
- Reduces API calls and bandwidth

---

### 3.3 Security Considerations

#### 3.3.1 Current Security Measures

**Token Storage**:

- Access tokens: Encrypted
- Never logged or exposed in UI

**Client Secret**:

- ⚠️ **Embedded in APK/IPA**: Retrievable via reverse engineering
- Environment variable in `.env` file (gitignored)
- Acceptable risk for:
  - Personal use applications
  - Limited distribution (not on public stores)
  - Internal enterprise apps
- **Not recommended** for:
  - Public apps on Google Play / App Store
  - Open source distributions

**Network Security**:

- All API calls over HTTPS
- Certificate pinning: Not implemented (rely on system trust)

**Permissions**:

- Android: `INTERNET`, `WAKE_LOCK`, `RECEIVE_BOOT_COMPLETED`
- iOS: No special permissions required

---

#### 3.3.2 Security Improvements for Public Release

**For public distribution**, implement:

1. **Backend Token Proxy**:
   - Move token exchange to secure backend
   - Client secret never leaves server
   - Mobile app only receives tokens, not secret

2. **Certificate Pinning**:
   - Pin GitHub API certificates
   - Prevent man-in-the-middle attacks

3. **Token Rotation**:
   - Implement refresh token flow
   - Shorter access token lifetimes

4. **Code Obfuscation**:
   - Enable Dart code obfuscation in release builds
   - Use ProGuard (Android) / bitcode (iOS)

---

### 3.4 Build Configuration

#### 3.4.1 Environment Setup

**Required Files**:

1. `.env` (root directory, gitignored)

   ```
   GITHUB_CLIENT_ID=your_oauth_client_id
   GITHUB_CLIENT_SECRET=your_oauth_client_secret
   ```

2. `.env.example` (committed to repo)
   - Template for developers
   - Contains placeholder values

**GitHub OAuth App Configuration**:

- Authorization callback URL: `com.nearform.copilotstatus://oauth`
- Application name: (User's choice)
- Homepage URL: (Optional)
- Scopes: `read:org`, `read:user`

---

**AndroidManifest.xml**:

- Intent filter for OAuth callback
- Widget receiver registration
- Required permissions

---

#### 3.4.2 iOS Configuration

**Requirements**:

- Xcode 15+
- iOS Deployment Target: 12.0+
- App Groups capability enabled

**App Groups**:

- Group ID: `group.com.nearform.copilotstatus`
- Targets: Runner (main app) + WidgetExtension

**Info.plist** (automatically generated):

- URL Schemes: `com.nearform.copilotstatus`
- LSApplicationQueriesSchemes: For URL scheme checks

---

## 4. User Experience

### 4.1 User Flows

#### 4.1.1 First-Time User Flow

1. **App Launch** → Login Screen
2. **Tap "Sign in with GitHub"** → System browser opens
3. **Authorize on GitHub** → Browser redirects back
4. **Token exchange** (automatic) → Loading indicator
5. **Fetch initial quota** → Loading indicator
6. **Dashboard loads** → Quota displayed
7. **Add widget to home screen** (optional)

**Success Criteria**:

- User can complete OAuth in < 30 seconds
- Dashboard loads within 2 seconds of authorization
- No errors or confusing messages

---

#### 4.1.2 Returning User Flow

1. **App Launch** → Auth check (< 1 second)
2. **Dashboard loads** → Shows cached data immediately
3. **Background refresh** (if needed) → Updates displayed data
4. **Widget updates** (every 15 min) → Home screen reflects changes

**Success Criteria**:

- App opens directly to dashboard (no login screen)
- Cached data shown within 500ms
- Fresh data loaded within 2 seconds

---

#### 4.1.3 Widget Setup Flow (iOS)

1. **Long-press home screen** → Widget gallery
2. **Search "Copilot"** or scroll to find widget
3. **Select widget size** (Small/Medium/Large)
4. **Add to home screen** → Widget appears
5. **Widget shows data** (if signed in) or "Sign in required"

---

#### 4.1.4 Widget Setup Flow (Android)

1. **Long-press home screen** → Widgets menu
2. **Find "GitHub Copilot"** widget
3. **Drag to home screen** → Widget appears
4. **Widget shows data** (if signed in) or "Sign in required"

---

### 4.2 Error States

#### 4.2.1 Network Errors

**Scenario**: No internet connection or API unreachable

**Behavior**:

- Dashboard: Shows cached data with "Showing cached data" banner
- Widget: Continues showing last known data
- Refresh button: Shows error message on tap
- Background service: Silently fails, retries next hour

**User Message**: "Unable to fetch latest data. Showing cached information."

---

#### 4.2.2 Authentication Errors

**Scenario**: Token expired, invalid, or user revoked access

**Behavior**:

- App redirects to login screen
- Cached data cleared
- Widgets show "Sign in required"

**User Message**: "Your session has expired. Please sign in again."

---

#### 4.2.3 No Copilot Access

**Scenario**: User doesn't have GitHub Copilot subscription

**Behavior**:

- API returns 403 Forbidden
- Dashboard shows error state
- Clear error message explaining the issue

**User Message**: "GitHub Copilot subscription required. Please subscribe at github.com/features/copilot"

---

## 5. Future Enhancements

### 5.1 Planned Features (Not Yet Implemented)

1. **Usage History Charts**
   - Track quota usage over time
   - Show daily/weekly trends
   - Visualize consumption patterns

2. **Push Notifications**
   - Alert when quota drops below threshold (e.g., < 20%)
   - Notify when quota resets
   - Customizable notification preferences

3. **Multiple Account Support**
   - Switch between different GitHub accounts
   - Compare quota across accounts

4. **Enhanced Widgets**
   - iOS Live Activities (Dynamic Island)
   - iOS Lock Screen widgets
   - Android Material You themed widgets
   - Interactive widget actions (refresh, view details)

5. **Dark Mode Customization**
   - Widget theme options
   - Follow system theme or manual override

6. **Export/Sharing**
   - Export usage data as CSV
   - Share quota status as image

7. **Rate Limit Tracking**
   - Display GitHub API rate limit status
   - Warn when approaching rate limits

---

### 5.2 Known Limitations

1. **GitHub API Dependency**:
   - Uses undocumented internal endpoint (`/copilot_internal/user`)
   - May break if GitHub changes API without notice
   - No official support from GitHub

2. **Client Secret Security**:
   - Embedded in APK (not suitable for public distribution)
   - Requires backend proxy for production release

3. **Widget Update Frequency**:
   - iOS: Limited by system (15-minute minimum)
   - Android: Limited by WorkManager (1-hour minimum)
   - Cannot update more frequently without battery drain

4. **No iPad/Tablet Optimization**:
   - UI designed for phone screens
   - Works on tablets but not optimized

5. **No Desktop Support**:
   - Not implemented in this version

---

## 6. Metrics & Success Criteria

### 6.1 Performance Metrics

**Target Performance**:

- App launch to dashboard: < 2 seconds
- OAuth flow completion: < 30 seconds
- API response time: < 1 second (90th percentile)
- Widget update latency: < 500ms after data change
- Background refresh success rate: > 95%

---

### 6.2 Quality Metrics

**Code Quality**:

- Zero critical analyzer warnings
- No compiler errors or warnings
- Dart analysis score: > 95/100

**Stability**:

- Crash-free rate: > 99%
- API error handling: 100% coverage
- Offline functionality: 100% widget data available

---

## 7. Maintenance & Operations

### 7.1 Monitoring

**Recommended Tracking** (not currently implemented):

- Crash reporting: Firebase Crashlytics
- Analytics: Firebase Analytics
- API error rates
- Background task success rates
- User retention metrics

---

### 7.2 Deployment

**Current State**:

- Development builds only
- No app store distribution

**For Production**:

1. Set up CI/CD pipeline (GitHub Actions, Codemagic)
2. Configure app signing (Android/iOS)
3. Create store listings (Google Play, App Store)
4. Submit for review
5. Release to beta testers
6. Gradual rollout to production

---

### 7.3 Versioning

**Current**: 1.0.0+1

- **Format**: `MAJOR.MINOR.PATCH+BUILD`
- **Example**: 1.0.0 (version) + 1 (build number)

**Update Strategy**:

- Patch: Bug fixes (1.0.1)
- Minor: New features, backward compatible (1.1.0)
- Major: Breaking changes (2.0.0)

---

## 8. Documentation

### 8.1 Developer Documentation

**Setup Guides**:

- `SETUP_GUIDE.md`: Comprehensive setup instructions
- `QUICKSTART.md`: Quick reference for developers
- `OAUTH_PLATFORM_EXCEPTION_FIX.md`: OAuth troubleshooting
- `.env.example`: Environment variable template

**Code Documentation**:

- Inline comments for complex logic
- DartDoc comments for public APIs
- README.md for project overview

---

### 8.2 User Documentation

**In-App**:

- Error messages with actionable guidance
- Localized help text

**External** (recommended for production):

- User guide with screenshots
- FAQ section
- Troubleshooting guide
- Privacy policy
- Terms of service

---

## 9. Compliance & Legal

### 9.1 Privacy

**Data Collection**:

- GitHub username (public data)
- OAuth access token (encrypted, not shared)
- Quota usage numbers (public data via API)

**Data Storage**:

- Local device only (encrypted for tokens)
- No server-side storage
- No third-party analytics (currently)

**Data Sharing**:

- None (except GitHub API calls)

---

### 9.2 GitHub Terms of Service

**Compliance**:

- Respects GitHub API rate limits
- Uses OAuth for authentication (best practice)
- Does not store passwords
- Complies with GitHub Acceptable Use Policies

**API Usage**:

- Uses internal endpoint (undocumented)
- May require approval for production use
- Should contact GitHub before large-scale distribution

---

## 10. Appendix

### 10.1 Glossary

- **Quota**: Number of Copilot requests available to user
- **Entitlement**: Total quota allocated per billing cycle
- **Overage**: Requests made beyond quota limit
- **Reset Date**: When quota resets to full entitlement
- **ETag**: HTTP caching mechanism for unchanged data
- **OAuth**: Open Authorization standard for secure access
- **WidgetKit**: iOS framework for home screen widgets
- **AppWidget**: Android framework for home screen widgets
- **WorkManager**: Android background task scheduler

---

### 10.2 Acronyms

- **PRD**: Product Requirements Document
- **UI**: User Interface
- **UX**: User Experience
- **API**: Application Programming Interface
- **SDK**: Software Development Kit
- **APK**: Android Package Kit
- **IPA**: iOS App Archive
- **CI/CD**: Continuous Integration/Continuous Deployment
- **JSON**: JavaScript Object Notation
- **HTTP**: Hypertext Transfer Protocol
- **HTTPS**: HTTP Secure

---

### 10.3 References

**External Documentation**:

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [WidgetKit (iOS)](https://developer.apple.com/documentation/widgetkit)
- [AppWidget (Android)](https://developer.android.com/develop/ui/views/appwidgets)

**Internal Documentation**:

- Project README.md
- SETUP_GUIDE.md
- QUICKSTART.md
- OAUTH_PLATFORM_EXCEPTION_FIX.md

---

## Document History

| Version | Date       | Author | Changes              |
| ------- | ---------- | ------ | -------------------- |
| 1.0.0   | 2026-01-29 | System | Initial PRD creation |

---

**End of Product Requirements Document**
