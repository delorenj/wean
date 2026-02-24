# Sprint Plan: Wean

**Date:** 2026-01-25
**Scrum Master:** Jarad DeLorenzo (Steve)
**Project Level:** 2
**Total Stories:** 22
**Total Points:** 115 points
**Planned Sprints:** 3
**Team Capacity:** 30 points per sprint (estimated)
**Target Completion:** March 2026

---

## Executive Summary

This sprint plan breaks down the Wean mobile app into 22 implementable user stories across 3 sprints. The plan includes MVP features (Must Have) and premium features (Should Have), with integrated support for the Kratie mascot (3D animated character) at key interaction points.

**Key Metrics:**
- Total Stories: 22
- Total Points: 115
- Sprints: 3 (2 weeks each = 6 weeks total)
- Team Capacity: 30 points per sprint (1 senior developer, 2-week sprints)
- Target Completion: Mid-March 2026

**Epic Breakdown:**
- EPIC-001 (Core Tracking): 6 stories, 31 points
- EPIC-002 (Visual Progress): 3 stories, 15 points
- EPIC-003 (User Foundation): 4 stories, 19 points
- EPIC-004 (Premium Features): 7 stories, 42 points
- EPIC-005 (Kratie Mascot): 2 stories, 8 points

---

## Story Inventory

### EPIC-001: Core Tracking (31 points, 6 stories)

#### STORY-001: Quick Dose Logging

**Epic:** EPIC-001 (Core Tracking)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want to log a Kratom dose in under 10 seconds
So that tracking doesn't interrupt my day

**Acceptance Criteria:**
- [ ] Add Dose screen accessible via FAB or "+" button
- [ ] Slider or numeric input for dose amount (0.1g - 50g range)
- [ ] Unit selector toggles between grams (g) and ounces (oz)
- [ ] Timestamp auto-captures current time (user can override with date/time picker)
- [ ] Optional notes field (256 character limit)
- [ ] Optional method field (dropdown: "Toss and wash", "Tea", "Capsules", "Other")
- [ ] Save completes with single tap, haptic feedback on iOS
- [ ] Dose appears immediately in daily timeline (optimistic UI)
- [ ] Offline support: Queue writes locally, sync when online
- [ ] Form validation: amount > 0, unit selected, timestamp valid

**Technical Notes:**
- Component: `AddDoseScreen.tsx` with `DoseForm` component
- Hook: `useDoses` for Firestore write operations
- Firestore: `doses-{uid}` collection, auto-generated doc ID
- Optimistic UI: Add to local state immediately, rollback on error
- Offline: Firestore SDK handles offline queuing automatically
- Unit conversion: Store in user-selected unit, convert on display

**Dependencies:**
- Firebase Auth (FR-006) must be complete
- Firestore collections initialized

---

#### STORY-002: Daily Dose Timeline

**Epic:** EPIC-001 (Core Tracking)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want to see all my doses for a selected day in chronological order
So that I can review my intake patterns

**Acceptance Criteria:**
- [ ] Timeline displays all doses for selected date (default: today)
- [ ] Each dose card shows: time, amount, unit, notes (if any), method (if any)
- [ ] Sort order: Newest first (configurable in settings)
- [ ] Tap dose card to edit dose details (navigates to edit screen)
- [ ] Swipe left to delete with confirmation dialog ("Delete this dose?")
- [ ] Pull-to-refresh updates from Firestore
- [ ] Empty state message when no doses logged for day: "No doses logged yet. Tap + to add your first dose."
- [ ] Running total displayed at bottom of list
- [ ] Real-time updates via Firestore listener (doses appear instantly)

**Technical Notes:**
- Component: `DoseTimeline.tsx` with `DoseCard` components
- Hook: `useDoses` with Firestore onSnapshot listener
- Query: `doses-{uid}` WHERE `date >= startOfDay AND date <= endOfDay` ORDER BY `date DESC`
- Firestore index: Composite index on `(date DESC, createdAt DESC)`
- Delete: Confirm dialog, then Firestore delete operation
- Edit: Navigate to AddDoseScreen with pre-filled form

**Dependencies:**
- STORY-001 (Quick Dose Logging)
- STORY-003 (Calendar Date Selection)

---

#### STORY-003: Rolling Calendar Week

**Epic:** EPIC-001 (Core Tracking)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want to navigate through a 7-day calendar strip
So that I can view doses for any recent day

**Acceptance Criteria:**
- [ ] Horizontal 7-day calendar strip displays Mon-Sun
- [ ] Current day highlighted visually (different color, bold text)
- [ ] Days with logged doses show indicator dot or fill color
- [ ] Tap day to select and view that day's doses in timeline
- [ ] Swipe left/right to navigate to previous/next weeks
- [ ] Shows day of week abbreviation (Mon, Tue, etc.) and date number
- [ ] Smooth animation when changing weeks
- [ ] Selected date persists across app restarts (AsyncStorage)
- [ ] Calendar updates in real-time (shows new doses as logged)

**Technical Notes:**
- Component: `CalendarStrip.tsx`
- Hook: `useDaily` for selected date state
- Library: React Native FlatList (horizontal) or custom implementation
- Persistence: AsyncStorage key `selectedDate`
- Date logic: `date-fns` for date manipulation
- Indicator dots: Query Firestore for dose counts per day (cache results)

**Dependencies:**
- STORY-001 (Quick Dose Logging)

---

#### STORY-004: Edit Dose

**Epic:** EPIC-001 (Core Tracking)
**Priority:** Must Have
**Points:** 3

**User Story:**
As a user
I want to edit a dose I entered incorrectly
So that my historical data stays accurate

**Acceptance Criteria:**
- [ ] Tap dose card in timeline navigates to edit screen
- [ ] Edit screen pre-fills form with existing dose data
- [ ] User can modify: amount, unit, timestamp, notes, method
- [ ] Save button updates existing dose in Firestore
- [ ] Cancel button returns to timeline without changes
- [ ] Updated dose appears in timeline with new values
- [ ] Timestamp shows "Edited" indicator if modified after creation
- [ ] Form validation same as add dose (amount > 0, etc.)

**Technical Notes:**
- Component: Reuse `AddDoseScreen.tsx` with `mode="edit"` prop
- Hook: `useDoses` for Firestore update operation
- Firestore: Update `doses-{uid}/{doseId}` with `updatedAt` timestamp
- Navigation: Pass `doseId` as route param to edit screen

**Dependencies:**
- STORY-001 (Quick Dose Logging)
- STORY-002 (Daily Dose Timeline)

---

#### STORY-005: Delete Dose

**Epic:** EPIC-001 (Core Tracking)
**Priority:** Must Have
**Points:** 2

**User Story:**
As a user
I want to delete a dose I logged by mistake
So that my daily totals are correct

**Acceptance Criteria:**
- [ ] Swipe left on dose card reveals delete button
- [ ] Tap delete shows confirmation dialog: "Delete this dose?"
- [ ] Confirm deletes dose from Firestore
- [ ] Cancel closes dialog, no action taken
- [ ] Deleted dose removed from timeline immediately
- [ ] Daily gauge updates to reflect new total
- [ ] Undo option (optional, stretch goal): "Undo" toast for 5 seconds

**Technical Notes:**
- Component: `DoseCard.tsx` with swipeable actions
- Library: `react-native-swipeable` or custom gesture handler
- Hook: `useDoses` for Firestore delete operation
- Firestore: Delete `doses-{uid}/{doseId}`
- Optimistic UI: Remove from local state immediately

**Dependencies:**
- STORY-002 (Daily Dose Timeline)

---

#### STORY-006: Offline Dose Sync

**Epic:** EPIC-001 (Core Tracking)
**Priority:** Must Have
**Points:** 11

**User Story:**
As a user
I want my doses to sync automatically when I regain internet connection
So that I never lose data even when offline

**Acceptance Criteria:**
- [ ] App works fully offline (read/write doses)
- [ ] Offline writes queued locally in Firestore cache
- [ ] When online, queued writes sync automatically to server
- [ ] UI shows sync status indicator ("Syncing...", "Offline", "Synced")
- [ ] No data loss during offline period
- [ ] Conflicts resolved (last-write-wins, acceptable for this use case)
- [ ] Settings screen shows last sync timestamp
- [ ] User can manually trigger sync ("Sync now" button)

**Technical Notes:**
- Firestore SDK handles offline persistence by default
- Enable offline persistence: `firestore().settings({ persistence: true })`
- Cache size: Unlimited (configurable via `cacheSizeBytes`)
- Sync indicator: Listen to Firestore `onSnapshotsInSync()` event
- Manual sync: Force refresh with `get({ source: 'server' })`

**Dependencies:**
- STORY-001 (Quick Dose Logging)
- Firebase Auth (FR-006)

---

### EPIC-002: Visual Progress (15 points, 3 stories)

#### STORY-007: Daily Dose Gauge

**Epic:** EPIC-002 (Visual Progress)
**Priority:** Must Have
**Points:** 8

**User Story:**
As a user
I want to see a circular gauge showing my daily total versus my target
So that I know at a glance whether I'm on track

**Acceptance Criteria:**
- [ ] Circular progress gauge displays on home screen
- [ ] Numeric display shows exact current amount and unit (e.g., "8.5g")
- [ ] Target amount shown (e.g., "Target: 10g" or "No target set")
- [ ] Color coding: Green (under 80% of target), Yellow (80-100%), Red (over 100%)
- [ ] Gauge animates smoothly when doses are added
- [ ] Tapping gauge navigates to goal settings (premium) or shows upgrade prompt (free)
- [ ] Displays "No target set" state gracefully if user hasn't configured goal
- [ ] Updates in real-time as doses are logged
- [ ] Handles unit conversions (grams/ounces) correctly

**Technical Notes:**
- Component: `DoseGauge.tsx` using React Native SVG
- Library: `react-native-svg` for circular progress
- Hook: `useDoses` for daily total calculation
- Calculation: Sum all doses for selected day, convert units if mixed
- Animation: `Animated` API or `react-native-reanimated`
- Target: Fetch from settings or taper plan (premium)

**Dependencies:**
- STORY-001 (Quick Dose Logging)
- STORY-002 (Daily Dose Timeline)
- STORY-013 (Goal Setting) for target integration

---

#### STORY-008: Dark/Light Theme Toggle

**Epic:** EPIC-002 (Visual Progress)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want to switch between dark mode and light mode
So that the app is comfortable to use at night or in bright environments

**Acceptance Criteria:**
- [ ] Settings screen includes theme toggle (switch or segmented control)
- [ ] Dark mode: Dark backgrounds (#121212), light text (#FFFFFF)
- [ ] Light mode: Light backgrounds (#FFFFFF), dark text (#000000)
- [ ] Theme preference persists to Firestore (`settings/{uid}/theme`)
- [ ] Theme applies immediately without app restart
- [ ] All screens respect theme selection consistently
- [ ] Status bar color adjusts with theme (dark status bar in light mode, light in dark mode)
- [ ] Charts and gauge colors adjust for theme (maintain contrast)

**Technical Notes:**
- Hook: `useSettings` for theme state management
- Context: `ThemeProvider` wraps app root
- Library: React Navigation themes + React Native Paper MD3 themes
- Firestore: `settings/{uid}` with `theme` field
- Colors: Define theme tokens in `constants/Colors.ts`
- Apply: Use `useTheme()` hook in components

**Dependencies:**
- STORY-010 (Settings Screen)
- Firebase Auth (FR-006)

---

#### STORY-009: Kratie Mascot Onboarding

**Epic:** EPIC-002 (Visual Progress)
**Priority:** Should Have
**Points:** 2

**User Story:**
As a new user
I want to be greeted by an animated mascot (Kratie) during onboarding
So that the app feels friendly and engaging

**Acceptance Criteria:**
- [ ] Kratie 3D asset loads in onboarding carousel (first screen)
- [ ] Kratie performs idle animation (breathing, subtle movements)
- [ ] Kratie wave animation plays when user taps "Next" on first screen
- [ ] Asset optimized for mobile (<5MB)
- [ ] Smooth 60fps animation
- [ ] Fallback to 2D illustration if 3D fails to load
- [ ] Accessible: Screen readers announce "Kratie, the Wean mascot, welcomes you"

**Technical Notes:**
- Asset: Kratie 3D model (glTF or FBX format)
- Library: `react-three-fiber` for 3D rendering or `expo-gl` with Three.js
- Animation: Skeletal animations exported from 3D tool (Blender, Maya)
- Optimization: Draco compression for glTF files
- Fallback: PNG/SVG 2D illustration in `assets/kratie/`

**Dependencies:**
- STORY-012 (Onboarding Flow)
- Kratie 3D asset delivery from design team

---

### EPIC-003: User Foundation (19 points, 4 stories)

#### STORY-010: Settings Screen

**Epic:** EPIC-003 (User Foundation)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want a settings screen to configure app preferences
So that I can customize my experience

**Acceptance Criteria:**
- [ ] Settings screen accessible via navigation tab
- [ ] Settings sections: App Preferences, Notifications, Account, About
- [ ] App Preferences: Theme toggle, default dose unit (g/oz), sort order (newest/oldest first)
- [ ] Notifications: Master toggle, reminder times (future)
- [ ] Account: Account deletion, data export
- [ ] About: App version, privacy policy link, terms of service link
- [ ] All settings persist to Firestore (`settings/{uid}`)
- [ ] Changes apply immediately (no "Save" button needed)
- [ ] Confirmation dialogs for destructive actions (delete account)

**Technical Notes:**
- Component: `SettingsScreen.tsx`
- Hook: `useSettings` for Firestore read/write
- Firestore: `settings/{uid}` doc with merge writes
- Library: React Native Paper `List` components for settings UI
- Deep links: Privacy policy and TOS hosted on Firebase Hosting

**Dependencies:**
- Firebase Auth (FR-006)
- STORY-008 (Dark/Light Theme) integrates here

---

#### STORY-011: Anonymous Authentication

**Epic:** EPIC-003 (User Foundation)
**Priority:** Must Have
**Points:** 3

**User Story:**
As a new user
I want to start using the app immediately without creating an account
So that I can begin tracking without friction

**Acceptance Criteria:**
- [ ] App automatically creates anonymous user on first launch
- [ ] Firebase Auth anonymous sign-in called silently (no user action needed)
- [ ] User ID (uid) returned and used for all Firestore operations
- [ ] Auth state persists across app restarts (no re-signin needed)
- [ ] Graceful handling of auth token expiration/refresh (SDK auto-handles)
- [ ] No signup form or account creation flow required
- [ ] User can optionally upgrade to email auth later (future premium feature)

**Technical Notes:**
- Hook: `useFireauth` wraps Firebase Auth operations
- Context: `FirebaseProvider` provides auth state to app
- Firebase: `firebase.auth().signInAnonymously()`
- Persistence: Firebase SDK persists auth tokens locally
- Firestore rules: Enforce uid-gated access (see Architecture doc)

**Dependencies:**
- None (foundational, runs on app launch)

---

#### STORY-012: Onboarding Flow

**Epic:** EPIC-003 (User Foundation)
**Priority:** Must Have
**Points:** 8

**User Story:**
As a new user
I want a 3-4 screen onboarding carousel
So that I understand the app's value before logging my first dose

**Acceptance Criteria:**
- [ ] Onboarding shows on first launch only (AsyncStorage flag)
- [ ] Screen 1: "Track your doses effortlessly" with Kratie animation (see STORY-009)
- [ ] Screen 2: "See your progress visually" with gauge preview
- [ ] Screen 3: "Create a personalized taper plan" (premium teaser)
- [ ] Screen 4: "Let's log your first dose" with CTA button
- [ ] Swipe or "Next" button to navigate between screens
- [ ] "Skip" button on all screens except last
- [ ] Final screen "Get Started" button navigates to Add Dose screen
- [ ] Onboarding dismissed permanently after completion
- [ ] Accessible: Screen readers announce each screen's content

**Technical Notes:**
- Component: `OnboardingCarousel.tsx`
- Library: `react-native-snap-carousel` or custom FlatList
- Persistence: AsyncStorage key `onboardingComplete`
- Navigation: Stack navigator, replace onboarding with main tabs after completion
- Illustrations: Static images or Lottie animations

**Dependencies:**
- STORY-011 (Anonymous Authentication) runs before onboarding
- STORY-009 (Kratie Mascot Onboarding) for Screen 1

---

#### STORY-013: Account Deletion

**Epic:** EPIC-003 (User Foundation)
**Priority:** Must Have
**Points:** 3

**User Story:**
As a user
I want to delete my account and all associated data
So that I can ensure my privacy if I stop using the app

**Acceptance Criteria:**
- [ ] Settings screen has "Delete Account" button (destructive red color)
- [ ] Tapping button shows confirmation dialog with warning text
- [ ] Confirmation requires user to type "DELETE" to proceed (prevent accidental deletion)
- [ ] Deletion triggers Cloud Function to delete all Firestore data
- [ ] Cloud Function deletes: `doses-{uid}` collection, `settings/{uid}`, `taperPlans/{uid}`
- [ ] Firebase Auth account deleted after Firestore cleanup
- [ ] Local storage cleared (AsyncStorage)
- [ ] User navigated back to onboarding/login screen
- [ ] Deletion completes within 24 hours (asynchronous cleanup)

**Technical Notes:**
- Component: Settings screen with delete button
- Cloud Function: `deleteUserData(uid)` callable function
- Firestore: Batch delete all user documents
- Firebase Auth: `user.delete()` after Firestore cleanup
- GDPR compliance: Ensure all user data removed

**Dependencies:**
- STORY-010 (Settings Screen)
- STORY-011 (Anonymous Authentication)
- Cloud Function deployment

---

### EPIC-004: Premium Features (42 points, 7 stories)

#### STORY-014: Freemium Paywall

**Epic:** EPIC-004 (Premium Features)
**Priority:** Must Have
**Points:** 8

**User Story:**
As a user
I want to purchase a premium subscription to unlock advanced features
So that I can access taper planning, analytics, and goal tracking

**Acceptance Criteria:**
- [ ] RevenueCat SDK integrated for iOS and Android
- [ ] Products configured in RevenueCat dashboard: Monthly ($9.99/month), Annual ($79.99/year)
- [ ] Paywall screen displays when accessing premium feature (taper plan, analytics, goals)
- [ ] Paywall shows: Feature benefits, pricing options, "Start 7-day free trial" CTA
- [ ] Purchase flow completes natively (App Store / Play Store)
- [ ] Subscription status syncs across devices via user ID
- [ ] "Restore Purchases" button for existing subscribers
- [ ] Graceful handling of purchase failures/cancellations (error messages)
- [ ] Free trial: 7-day trial for new users (configurable in RevenueCat)
- [ ] Premium features gated behind subscription check

**Technical Notes:**
- Library: `react-native-purchases` (RevenueCat SDK)
- Component: `PaywallScreen.tsx` with pricing cards
- Hook: `useRevenueCat` for subscription status
- Products: `wean_premium_monthly`, `wean_premium_annual`
- Entitlement: Check `customerInfo.entitlements.active['premium']`
- Testing: RevenueCat sandbox mode for development

**Dependencies:**
- STORY-011 (Anonymous Authentication) for user ID
- RevenueCat account setup, products configured
- App Store Connect / Play Console configured

---

#### STORY-015: Smart Taper Planner

**Epic:** EPIC-004 (Premium Features)
**Priority:** Should Have (Premium)
**Points:** 8

**User Story:**
As a premium user
I want an AI-assisted taper schedule generator
So that I have a personalized roadmap to reduce my intake gradually

**Acceptance Criteria:**
- [ ] Taper Plan screen accessible from navigation (premium gated)
- [ ] Input wizard collects: current daily average, target daily amount, timeline (weeks), strategy (gradual/aggressive)
- [ ] Algorithm generates daily targets using 5% (gradual) or 10% (aggressive) weekly reduction
- [ ] Accounts for Kratom's ~24-hour half-life in reduction curve
- [ ] Displays generated schedule as calendar view with daily targets
- [ ] User can manually adjust individual day targets (tap to edit)
- [ ] Plan saves to Firestore (`taperPlans/{uid}`)
- [ ] Plan becomes active, updates daily target in gauge (STORY-007)
- [ ] Option to regenerate plan if user gets off track ("Restart Plan" button)
- [ ] Paywall: Requires premium subscription, shows upgrade prompt if not subscribed

**Technical Notes:**
- Component: `TaperPlanScreen.tsx` with wizard flow
- Cloud Function: `generateTaperPlan(currentDailyAvg, targetAmount, timelineWeeks, strategy)`
- Firestore: `taperPlans/{uid}` with array of daily targets
- Algorithm: See Architecture doc Appendix C for implementation
- Calendar view: Custom component or library (`react-native-calendars`)

**Dependencies:**
- STORY-014 (Freemium Paywall)
- STORY-007 (Daily Dose Gauge) for target integration
- Cloud Function deployment

---

#### STORY-016: Weekly/Monthly Trend Analytics

**Epic:** EPIC-004 (Premium Features)
**Priority:** Should Have (Premium)
**Points:** 8

**User Story:**
As a premium user
I want charts showing my intake trends over time
So that I can measure my reduction progress

**Acceptance Criteria:**
- [ ] Analytics screen accessible from navigation (premium gated)
- [ ] Line chart: Daily totals over past 7/30/90 days (togglable)
- [ ] Bar chart: Weekly averages comparison (last 4-12 weeks)
- [ ] Summary stats: Average daily dose, total weekly, % change from prior period
- [ ] Streak counter: Days under target, consecutive reduction days
- [ ] Export chart as image (PNG) via system share sheet
- [ ] Charts render in <1 second for 90-day dataset
- [ ] Charts respect theme (dark/light mode)
- [ ] Paywall: Full analytics require premium; free tier shows 7-day sparkline only

**Technical Notes:**
- Component: `AnalyticsScreen.tsx` with charts
- Library: `react-native-chart-kit` or `victory-native` for charts
- Hook: `useDoses` to fetch historical data (paginated query)
- Firestore query: `doses-{uid}` WHERE `date >= 90 days ago` ORDER BY `date DESC`
- Export: `react-native-view-shot` to capture chart as image
- Performance: Memoize chart data calculations

**Dependencies:**
- STORY-014 (Freemium Paywall)
- STORY-001 (Quick Dose Logging) for historical data
- STORY-015 (Smart Taper Planner) for target comparison

---

#### STORY-017: Goal Setting & Milestones

**Epic:** EPIC-004 (Premium Features)
**Priority:** Should Have (Premium)
**Points:** 5

**User Story:**
As a premium user
I want to define personal reduction targets and track progress
So that I stay motivated with clear goals

**Acceptance Criteria:**
- [ ] Goal Setting screen accessible from gauge tap or settings (premium gated)
- [ ] User can set target daily amount (e.g., "5g/day")
- [ ] User can set target date (e.g., "by March 31")
- [ ] Progress percentage displayed prominently on home screen ("45% to goal")
- [ ] Milestone definitions: "First week under 10g", "7-day streak", "50% reduction achieved"
- [ ] Milestone celebrations: Badge animations, confetti effect when milestone unlocked
- [ ] Push notification when milestone unlocked (optional, requires STORY-018)
- [ ] Milestones screen shows history of unlocked achievements
- [ ] Paywall: Goal setting requires premium; free users see "upgrade to set goals"

**Technical Notes:**
- Component: `GoalSettingScreen.tsx`, `MilestonesScreen.tsx`
- Hook: `useDoses` to calculate progress toward goal
- Firestore: `settings/{uid}` with `goalDailyAmount`, `goalTargetDate`
- Milestone logic: Client-side checks in `useDoses` hook
- Animations: `lottie-react-native` for confetti, badge animations
- Kratie integration: Kratie celebration animation on milestone unlock

**Dependencies:**
- STORY-014 (Freemium Paywall)
- STORY-007 (Daily Dose Gauge) for progress display
- STORY-018 (Dose Reminders) for milestone notifications (optional)

---

#### STORY-018: Dose Reminders & Alerts

**Epic:** EPIC-004 (Premium Features)
**Priority:** Should Have (Premium)
**Points:** 5

**User Story:**
As a premium user
I want scheduled push notifications for planned doses and alerts when approaching my daily limit
So that I stay on track with my taper plan

**Acceptance Criteria:**
- [ ] Notification Settings screen in Settings (premium gated)
- [ ] User can schedule reminder times (e.g., "8am, 2pm, 8pm")
- [ ] Reminders prompt: "Time to log your dose" with quick-log action
- [ ] Alert when daily total reaches 80% of target: "Approaching your daily limit (8.5g / 10g)"
- [ ] Alert when over target: "You've exceeded your target for today (11g / 10g)"
- [ ] User can snooze or dismiss notifications
- [ ] Notification preferences: Enable/disable types (reminders, approaching limit, over target)
- [ ] Paywall: Requires premium subscription

**Technical Notes:**
- Library: `expo-notifications` for local notifications
- Component: Notification settings in `SettingsScreen.tsx`
- Scheduling: Local notifications scheduled at user-configured times
- Alerts: Triggered in `useDoses` hook when daily total reaches thresholds
- Firebase Cloud Messaging (FCM): Optional for server-side notifications (future)
- Permissions: Request notification permissions on first enable

**Dependencies:**
- STORY-014 (Freemium Paywall)
- STORY-010 (Settings Screen)
- STORY-007 (Daily Dose Gauge) for target thresholds

---

#### STORY-019: Export & Backup

**Epic:** EPIC-004 (Premium Features)
**Priority:** Should Have (Premium)
**Points:** 5

**User Story:**
As a premium user
I want to export my dose data and generate PDF reports
So that I can share my progress with a healthcare provider or keep personal records

**Acceptance Criteria:**
- [ ] Export screen accessible from settings (premium gated)
- [ ] Export formats: PDF report, CSV data, JSON data
- [ ] PDF report includes: Date range, daily totals, weekly averages, trend chart, goals, milestones
- [ ] PDF has professional layout with branding (Kratie logo)
- [ ] Share PDF via system share sheet (email, save to files, cloud storage)
- [ ] CSV export: Columns (Date, Time, Substance, Amount, Unit, Notes, Method)
- [ ] JSON export: Complete data dump (doses, settings, taper plans)
- [ ] Export date range selection (last 7/30/90 days or custom range)
- [ ] Paywall: Requires premium subscription

**Technical Notes:**
- Component: `ExportScreen.tsx`
- Library: `react-native-pdf` or `expo-print` for PDF generation
- Data fetching: Query Firestore for selected date range
- PDF generation: HTML template rendered to PDF
- CSV: Generate CSV string, save to temp file
- JSON: Serialize Firestore data to JSON
- Share: `react-native-share` for system share sheet

**Dependencies:**
- STORY-014 (Freemium Paywall)
- STORY-001 (Quick Dose Logging) for data source
- STORY-016 (Trend Analytics) for chart in PDF

---

#### STORY-020: Kratie Milestone Celebrations

**Epic:** EPIC-004 (Premium Features)
**Priority:** Should Have (Premium)
**Points:** 3

**User Story:**
As a premium user
I want Kratie to celebrate with me when I hit milestones
So that I feel recognized and motivated

**Acceptance Criteria:**
- [ ] Kratie appears in full-screen overlay when milestone unlocked
- [ ] Kratie performs celebration animation (confetti, jump, clap)
- [ ] Milestone name and description displayed ("7-Day Streak Unlocked!")
- [ ] "Share Achievement" button (shares to social media or saves image)
- [ ] "Continue" button dismisses celebration and returns to app
- [ ] Celebration only shows once per milestone (no repeats)
- [ ] Animations run at 60fps, no UI jank
- [ ] Accessible: Screen readers announce milestone and celebration

**Technical Notes:**
- Component: `MilestoneCelebrationModal.tsx`
- Asset: Kratie celebration animation (3D or Lottie)
- Trigger: Called from `useDoses` hook when milestone unlocked
- Share: Generate image with milestone badge + Kratie
- Persistence: Mark milestone as "celebrated" in Firestore

**Dependencies:**
- STORY-017 (Goal Setting & Milestones)
- STORY-009 (Kratie Mascot Onboarding) for asset reuse

---

### EPIC-005: Infrastructure (8 points, 2 stories)

#### STORY-INF-001: Development Environment Setup

**Epic:** Infrastructure
**Priority:** Must Have
**Points:** 5

**User Story:**
As a developer
I want a fully configured development environment
So that I can start building features immediately

**Acceptance Criteria:**
- [ ] Firebase project created (dev, staging, production)
- [ ] Firestore collections and indexes configured
- [ ] Firestore security rules deployed
- [ ] Firebase Auth configured (anonymous auth enabled)
- [ ] RevenueCat account created, products configured
- [ ] Expo project initialized with React Native 0.76 + Expo SDK 52
- [ ] Dependencies installed: React Navigation, React Native Paper, Firebase SDKs
- [ ] Environment variables configured (.env files for dev/staging/prod)
- [ ] Git repository initialized with `.gitignore`
- [ ] CI/CD pipeline configured (GitHub Actions)
- [ ] Development documentation in `README.md`

**Technical Notes:**
- Firebase: Create 3 projects (dev, staging, prod) in Firebase Console
- Firestore indexes: Defined in `firestore.indexes.json`
- Firestore rules: Defined in `firestore.rules` (see Architecture doc)
- RevenueCat: Configure products, entitlements, API keys
- Expo: `npx create-expo-app --template typescript`
- Dependencies: `npm install` with package.json
- Environment: `.env.dev`, `.env.staging`, `.env.production`

**Dependencies:**
- None (foundational)

---

#### STORY-INF-002: CI/CD Pipeline

**Epic:** Infrastructure
**Priority:** Must Have
**Points:** 3

**User Story:**
As a developer
I want an automated CI/CD pipeline
So that code is tested and deployed reliably

**Acceptance Criteria:**
- [ ] GitHub Actions workflow configured (`.github/workflows/ci.yml`)
- [ ] Build stage: Install dependencies, type check, lint, run tests
- [ ] Test stage: Unit tests (Jest), integration tests (Firebase Emulator)
- [ ] Deploy stage: EAS Build (iOS/Android), EAS Submit (publish to app stores)
- [ ] Automated testing gates: All tests must pass before merge
- [ ] Lint must pass (ESLint, no warnings)
- [ ] Type check must pass (TypeScript, no errors)
- [ ] Coverage report generated (target: 80%+)
- [ ] Deployment to staging on PR merge to `main` branch
- [ ] Deployment to production on tagged release

**Technical Notes:**
- GitHub Actions: Workflow file defines stages
- EAS: Expo Application Services for build and submit
- Tests: Jest for unit tests, Firebase Emulator for integration tests
- Coverage: `jest --coverage`, enforce 80% threshold
- Deployment: Automatic builds on push to main/release branches

**Dependencies:**
- STORY-INF-001 (Development Environment Setup)

---

## Sprint Allocation

### Sprint 1 (Weeks 1-2) - Foundation & Core Tracking

**Goal:** Establish development environment, implement anonymous auth, and deliver core dose tracking functionality (add, view, edit, delete doses).

**Stories:**
- STORY-INF-001: Development Environment Setup (5 points) - Infrastructure
- STORY-INF-002: CI/CD Pipeline (3 points) - Infrastructure
- STORY-011: Anonymous Authentication (3 points) - User Foundation
- STORY-001: Quick Dose Logging (5 points) - Core Tracking
- STORY-002: Daily Dose Timeline (5 points) - Core Tracking
- STORY-003: Rolling Calendar Week (5 points) - Core Tracking
- STORY-004: Edit Dose (3 points) - Core Tracking

**Total:** 29 points / 30 capacity (97% utilization)

**Risks:**
- Firebase project setup may have delays (API key provisioning, billing setup)
- RevenueCat integration may require app store approval (in-app purchases setup)

**Dependencies:**
- Firebase account access
- Apple Developer account, Google Play Console account
- RevenueCat account

---

### Sprint 2 (Weeks 3-4) - Visual Progress & Onboarding

**Goal:** Complete core tracking with offline sync, implement visual progress indicators (gauge, theme), and deliver polished onboarding experience with Kratie mascot.

**Stories:**
- STORY-005: Delete Dose (2 points) - Core Tracking
- STORY-006: Offline Dose Sync (11 points) - Core Tracking
- STORY-007: Daily Dose Gauge (8 points) - Visual Progress
- STORY-010: Settings Screen (5 points) - User Foundation
- STORY-008: Dark/Light Theme Toggle (5 points) - Visual Progress
- STORY-012: Onboarding Flow (8 points) - User Foundation
- STORY-009: Kratie Mascot Onboarding (2 points) - Visual Progress

**Total:** 41 points / 30 capacity (137% over-capacity)

**Adjustment:** Move STORY-009 (Kratie Mascot Onboarding) to Sprint 3 backlog, prioritize if time allows. Adjusted total: 39 points / 30 capacity.

**Revised Sprint 2 Total:** 39 points (still over-capacity, will carry overflow to Sprint 3)

**Risks:**
- Offline sync complexity may require more time than estimated
- Kratie 3D asset may not be ready (fallback to 2D illustration)

**Dependencies:**
- Kratie 3D asset from design team (for STORY-009)

---

### Sprint 3 (Weeks 5-6) - Premium Features & Polish

**Goal:** Deliver premium features (paywall, taper planner, analytics, goals), integrate Kratie milestone celebrations, and prepare for MVP launch.

**Stories:**
- STORY-014: Freemium Paywall (8 points) - Premium Features
- STORY-015: Smart Taper Planner (8 points) - Premium Features
- STORY-016: Weekly/Monthly Trend Analytics (8 points) - Premium Features
- STORY-017: Goal Setting & Milestones (5 points) - Premium Features
- STORY-018: Dose Reminders & Alerts (5 points) - Premium Features
- STORY-019: Export & Backup (5 points) - Premium Features
- STORY-013: Account Deletion (3 points) - User Foundation
- STORY-020: Kratie Milestone Celebrations (3 points) - Premium Features
- STORY-009: Kratie Mascot Onboarding (2 points) - Carryover from Sprint 2

**Total:** 47 points / 30 capacity (157% over-capacity)

**Adjustment:** This sprint is heavily overloaded. Prioritize:
- Must Have: STORY-014, STORY-015, STORY-013 (19 points)
- Should Have (time permitting): STORY-016, STORY-017, STORY-018, STORY-019, STORY-020, STORY-009

**Realistic Sprint 3:** Focus on paywall and taper planner (core premium features), account deletion (compliance), and stretch goals for analytics/goals.

**Risks:**
- Premium features are complex, may require Sprint 4 to complete
- RevenueCat testing requires sandbox accounts
- Cloud Functions deployment may have cold start issues

**Dependencies:**
- RevenueCat products configured in dashboard
- Cloud Function for taper plan generation deployed
- App Store and Play Store in-app purchase configuration

---

## Epic Traceability

| Epic ID | Epic Name | Stories | Total Points | Sprints |
|---------|-----------|---------|--------------|---------|
| EPIC-001 | Core Tracking | STORY-001, 002, 003, 004, 005, 006 | 31 points | Sprint 1-2 |
| EPIC-002 | Visual Progress | STORY-007, 008, 009 | 15 points | Sprint 2-3 |
| EPIC-003 | User Foundation | STORY-010, 011, 012, 013 | 19 points | Sprint 1-3 |
| EPIC-004 | Premium Features | STORY-014, 015, 016, 017, 018, 019, 020 | 42 points | Sprint 3 |
| EPIC-005 | Infrastructure | STORY-INF-001, INF-002 | 8 points | Sprint 1 |

**Total:** 115 points across 22 stories

---

## Functional Requirements Coverage

| FR ID | FR Name | Story | Sprint |
|-------|---------|-------|--------|
| FR-001 | Quick Dose Logging | STORY-001 | 1 |
| FR-002 | Daily Dose Gauge | STORY-007 | 2 |
| FR-003 | Rolling Calendar Week | STORY-003 | 1 |
| FR-004 | Daily Dose Timeline | STORY-002 | 1 |
| FR-005 | Dark/Light Theme | STORY-008 | 2 |
| FR-006 | Anonymous Authentication | STORY-011 | 1 |
| FR-007 | Smart Taper Planner | STORY-015 | 3 |
| FR-008 | Weekly/Monthly Trend Analytics | STORY-016 | 3 |
| FR-009 | Goal Setting & Milestones | STORY-017 | 3 |
| FR-010 | Dose Reminders & Alerts | STORY-018 | 3 |
| FR-011 | Export & Backup | STORY-019 | 3 |
| FR-012 | Freemium Paywall | STORY-014 | 3 |
| FR-013 | Onboarding Flow | STORY-012 | 2 |

**Coverage:** 13/13 functional requirements (100%)

---

## Risks and Mitigation

### High Risks

**Risk 1: Sprint 3 Overload (47 points vs. 30 capacity)**
- **Mitigation:** Prioritize Must Have stories (paywall, taper planner, account deletion). Defer Should Have stories (analytics, goals, reminders) to Sprint 4 if needed.
- **Contingency:** Extend to 4 sprints if premium features cannot be completed in Sprint 3.

**Risk 2: Kratie 3D Asset Delivery**
- **Mitigation:** Implement fallback to 2D illustration. Coordinate with design team for asset delivery by Sprint 2 start.
- **Contingency:** Ship MVP without Kratie animations, add in post-launch update.

**Risk 3: RevenueCat Integration Complexity**
- **Mitigation:** Allocate extra time in Sprint 3 for RevenueCat testing (sandbox mode). Review RevenueCat documentation early.
- **Contingency:** Simplify paywall to single product (monthly only) if integration takes longer.

### Medium Risks

**Risk 4: Offline Sync Bugs (STORY-006)**
- **Mitigation:** Thorough testing with network toggle, Firestore emulator for integration tests.
- **Contingency:** Limit offline support to read-only, defer write queuing to post-MVP.

**Risk 5: Cloud Function Cold Starts (Taper Plan Generation)**
- **Mitigation:** Keep functions warm with scheduled invocations (every 5 minutes). Show loading spinner to set user expectations.
- **Contingency:** Move taper plan logic to client-side if cold starts unacceptable.

### Low Risks

**Risk 6: Theme Toggle Persistence**
- **Mitigation:** Test Firestore write/read for settings early in Sprint 2.
- **Contingency:** Fallback to AsyncStorage if Firestore unreliable.

---

## Dependencies

### External Dependencies

- **Firebase Platform:** Auth, Firestore, Cloud Functions, FCM (critical for all stories)
- **RevenueCat:** Subscription management (blocks STORY-014 and all premium features)
- **App Store Connect:** iOS IAP configuration, app submission
- **Google Play Console:** Android IAP configuration, app submission
- **Kratie 3D Asset:** Delivery from design team (blocks STORY-009, STORY-020)

### Internal Dependencies

- **STORY-011 (Anonymous Authentication):** Foundational, blocks all Firestore operations
- **STORY-014 (Freemium Paywall):** Blocks all premium features (STORY-015 through STORY-020)
- **STORY-007 (Daily Dose Gauge):** Integrates with STORY-015 (taper plan targets), STORY-017 (goal progress)
- **STORY-INF-001 (Dev Environment):** Blocks all development work

---

## Definition of Done

For a story to be considered complete:

- [ ] Code implemented and committed to `main` branch
- [ ] Unit tests written and passing (≥80% coverage for new code)
- [ ] Integration tests passing (Firebase Emulator tests)
- [ ] Code reviewed and approved (PR review by tech lead)
- [ ] Documentation updated (`README.md`, inline comments for complex logic)
- [ ] Deployed to staging environment (EAS preview build)
- [ ] Acceptance criteria validated (manual testing)
- [ ] No critical bugs or regressions introduced
- [ ] Accessibility tested (VoiceOver/TalkBack for new screens)
- [ ] Performance tested (no UI jank, <3s load times)

---

## Next Steps

**Immediate:** Begin Sprint 1 (Development Environment Setup, Anonymous Auth, Core Tracking)

**Sprint Cadence:**
- Sprint length: 2 weeks
- Sprint planning: Monday Week 1
- Sprint review: Friday Week 2
- Sprint retrospective: Friday Week 2
- Sprint start: Monday following retrospective

**Development Workflow:**

1. **Start Sprint 1:** Run `/dev-story STORY-INF-001` to begin infrastructure setup
2. **Daily standup:** Review progress, update TodoWrite, address blockers
3. **Mid-sprint check:** Review story completion rate, adjust scope if needed
4. **Sprint review:** Demo completed stories to stakeholders
5. **Sprint retrospective:** What went well, what to improve

**Recommended Next Command:**
```
/dev-story STORY-INF-001
```
This will kick off the Development Environment Setup story, creating Firebase projects, configuring Firestore, and initializing the Expo app.

---

**This plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**

*Sprint Plan Date: 2026-01-25*
*Scrum Master: Jarad DeLorenzo (Steve)*
*Project: Wean - Kratom Dose Tracking Mobile App*
