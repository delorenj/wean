# System Architecture: Wean

**Date:** 2026-01-22
**Architect:** Claude (System Architect)
**Version:** 1.0
**Project Type:** mobile-app
**Project Level:** 2

---

## Document Overview

This document defines the system architecture for Wean, a React Native/Expo mobile app for Kratom dose tracking and reduction. It addresses all functional requirements (FRs) and non-functional requirements (NFRs) from the PRD, providing implementation guidance for development teams.

**Related Documents:**
- Product Requirements Document: `/home/delorenj/code/wean/trunk-main/docs/prd-wean-2026-01-20.md`
- UX Design: `/home/delorenj/code/wean/trunk-main/docs/ux-design-wean-2026-01-22.md`

---

## Executive Summary

Wean uses a **BFF (Backend for Frontend) pattern with Firebase as the managed backend**. This architecture prioritizes simplicity, cost-effectiveness, and rapid iteration while meeting all performance, security, and scalability requirements for a Level 2 mobile app targeting 100K+ users.

**Key Architectural Decisions:**
- React Native/Expo for cross-platform mobile (iOS, Android, web)
- Firebase for backend (Auth, Firestore, Cloud Functions, FCM)
- RevenueCat for subscription management
- Offline-first data sync with Firestore
- Client-side business logic with server-side validation
- No custom backend infrastructure (serverless only)

---

## Architectural Drivers

Architectural drivers are NFRs that significantly influence system design.

### Driver 1: Performance (NFR-001)

**Requirement:** App launch <3s, dose logging <10s, screen transitions <300ms, API queries <500ms

**Architectural Impact:**
- Client-side caching required (AsyncStorage for settings, in-memory for doses)
- Firestore indexing mandatory for common queries
- Minimize network round-trips (batch operations where possible)
- Lazy loading for premium features (code splitting)

### Driver 2: Security (NFR-002)

**Requirement:** Protect sensitive substance use data, HTTPS/TLS, no PII in analytics

**Architectural Impact:**
- Firestore security rules enforce uid-gated data access
- Anonymous auth reduces PII collection
- No third-party analytics with PII harvesting
- API keys in environment variables (not client code)

### Driver 3: Reliability (NFR-003)

**Requirement:** 99.9% uptime, zero data loss, graceful offline handling

**Architectural Impact:**
- Firebase 99.95% SLA provides availability
- Offline-first architecture queues writes locally
- Automatic retry with exponential backoff
- Error monitoring (Sentry or Firebase Crashlytics)

### Driver 4: Usability & Accessibility (NFR-004)

**Requirement:** WCAG 2.1 AA compliance, VoiceOver/TalkBack support

**Architectural Impact:**
- React Native Paper MD3 for accessible components
- Semantic HTML in web builds
- ARIA labels, focus management utilities
- System font scaling support

### Driver 5: Scalability (NFR-005)

**Requirement:** Support 100K+ users without re-architecture, Firebase costs <$500/month

**Architectural Impact:**
- Client-side caching reduces Firestore reads
- Firestore indexes optimize queries (no full scans)
- Cloud Functions only for complex operations (taper plan generation)
- No N+1 query patterns

### Driver 6: Compatibility (NFR-007)

**Requirement:** iOS 15+, Android 10+, web (PWA)

**Architectural Impact:**
- Expo SDK 52+ for modern React Native features
- Responsive layouts (mobile-first, tablet adaptations)
- Progressive Web App support (web build)

---

## High-Level Architecture

### Architecture Pattern

**Pattern:** BFF (Backend for Frontend) with Serverless Backend

**Rationale:**
- **Simplicity:** Firebase abstracts infrastructure (no server management)
- **Cost-effective:** Pay-as-you-go pricing, scales with usage
- **Developer productivity:** Focus on business logic, not DevOps
- **Proven:** Standard for mobile apps at 10K-1M user scale
- **Offline-first:** Firestore handles sync automatically

**Trade-offs:**
- ✓ **Gain:** Fast development, low operational overhead, auto-scaling
- ✗ **Lose:** Firebase vendor lock-in, limited control over backend logic
- **Mitigation:** Core business logic in client (React Native), Firebase is data layer only

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile Client                          │
│              (React Native / Expo SDK 52)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   UI     │  │  State   │  │  Hooks   │  │  Utils   │   │
│  │Components│  │Management│  │ (useDoses│  │  (Date,  │   │
│  │ (Paper)  │  │ (Context)│  │ useFire  │  │ Convert) │   │
│  │          │  │          │  │  auth)   │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │      │
│         └──────────────┴──────────────┴──────────────┘      │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │  Local Storage  │                        │
│                  │  (AsyncStorage) │                        │
│                  └─────────────────┘                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (TLS 1.3)
                           │
         ┌─────────────────▼─────────────────┐
         │        Firebase Platform          │
         │  ┌──────────┐  ┌──────────────┐  │
         │  │   Auth   │  │  Firestore   │  │
         │  │(Anonymous│  │  (NoSQL DB)  │  │
         │  │   JWT)   │  │              │  │
         │  └──────────┘  └──────────────┘  │
         │  ┌──────────┐  ┌──────────────┐  │
         │  │  Cloud   │  │     FCM      │  │
         │  │Functions │  │(Push Notifs) │  │
         │  │(Node.js) │  │              │  │
         │  └──────────┘  └──────────────┘  │
         └───────────────────────────────────┘
                           │
         ┌─────────────────▼─────────────────┐
         │      External Services            │
         │  ┌──────────┐  ┌──────────────┐  │
         │  │RevenueCat│  │    Sentry    │  │
         │  │   (IAP)  │  │(Error Logs)  │  │
         │  └──────────┘  └──────────────┘  │
         └───────────────────────────────────┘
```

### Data Flow

**Dose Logging Flow (Critical Path):**
```
1. User taps "+" FAB in app
2. Add Dose screen renders (local state)
3. User adjusts slider, taps "Save"
4. Client validates input (>0, unit present)
5. Client writes to Firestore: doses-{uid}/{doseId}
   - If online: Write succeeds immediately
   - If offline: Queued locally, syncs when online
6. Firestore triggers listener in useDoses hook
7. Hook updates React state → UI re-renders
8. Gauge animates to new total (<300ms)
```

**Taper Plan Generation Flow (Premium):**
```
1. User enters goal (target amount, timeline)
2. Client calls Cloud Function: generateTaperPlan(current, target, weeks, strategy)
3. Function calculates daily targets (5-10% weekly reduction)
4. Function writes plan to Firestore: settings/{uid}/taperPlan
5. Client receives plan via Firestore listener
6. Client displays plan, user taps "Start Plan"
7. Plan becomes active, daily targets shown in gauge
```

---

## Technology Stack

### Frontend

**Choice:** React Native 0.76 + Expo SDK 52

**Rationale:**
- Cross-platform: iOS, Android, web from single codebase
- Mature ecosystem: React Native Paper (MD3 components), React Navigation
- Fast iteration: Expo development build, hot reload
- Web support: PWA capability for web users
- Team expertise: TypeScript/JavaScript skill set

**Trade-offs:**
- ✓ **Gain:** Code reuse (90%+ shared), faster development, lower maintenance cost
- ✗ **Lose:** Native performance (95% of native, acceptable for this use case)
- **Alternatives considered:** Flutter (less mature ecosystem), Native iOS + Native Android (2x development effort)

**Key Libraries:**
- React Native Paper 5.x (Material Design 3 components)
- React Navigation 7.x (navigation, Material Top Tabs)
- react-native-svg (gauge, icons)
- react-native-chart-kit or Victory Native (analytics charts)
- expo-dev-client (custom development builds)

### Backend

**Choice:** Firebase Platform (BaaS)

**Rationale:**
- **Managed services:** No server management, auto-scaling, 99.95% SLA
- **Integrated:** Auth, database, functions, push notifications in one platform
- **Cost-effective:** Free tier covers MVP, $200-500/month at 100K users
- **Developer productivity:** Focus on business logic, not infrastructure
- **Offline-first:** Firestore handles sync, conflict resolution automatically

**Components:**
- Firebase Auth (anonymous authentication)
- Firestore (NoSQL database with offline support)
- Cloud Functions (Node.js 20, event-driven compute)
- Firebase Cloud Messaging (push notifications)

**Trade-offs:**
- ✓ **Gain:** Fast development, low ops overhead, proven reliability
- ✗ **Lose:** Vendor lock-in, less control over backend, query limitations (no joins)
- **Alternatives considered:** Custom Node.js + PostgreSQL (10x operational complexity), Supabase (newer, less mature)

### Database

**Choice:** Firestore (Firebase NoSQL)

**Rationale:**
- **Offline-first:** Automatic sync, local cache, conflict resolution
- **Real-time:** Listeners update UI instantly when data changes
- **Scalable:** Auto-sharding, horizontally scalable to millions of docs
- **Security:** Declarative rules enforce uid-gated access
- **Cost model:** Pay per read/write, predictable at scale

**Data Model:** Document-based NoSQL with collections:
- `doses-{uid}` - Per-user dose documents
- `settings` - Per-user settings (keyed by uid)
- `taperPlans` - Per-user taper plans (optional)

**Trade-offs:**
- ✓ **Gain:** Zero ops, offline support, real-time updates, cheap at small scale
- ✗ **Lose:** No joins (denormalize data), query limitations (no OR, limited sorting)
- **Alternatives considered:** PostgreSQL (complex ops, no offline), MongoDB (manual sync logic)

### Infrastructure

**Choice:** Firebase Hosting + Expo Application Services (EAS)

**Rationale:**
- **Firebase Hosting:** Serves web build (PWA), CDN-backed, HTTPS by default
- **EAS Build:** Builds iOS/Android binaries in cloud (no local Xcode/Android Studio)
- **EAS Submit:** Publishes to App Store and Play Store automatically
- **EAS Update:** Over-the-air updates (JavaScript changes without app store review)

**Environments:**
- Development: Expo Go for rapid iteration
- Staging: EAS preview builds (internal testing)
- Production: Published to app stores

**Trade-offs:**
- ✓ **Gain:** Managed builds, fast CI/CD, no local setup required
- ✗ **Lose:** Expo ecosystem lock-in, limited native modules (mitigated with dev client)
- **Alternatives considered:** Fastlane (manual setup, complex), native toolchains (high friction)

### Third-Party Services

**RevenueCat (Subscription Management):**
- **Purpose:** IAP abstraction, cross-platform receipt validation, subscriber management
- **Rationale:** Handles iOS/Android IAP complexity, provides unified API
- **Cost:** $0-250/month (free up to $10K MRR)

**Sentry (Error Monitoring):**
- **Purpose:** Real-time crash reporting, error tracking, performance monitoring
- **Rationale:** Essential for production reliability, integrates with React Native
- **Cost:** Free tier covers MVP, $26/month for 10K events

**Firebase Crashlytics (Alternative):**
- **Purpose:** Crash reporting (iOS/Android)
- **Rationale:** Free, integrated with Firebase
- **Decision:** Use Crashlytics for native crashes, Sentry for JS errors

---

## System Components

### Component 1: Mobile Client

**Purpose:** Cross-platform mobile app (UI, business logic, local state)

**Responsibilities:**
- Render UI (screens, components, animations)
- Manage application state (React Context, hooks)
- Handle user interactions (dose logging, navigation)
- Local data persistence (AsyncStorage for settings, Firestore cache for doses)
- Offline queuing (write operations queued when offline, synced when online)
- Business logic (dose calculations, unit conversions, validation)

**Interfaces:**
- User input (touch, gestures, keyboard)
- Firebase SDK (Auth, Firestore, FCM)
- RevenueCat SDK (IAP)
- Platform APIs (camera for QR codes - future, notifications)

**Dependencies:**
- Firebase Auth (for authentication state)
- Firestore (for data persistence)
- RevenueCat (for subscription status)

**Technology:**
- React Native 0.76
- Expo SDK 52
- TypeScript
- React Navigation 7
- React Native Paper 5

**FRs Addressed:** All FRs (FR-001 through FR-013) are implemented client-side

---

### Component 2: Firebase Auth

**Purpose:** User authentication and identity management

**Responsibilities:**
- Anonymous user account creation (no email/password required)
- JWT token generation and refresh
- User ID (uid) provisioning (used for data isolation)
- Session persistence across app restarts

**Interfaces:**
- REST API (Firebase Auth API)
- SDK methods: `signInAnonymously()`, `onAuthStateChanged()`

**Dependencies:**
- None (fully managed by Firebase)

**Security:**
- Anonymous auth tokens expire after 1 hour, auto-refreshed by SDK
- User can upgrade to email auth later (premium feature consideration)

**FRs Addressed:** FR-006 (Anonymous Authentication)

---

### Component 3: Firestore Database

**Purpose:** NoSQL database for user data (doses, settings, taper plans)

**Responsibilities:**
- Store user doses with Timestamp-based indexing
- Store user settings (theme, notification preferences)
- Store taper plans (premium feature)
- Real-time sync between client and server
- Offline support (local cache, sync when online)
- Security rules enforcement (uid-gated access)

**Collections:**
```
doses-{uid}/
  {doseId}: {
    substance: string,
    amount: number,
    doseUnit: string (g/oz),
    date: Timestamp,
    notes: string?,
    method: string?,
    createdAt: Timestamp,
    updatedAt: Timestamp
  }

settings/{uid}:
  {
    theme: string (light/dark),
    doseUnit: string (g/oz),
    notificationsEnabled: boolean,
    reminderTimes: string[],
    createdAt: Timestamp,
    updatedAt: Timestamp
  }

taperPlans/{uid}:
  {
    currentDailyAvg: number,
    targetAmount: number,
    timelineWeeks: number,
    strategy: string (gradual/aggressive),
    dailyTargets: { date: string, target: number }[],
    startDate: Timestamp,
    active: boolean,
    createdAt: Timestamp
  }
```

**Indexes:**
```
doses-{uid}:
  - Composite index: (date DESC, createdAt DESC) - for daily dose queries
  - Single field: (createdAt DESC) - for recent doses

settings: No index needed (single doc per user)
taperPlans: No index needed (single doc per user)
```

**Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Doses collection (per-user)
    match /doses-{userId}/{doseId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Settings collection (per-user)
    match /settings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Taper plans collection (per-user)
    match /taperPlans/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**FRs Addressed:** FR-001, FR-003, FR-004, FR-005, FR-007, FR-009

---

### Component 4: Cloud Functions

**Purpose:** Server-side compute for complex operations (optional, minimal usage)

**Responsibilities:**
- Taper plan generation (AI-assisted algorithm)
- Analytics aggregation (weekly/monthly summaries)
- Premium feature validation (future: verify RevenueCat subscription)
- Background jobs (future: send scheduled notifications)

**Functions:**
```javascript
// Taper Plan Generation
exports.generateTaperPlan = functions.https.onCall(async (data, context) => {
  // Verify auth
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');

  const { currentDailyAvg, targetAmount, timelineWeeks, strategy } = data;

  // Validate inputs
  if (targetAmount >= currentDailyAvg) {
    throw new functions.https.HttpsError('invalid-argument', 'Target must be less than current');
  }

  // Calculate daily targets (5% or 10% weekly reduction)
  const reductionRate = strategy === 'aggressive' ? 0.10 : 0.05;
  const dailyTargets = [];
  let current = currentDailyAvg;

  for (let week = 0; week < timelineWeeks; week++) {
    current = current * (1 - reductionRate);
    for (let day = 0; day < 7; day++) {
      dailyTargets.push({
        date: addDays(new Date(), week * 7 + day),
        target: Math.round(current * 10) / 10 // round to 0.1g
      });
    }
  }

  // Save plan to Firestore
  await admin.firestore().collection('taperPlans').doc(context.auth.uid).set({
    currentDailyAvg,
    targetAmount,
    timelineWeeks,
    strategy,
    dailyTargets,
    startDate: admin.firestore.FieldValue.serverTimestamp(),
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true, plan: dailyTargets };
});
```

**Interfaces:**
- HTTPS Callable Functions (called from client via Firebase SDK)
- Firestore triggers (optional, for background processing)

**Dependencies:**
- Firestore (read/write access)
- Firebase Admin SDK

**Deployment:**
- Node.js 20 runtime
- Region: us-central1 (lowest latency for US users)
- Memory: 256MB (default, sufficient for taper plan generation)
- Timeout: 60 seconds

**Cost:**
- Free tier: 2M invocations/month
- Expected usage: <100K invocations/month (taper plan generation, analytics)

**FRs Addressed:** FR-007 (Smart Taper Planner)

---

### Component 5: RevenueCat

**Purpose:** Cross-platform subscription management and IAP abstraction

**Responsibilities:**
- Handle iOS and Android in-app purchases
- Validate purchase receipts server-side
- Manage subscription status (active, expired, trial)
- Sync subscription across devices (via user ID)
- Provide unified API for client (no platform-specific IAP code)

**Products:**
- Monthly: `wean_premium_monthly` - $9.99/month
- Annual: `wean_premium_annual` - $79.99/year (20% discount)
- Free trial: 7 days (configurable in RevenueCat dashboard)

**Integration:**
```typescript
// Initialize RevenueCat
import Purchases from 'react-native-purchases';

Purchases.configure({ apiKey: REVENUECAT_API_KEY });

// Check subscription status
const { customerInfo } = await Purchases.getCustomerInfo();
const isPremium = customerInfo.entitlements.active['premium'] !== undefined;

// Trigger purchase
try {
  const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
  if (customerInfo.entitlements.active['premium']) {
    // Unlock premium features
  }
} catch (e) {
  if (e.userCancelled) {
    // User cancelled purchase
  } else {
    // Show error
  }
}

// Restore purchases
const { customerInfo } = await Purchases.restorePurchases();
```

**Dependencies:**
- App Store Connect (iOS products)
- Google Play Console (Android products)
- Firebase Auth uid (for cross-device sync)

**Security:**
- RevenueCat validates receipts server-side (prevents fraud)
- SDK handles token encryption (no raw receipts in client)

**FRs Addressed:** FR-012 (Freemium Paywall)

---

### Component 6: Firebase Cloud Messaging (FCM)

**Purpose:** Push notifications for dose reminders and milestone celebrations

**Responsibilities:**
- Send scheduled dose reminders (e.g., "Time to log your dose")
- Send alerts when approaching daily limit (80% of target)
- Send milestone celebration notifications ("7-day streak achieved!")
- Handle notification permissions and user preferences

**Integration:**
```typescript
import messaging from '@react-native-firebase/messaging';

// Request permission
const authStatus = await messaging().requestPermission();
const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED;

// Get FCM token
const fcmToken = await messaging().getToken();
// Save token to Firestore: settings/{uid}/fcmToken

// Listen for notifications (foreground)
messaging().onMessage(async (remoteMessage) => {
  // Show in-app notification or toast
});

// Handle notification tap (background/killed state)
messaging().onNotificationOpenedApp((remoteMessage) => {
  // Navigate to relevant screen
});
```

**Notification Types:**
- **Dose Reminder:** Scheduled at user-configured times (morning, afternoon, evening)
- **Approaching Limit Alert:** Triggered when daily total reaches 80% of target
- **Over Target Alert:** Triggered when daily total exceeds target
- **Milestone Celebration:** Triggered when milestone achieved (7-day streak, 50% reduction)

**Scheduling:**
- Client-side: Use `expo-notifications` for local scheduling (no server required)
- Server-side (future): Cloud Functions with `admin.messaging().send()` for dynamic notifications

**FRs Addressed:** FR-010 (Dose Reminders & Alerts)

---

## Data Architecture

### Data Model

**Entity-Relationship Overview:**
```
User (Firebase Auth uid)
  ├─ has many → Doses
  ├─ has one → Settings
  └─ has one → TaperPlan (optional, premium)
```

**Dose Entity:**
```typescript
interface Dose {
  id: string;                    // Firestore doc ID (auto-generated)
  substance: string;             // "Kratom" (hardcoded for MVP)
  amount: number;                // 0.1 - 50.0
  doseUnit: string;              // "g" or "oz"
  date: Timestamp;               // When dose was taken (user can override)
  notes?: string;                // Optional notes (e.g., "Morning dose")
  method?: string;               // Optional (e.g., "toss and wash", "tea")
  createdAt: Timestamp;          // When entry was created
  updatedAt: Timestamp;          // Last update time
}
```

**Settings Entity:**
```typescript
interface Settings {
  userId: string;                // Firebase Auth uid (doc ID)
  theme: 'light' | 'dark';       // Theme preference
  doseUnit: 'g' | 'oz';          // Default unit for dose entry
  notificationsEnabled: boolean; // Master toggle for push notifications
  reminderTimes?: string[];      // ["08:00", "14:00", "20:00"]
  alertApproachingLimit: boolean;// Alert at 80% of daily target
  alertOverTarget: boolean;      // Alert when exceeding target
  fcmToken?: string;             // Firebase Cloud Messaging token
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**TaperPlan Entity:**
```typescript
interface TaperPlan {
  userId: string;                // Firebase Auth uid (doc ID)
  currentDailyAvg: number;       // Starting daily average (e.g., 12.5g)
  targetAmount: number;          // Goal daily amount (e.g., 5.0g)
  timelineWeeks: number;         // Number of weeks to reach goal (e.g., 8)
  strategy: 'gradual' | 'aggressive'; // 5% or 10% weekly reduction
  dailyTargets: DailyTarget[];   // Array of { date, target }
  startDate: Timestamp;          // When plan was created/activated
  active: boolean;               // Is plan currently active?
  createdAt: Timestamp;
}

interface DailyTarget {
  date: string;                  // ISO date (YYYY-MM-DD)
  target: number;                // Target amount for this day (grams)
}
```

### Database Design

**Collection Strategy:**

**doses-{uid}** (per-user collection):
- **Why:** Firestore has a 1MB doc size limit; storing all doses in one doc would hit this quickly
- **Structure:** Each dose is a separate document in a user-specific collection
- **Query pattern:** `doses-{uid}` where `date >= startOfDay AND date <= endOfDay` ORDER BY `date DESC`
- **Index:** Composite index on `(date DESC, createdAt DESC)` for efficient day queries

**settings** (single collection, docs keyed by uid):
- **Why:** Settings are small (<1KB), accessed frequently, one doc per user
- **Structure:** `settings/{uid}` - single doc per user
- **Query pattern:** Direct doc fetch by uid (no query needed)
- **No index needed:** Single doc lookup by key

**taperPlans** (single collection, docs keyed by uid):
- **Why:** One plan per user, moderate size (7-90 daily targets = <10KB)
- **Structure:** `taperPlans/{uid}` - single doc per user
- **Query pattern:** Direct doc fetch by uid
- **No index needed:** Single doc lookup by key

**Normalization:**
- **No joins:** Firestore doesn't support joins; denormalize where needed
- **Dose records are atomic:** No relationships to other entities (besides implicit uid)
- **Settings and plans are separate:** Reduces read/write contention

### Data Flow

**Write Path (Dose Logging):**
```
1. User enters dose in UI
2. Client validates (amount > 0, unit present, date valid)
3. Client calls Firestore: doses-{uid}.add({ ...doseData })
4. Firestore writes locally (offline cache)
5. Firestore syncs to server (when online)
6. Firestore triggers onSnapshot listener in useDoses hook
7. Hook updates React state with new dose
8. UI re-renders (timeline, gauge)
```

**Read Path (Daily Doses):**
```
1. User selects date in calendar (or app opens to today)
2. Client queries Firestore:
   doses-{uid}
     .where('date', '>=', startOfDay)
     .where('date', '<=', endOfDay)
     .orderBy('date', 'desc')
3. Firestore returns from cache (if available) or server
4. useDoses hook calculates daily total (sum of amounts, unit conversion)
5. State updates → UI renders doses and gauge
```

**Offline Behavior:**
```
- Writes: Queued locally, synced when online (Firestore handles automatically)
- Reads: Served from cache if available, server if cache miss
- Conflict resolution: Last-write-wins (Firestore default, acceptable for this use case)
```

### Data Retention

**Doses:**
- Retained indefinitely (users need historical data for trends)
- Future consideration: Archive doses older than 1 year to separate collection (cost optimization)

**Settings:**
- Retained as long as user account exists

**TaperPlans:**
- Retained for plan history (user can review past plans)
- Limit: 10 plans per user (delete oldest when creating 11th)

**User Deletion (GDPR compliance):**
```
1. User requests account deletion via settings
2. Cloud Function triggered: deleteUser(uid)
3. Function deletes:
   - All docs in doses-{uid} collection
   - settings/{uid} doc
   - taperPlans/{uid} doc
   - Firebase Auth account
4. Deletion complete within 24 hours
```

---

## API Design

### API Architecture

**Pattern:** No traditional REST API - Firebase provides SDK-based data access

**Rationale:**
- Firestore SDK handles CRUD operations (no custom API endpoints needed)
- Cloud Functions provide HTTPS callable functions for complex operations
- RevenueCat SDK handles subscription operations
- No need for custom Express/Fastify server

**Authentication:**
- Firebase Auth provides JWT tokens automatically
- All Firestore operations include auth token in request headers
- Firestore security rules validate uid matches document path

### Firestore SDK Operations

**Dose Operations:**
```typescript
// Create dose
const doseRef = await firestore()
  .collection(`doses-${user.uid}`)
  .add({
    substance: 'Kratom',
    amount: 3.5,
    doseUnit: 'g',
    date: firestore.Timestamp.now(),
    notes: 'Morning dose',
    createdAt: firestore.Timestamp.now(),
    updatedAt: firestore.Timestamp.now()
  });

// Read doses for a day
const dosesSnapshot = await firestore()
  .collection(`doses-${user.uid}`)
  .where('date', '>=', startOfDay)
  .where('date', '<=', endOfDay)
  .orderBy('date', 'desc')
  .get();

const doses = dosesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Update dose
await firestore()
  .collection(`doses-${user.uid}`)
  .doc(doseId)
  .update({
    amount: 4.0,
    notes: 'Updated amount',
    updatedAt: firestore.Timestamp.now()
  });

// Delete dose
await firestore()
  .collection(`doses-${user.uid}`)
  .doc(doseId)
  .delete();

// Real-time listener (for live updates)
const unsubscribe = firestore()
  .collection(`doses-${user.uid}`)
  .where('date', '>=', startOfDay)
  .where('date', '<=', endOfDay)
  .orderBy('date', 'desc')
  .onSnapshot(snapshot => {
    const doses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDoses(doses); // Update React state
  });
```

**Settings Operations:**
```typescript
// Read settings
const settingsDoc = await firestore()
  .collection('settings')
  .doc(user.uid)
  .get();

const settings = settingsDoc.data();

// Update settings (merge mode, partial updates)
await firestore()
  .collection('settings')
  .doc(user.uid)
  .set({
    theme: 'dark',
    updatedAt: firestore.Timestamp.now()
  }, { merge: true });
```

### Cloud Functions API

**generateTaperPlan:**
```typescript
// Client-side invocation
import functions from '@react-native-firebase/functions';

const generateTaperPlan = functions().httpsCallable('generateTaperPlan');

try {
  const result = await generateTaperPlan({
    currentDailyAvg: 12.5,
    targetAmount: 5.0,
    timelineWeeks: 8,
    strategy: 'gradual'
  });

  console.log('Plan generated:', result.data.plan);
} catch (error) {
  console.error('Error generating plan:', error);
}
```

**Request Schema:**
```typescript
interface GenerateTaperPlanRequest {
  currentDailyAvg: number;   // e.g., 12.5
  targetAmount: number;      // e.g., 5.0
  timelineWeeks: number;     // e.g., 8
  strategy: 'gradual' | 'aggressive'; // 5% or 10% reduction
}
```

**Response Schema:**
```typescript
interface GenerateTaperPlanResponse {
  success: boolean;
  plan: DailyTarget[];       // Array of { date, target }
}
```

**Error Handling:**
```typescript
try {
  const result = await generateTaperPlan({ ... });
} catch (error) {
  if (error.code === 'unauthenticated') {
    // User not logged in
  } else if (error.code === 'invalid-argument') {
    // Input validation failed
  } else if (error.code === 'unavailable') {
    // Network error
  } else {
    // Generic error
  }
}
```

### RevenueCat API

**Purchase Flow:**
```typescript
import Purchases from 'react-native-purchases';

// Get available packages
const offerings = await Purchases.getOfferings();
const monthlyPackage = offerings.current?.monthly;
const annualPackage = offerings.current?.annual;

// Purchase
try {
  const { customerInfo, productIdentifier } = await Purchases.purchasePackage(monthlyPackage);

  if (customerInfo.entitlements.active['premium']) {
    // Unlock premium features
    setPremium(true);
  }
} catch (e) {
  if (e.userCancelled) {
    // User cancelled
  } else {
    // Error
  }
}

// Restore purchases
const { customerInfo } = await Purchases.restorePurchases();
```

### Rate Limiting

**Firestore:**
- No rate limiting needed (Firebase handles at scale)
- Best practice: Debounce writes (e.g., settings updates wait 500ms after last change)

**Cloud Functions:**
- Firebase enforces: 1000 requests/second per function
- For this app: Expected <1 request/second (taper plan generation is infrequent)
- No custom rate limiting required

**RevenueCat:**
- SDK handles rate limiting internally
- No custom implementation needed

---

## Non-Functional Requirements Coverage

### NFR-001: Performance

**Requirement:** App launch <3s, dose logging <10s, screen transitions <300ms, Firestore queries <500ms

**Architecture Solution:**

1. **App Launch Optimization:**
   - Minimize initial bundle size (code splitting for premium features)
   - Lazy load heavy components (charts, analytics)
   - Use Expo's hermes engine for faster JS execution
   - Cache Firestore data locally (AsyncStorage for settings)

2. **Dose Logging Performance:**
   - Client-side validation (no server round-trip for validation)
   - Optimistic UI updates (show dose immediately, sync in background)
   - Firestore batch writes (if logging multiple doses)

3. **Screen Transitions:**
   - React Navigation's native-driven animations (60fps target)
   - Pre-fetch data for next screen (e.g., load analytics when navigating to trends)
   - Use `shouldComponentUpdate` to prevent unnecessary re-renders

4. **Query Optimization:**
   - Firestore composite indexes on (date DESC, createdAt DESC)
   - Pagination for large result sets (e.g., 90-day analytics)
   - Client-side caching (doses for current day cached in memory)

**Implementation Notes:**
```typescript
// Debounce Firestore writes
const debouncedUpdateSettings = useCallback(
  debounce(async (settings) => {
    await firestore().collection('settings').doc(user.uid).set(settings, { merge: true });
  }, 500),
  [user.uid]
);

// Optimistic UI update
const addDose = async (dose) => {
  // 1. Add to local state immediately
  setDoses(prev => [dose, ...prev]);

  // 2. Write to Firestore in background
  try {
    await firestore().collection(`doses-${user.uid}`).add(dose);
  } catch (error) {
    // 3. Rollback on error
    setDoses(prev => prev.filter(d => d.id !== dose.id));
    showError('Failed to save dose');
  }
};
```

**Validation:**
- Monitor app launch time with React Native Performance Monitor
- Measure dose logging time: Start timer on "Save" tap, end on Firestore write complete
- Profile screen transitions with React DevTools
- Monitor Firestore query latency in Firebase console (p95 < 500ms)

---

### NFR-002: Security

**Requirement:** HTTPS/TLS, uid-gated data access, no PII in analytics, secure API keys

**Architecture Solution:**

1. **Transport Security:**
   - All Firebase communication over HTTPS (TLS 1.3)
   - Firestore enforces HTTPS, no HTTP fallback
   - RevenueCat API calls over HTTPS

2. **Data Access Control:**
   - Firestore security rules enforce uid-gated access (see Firestore rules above)
   - Anonymous auth provides uid without collecting PII
   - No cross-user data access (rules prevent reading other users' data)

3. **Analytics Privacy:**
   - Use Firebase Analytics with `analyticsCollectionEnabled: false` for PII events
   - No email, name, or substance-specific data in analytics events
   - Custom events: Generic labels only (e.g., "dose_logged", not "kratom_dose_logged")

4. **API Key Security:**
   - Firebase API keys in environment variables (not committed to git)
   - RevenueCat API key in `.env` file
   - Expo EAS secrets for production builds

**Implementation Notes:**
```typescript
// Firestore security rules (repeated for emphasis)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /doses-{userId}/{doseId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /settings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

// Analytics (no PII)
import analytics from '@react-native-firebase/analytics';

await analytics().logEvent('dose_logged', {
  amount_range: amount < 5 ? 'low' : amount < 10 ? 'medium' : 'high', // Bucketed
  unit: doseUnit, // Generic (g/oz)
  // NO: substance, notes, exact amount
});
```

**Validation:**
- Penetration testing: Attempt to access other users' data (should fail with permission denied)
- Review Firebase security rules with Firebase Rules simulator
- Audit analytics events: No PII in event parameters
- Verify API keys not in git history (git secrets scan)

---

### NFR-003: Reliability

**Requirement:** 99.9% uptime, zero data loss, graceful offline handling, crash-free rate >99.5%

**Architecture Solution:**

1. **High Availability:**
   - Firebase 99.95% SLA (exceeds 99.9% requirement)
   - No single points of failure (Firebase is multi-region)
   - RevenueCat 99.9% SLA

2. **Data Loss Prevention:**
   - Firestore automatically persists writes to disk (no data loss)
   - Offline writes queued locally, synced when online
   - No manual retry logic needed (Firestore SDK handles)

3. **Offline Handling:**
   - Firestore offline persistence enabled by default
   - UI shows "Saving..." indicator when offline
   - Queue visualization: "3 doses pending sync" (optional)

4. **Error Monitoring:**
   - Sentry for JS errors (real-time alerts)
   - Firebase Crashlytics for native crashes (iOS/Android)
   - Error boundaries in React to catch rendering errors

**Implementation Notes:**
```typescript
// Enable Firestore offline persistence (default, but explicit is better)
import firestore from '@react-native-firebase/firestore';

firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED
});

// Error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// Retry logic for Cloud Functions (exponential backoff)
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

**Validation:**
- Monitor Firebase uptime in Firebase console (target >99.95%)
- Track data loss incidents (should be zero)
- Test offline mode: Disable network, log doses, re-enable, verify sync
- Monitor crash-free rate in Sentry/Crashlytics (target >99.5%)

---

### NFR-004: Usability & Accessibility

**Requirement:** WCAG 2.1 AA compliance, VoiceOver/TalkBack support, minimum 44x44pt touch targets, 4.5:1 contrast

**Architecture Solution:**

1. **Component Library:**
   - React Native Paper MD3 (Material Design 3) for accessible components
   - Built-in ARIA support, focus management
   - Semantic components (Button, TextInput, etc.)

2. **Accessibility Features:**
   - All interactive elements have `accessibilityLabel`
   - Focus order follows logical reading flow
   - Screen reader support (VoiceOver, TalkBack)
   - Dynamic type support (system font scaling)

3. **Design System:**
   - UX design document specifies WCAG AA compliance
   - Color contrast ratios verified (Primary: 4.5:1, Text: 7.2:1)
   - Touch targets minimum 44x44pt (dose cards, buttons, calendar days)

4. **Testing:**
   - Automated: `@testing-library/react-native` accessibility queries
   - Manual: VoiceOver (iOS) and TalkBack (Android) testing

**Implementation Notes:**
```typescript
// Accessible button
<Button
  mode="contained"
  onPress={handleSave}
  accessibilityLabel="Save dose"
  accessibilityHint="Saves the dose entry and returns to home screen"
  style={styles.button}
>
  Save
</Button>

// Accessible slider
<Slider
  value={amount}
  onValueChange={setAmount}
  minimumValue={0.1}
  maximumValue={50}
  step={0.1}
  accessibilityLabel="Dose amount"
  accessibilityValue={{ min: 0.1, max: 50, now: amount }}
  accessibilityHint="Adjust slider to change dose amount"
/>

// Screen reader announcement
import { AccessibilityInfo } from 'react-native';

const announceDoseSaved = () => {
  AccessibilityInfo.announceForAccessibility('Dose saved successfully');
};
```

**Validation:**
- Accessibility audit with Axe DevTools (web build)
- Manual testing with VoiceOver (iOS Settings > Accessibility > VoiceOver)
- Manual testing with TalkBack (Android Settings > Accessibility > TalkBack)
- Contrast checker on design tokens (WebAIM Contrast Checker)

---

### NFR-005: Scalability

**Requirement:** Support 100K+ users, Firebase costs <$500/month, no N+1 queries

**Architecture Solution:**

1. **Firestore Optimization:**
   - Composite indexes for common queries (date-based dose queries)
   - Client-side caching reduces read operations
   - Pagination for large result sets (90-day analytics)

2. **Cost Management:**
   - Free tier: 50K reads, 20K writes, 20K deletes per day
   - At 100K users: ~1 dose/user/day = 100K writes, 100K reads
   - Monthly cost: $0.18 per 100K writes = $18/month for writes
   - Total Firestore cost: ~$50-100/month at 100K users

3. **Scaling Strategy:**
   - Horizontal scaling: Firebase auto-scales (no configuration needed)
   - No database sharding required (Firestore handles automatically)
   - Cloud Functions auto-scale (1000 concurrent executions)

4. **Performance at Scale:**
   - Firestore queries remain fast with indexes (p95 < 500ms regardless of user count)
   - Client-side caching prevents redundant reads
   - No N+1 patterns: All queries use indexes

**Implementation Notes:**
```typescript
// Pagination for analytics (90-day view)
const loadMoreDoses = async (lastVisible) => {
  const query = firestore()
    .collection(`doses-${user.uid}`)
    .orderBy('date', 'desc')
    .startAfter(lastVisible)
    .limit(50);

  const snapshot = await query.get();
  const doses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

  return { doses, lastVisible: newLastVisible };
};

// Client-side caching
const useDosesForDay = (date) => {
  const [doses, setDoses] = useState([]);
  const [cached, setCached] = useState(null);

  useEffect(() => {
    // Check cache
    const cacheKey = `doses-${format(date, 'yyyy-MM-dd')}`;
    const cachedDoses = getFromCache(cacheKey);

    if (cachedDoses) {
      setDoses(cachedDoses);
      return;
    }

    // Fetch from Firestore
    const unsubscribe = firestore()
      .collection(`doses-${user.uid}`)
      .where('date', '>=', startOfDay(date))
      .where('date', '<=', endOfDay(date))
      .onSnapshot(snapshot => {
        const doses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDoses(doses);
        saveToCache(cacheKey, doses);
      });

    return unsubscribe;
  }, [date]);

  return doses;
};
```

**Validation:**
- Monitor Firestore costs in Firebase console (target <$500/month at 100K users)
- Load testing: Simulate 100K users, measure query latency (p95 < 500ms)
- Review Firestore query plans (no missing indexes)

---

### NFR-006: Privacy & Compliance

**Requirement:** GDPR compliance (data export, deletion), CCPA compliance, privacy policy

**Architecture Solution:**

1. **Data Export (GDPR Right to Portability):**
   - User can export all data (doses, settings, taper plans) as JSON or CSV
   - Export function in Settings screen
   - No server-side processing needed (client fetches and formats)

2. **Data Deletion (GDPR Right to Erasure):**
   - User can delete account via Settings
   - Cloud Function: `deleteUserData(uid)` removes all Firestore docs
   - Firebase Auth account deleted
   - 24-hour deletion window (reversible if user changes mind)

3. **Privacy Policy & Terms:**
   - Hosted on Firebase Hosting or GitHub Pages
   - Linked in app Settings screen
   - Linked in App Store and Play Store listings

4. **Analytics Opt-out:**
   - User can disable analytics in Settings
   - Firebase Analytics respects `analyticsCollectionEnabled: false`

**Implementation Notes:**
```typescript
// Data export
const exportUserData = async () => {
  const user = auth().currentUser;

  // Fetch all user data
  const [doses, settings, taperPlan] = await Promise.all([
    firestore().collection(`doses-${user.uid}`).get(),
    firestore().collection('settings').doc(user.uid).get(),
    firestore().collection('taperPlans').doc(user.uid).get()
  ]);

  const exportData = {
    user: { uid: user.uid, createdAt: user.metadata.creationTime },
    doses: doses.docs.map(doc => doc.data()),
    settings: settings.data(),
    taperPlan: taperPlan.data(),
    exportedAt: new Date().toISOString()
  };

  // Convert to JSON
  const json = JSON.stringify(exportData, null, 2);

  // Share via system share sheet
  await Share.open({
    title: 'Export Wean Data',
    message: 'Your Wean data export',
    url: `data:application/json,${encodeURIComponent(json)}`,
    filename: `wean-export-${Date.now()}.json`
  });
};

// Account deletion
const deleteAccount = async () => {
  const user = auth().currentUser;

  // Call Cloud Function to delete Firestore data
  const deleteUserData = functions().httpsCallable('deleteUserData');
  await deleteUserData({ uid: user.uid });

  // Delete Firebase Auth account
  await user.delete();

  // Clear local storage
  await AsyncStorage.clear();

  // Navigate to onboarding
  navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
};
```

**Validation:**
- Test data export: Verify all user data included, valid JSON/CSV format
- Test account deletion: Verify all Firestore docs deleted within 24 hours
- Legal review: Privacy policy complies with GDPR and CCPA (consult legal counsel)

---

### NFR-007: Compatibility

**Requirement:** iOS 15+, Android 10+, web (PWA), responsive layouts

**Architecture Solution:**

1. **Platform Support:**
   - React Native 0.76 supports iOS 13+ (exceeds iOS 15+ requirement)
   - React Native 0.76 supports Android 6+ (API 23+), targets Android 10+ (API 29+)
   - Expo SDK 52 provides web support via `expo-web`

2. **Responsive Design:**
   - Mobile-first layouts (320px - 767px)
   - Tablet adaptations (768px+) with 2-column grids
   - useWindowDimensions hook for dynamic layouts

3. **Platform-Specific Features:**
   - Haptic feedback on iOS (via `expo-haptics`)
   - Material Design components on Android (React Native Paper)
   - PWA features on web (service worker, installable)

4. **Testing:**
   - iOS Simulator (iPhone SE, iPhone 15 Pro)
   - Android Emulator (Pixel 5, Samsung Galaxy S21)
   - Web browsers (Chrome, Safari, Firefox, Edge)

**Implementation Notes:**
```typescript
// Platform-specific code
import { Platform } from 'react-native';

const hapticFeedback = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

// Responsive layout
const { width } = useWindowDimensions();
const isTablet = width >= 768;

return (
  <View style={isTablet ? styles.tabletLayout : styles.mobileLayout}>
    {/* Content */}
  </View>
);

// Web-specific features (PWA)
if (Platform.OS === 'web') {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }
}
```

**Validation:**
- Test on real devices: iPhone 15 Pro (iOS 17), Pixel 8 (Android 14)
- Test on older devices: iPhone SE 2020 (iOS 15), Galaxy S10 (Android 10)
- Test web build: Chrome, Safari, Firefox, Edge (desktop and mobile)

---

## Security Architecture

### Authentication

**Method:** Firebase Auth - Anonymous Authentication

**Flow:**
```
1. User opens app for first time
2. App calls firebase.auth().signInAnonymously()
3. Firebase creates anonymous user account (no email/password)
4. Firebase returns JWT token (includes uid, expires in 1 hour)
5. SDK auto-refreshes token before expiration
6. Token included in all Firestore requests (in Authorization header)
```

**Token Lifetime:**
- Access token: 1 hour (auto-refreshed by SDK)
- Refresh token: Infinite (persists across app restarts)
- Session: Persists until user deletes app or logs out

**Upgrade Path (Future):**
- User can link email/password to anonymous account (preserves data)
- Method: `user.linkWithCredential(EmailAuthProvider.credential(email, password))`

### Authorization

**Model:** User-based Access Control (UBAC)

**Rules:**
- Users can only access their own data (uid-gated)
- No cross-user data access
- No admin users (no elevated permissions)
- No public data (all collections require authentication)

**Implementation:**
- Firestore security rules enforce uid matching
- Client-side: User can only query `doses-{uid}` where `uid === auth.uid`
- Server-side: Firestore rules reject mismatched uid queries

**Example Denial:**
```
User A (uid: abc123) attempts: firestore().collection('doses-def456').get()
Result: Permission denied (uid mismatch)
```

### Data Encryption

**At Rest:**
- Firebase encrypts all data at rest (AES-256)
- No additional encryption needed at app level
- Firestore data: Encrypted on disk in Google data centers

**In Transit:**
- All Firebase communication over TLS 1.3
- Certificate pinning: Not required (Firebase uses Google CAs)
- No HTTP fallback (HTTPS enforced)

**Key Management:**
- Firebase manages encryption keys (no app-level key management)
- RevenueCat manages API keys (stored in Expo EAS secrets)

### Security Best Practices

**Input Validation:**
- Client-side: Validate all user inputs before Firestore writes
- Server-side (Cloud Functions): Re-validate inputs (defense in depth)
- Example: Dose amount must be >0, <50, numeric

**Injection Prevention:**
- No SQL injection risk (Firestore is NoSQL, no raw queries)
- No XSS risk (React Native doesn't render HTML)
- NoSQL injection: Firestore SDK prevents (parameterized queries)

**CSRF Protection:**
- Not applicable (no cookies, all requests use JWT tokens)

**Rate Limiting:**
- Firebase enforces rate limits (1000 requests/second per function)
- Client-side: Debounce writes (prevent accidental spam)

**Security Headers:**
- Web build: CSP (Content-Security-Policy), X-Frame-Options, X-Content-Type-Options
- Served via Firebase Hosting (auto-configured)

---

## Scalability & Performance

### Scaling Strategy

**Horizontal Scaling:**
- Firebase auto-scales horizontally (no configuration needed)
- Firestore: Automatically shards data across nodes
- Cloud Functions: Auto-scale to 1000 concurrent executions per function

**Vertical Scaling:**
- Not applicable (Firebase manages server resources)
- Cloud Functions: Can increase memory (256MB → 1GB) if needed

**Auto-scaling Triggers:**
- Firebase monitors load and scales automatically
- No manual intervention required
- Scales down during low traffic (cost optimization)

**Database Scaling:**
- Firestore: No sharding required (handles automatically)
- No read replicas needed (Firestore serves reads from distributed cache)
- Query performance remains constant regardless of data volume (with indexes)

### Performance Optimization

**Query Optimization:**
- Composite indexes on (date DESC, createdAt DESC) for dose queries
- Firestore query planner chooses optimal index automatically
- No full collection scans (indexes prevent)

**N+1 Query Prevention:**
- Firestore listeners batch updates (no N+1 pattern)
- Example: Loading 50 doses = 1 query (not 50)
- Denormalize data where needed (avoid multiple queries)

**Lazy Loading:**
- Premium features loaded on demand (code splitting)
- Charts loaded when Analytics screen navigates (not on app launch)
- Images loaded progressively (React Native Fast Image)

**Compression:**
- Firestore compresses data in transit (gzip)
- Images: Compress with expo-image-picker (quality: 0.8)
- JSON: No compression needed (Firestore handles)

### Caching Strategy

**Multi-Level Caching:**

1. **Client-side Cache (Firestore SDK):**
   - Firestore caches all queried data locally
   - Cache size: Unlimited (configurable)
   - Cache invalidation: Automatic (Firestore syncs changes)

2. **Application Cache (AsyncStorage):**
   - Settings cached for instant load on app launch
   - Theme preference cached (no flicker on startup)
   - Cache expiration: Never (invalidated on write)

3. **Memory Cache (React State):**
   - Current day's doses cached in React state
   - Persists for session (cleared on app close)
   - Invalidated on Firestore listener updates

**Cache Invalidation:**
- Write-through: Writes update cache and database simultaneously
- Firestore listeners: Auto-invalidate cache when data changes
- Manual: Clear AsyncStorage cache on logout

**Example:**
```typescript
// Multi-level cache for settings
const useSettings = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Level 1: Check memory cache
    if (settingsCache.has(user.uid)) {
      setSettings(settingsCache.get(user.uid));
      return;
    }

    // Level 2: Check AsyncStorage
    AsyncStorage.getItem(`settings-${user.uid}`).then(cached => {
      if (cached) {
        const parsed = JSON.parse(cached);
        setSettings(parsed);
        settingsCache.set(user.uid, parsed);
        return;
      }

      // Level 3: Fetch from Firestore
      firestore().collection('settings').doc(user.uid).get().then(doc => {
        const data = doc.data();
        setSettings(data);
        settingsCache.set(user.uid, data);
        AsyncStorage.setItem(`settings-${user.uid}`, JSON.stringify(data));
      });
    });
  }, [user.uid]);

  return settings;
};
```

### Load Balancing

**Not Applicable:**
- Firebase manages load balancing internally
- No custom load balancer configuration needed
- Firestore: Requests distributed across Google's global infrastructure
- Cloud Functions: Firebase load balances across instances automatically

---

## Reliability & Availability

### High Availability

**Multi-Region Deployment:**
- Firebase operates across multiple Google Cloud regions
- Firestore: Multi-region replication (us-central1, us-east1, us-west1)
- Automatic failover if region unavailable

**Redundancy:**
- Firestore: 3x replication per region (9 copies total across multi-region)
- Cloud Functions: Multiple instances per region
- No single points of failure (all Firebase services redundant)

**Failover:**
- Automatic: Firebase handles failover transparently
- Client impact: <5 second delay during failover (usually unnoticed)
- No manual intervention required

**Circuit Breakers:**
- Firestore SDK implements exponential backoff on retries
- Cloud Functions: Firebase retries failed invocations (up to 7 days)

### Disaster Recovery

**RPO (Recovery Point Objective):** < 5 minutes
- Firestore writes are durable immediately (no data loss)
- Firebase backups: Daily snapshots (retained for 7 days)

**RTO (Recovery Time Objective):** < 5 minutes
- Firebase SLA: 99.95% uptime (4.38 hours downtime per year)
- Automatic recovery: Firebase restores service from backups
- No manual restoration required

**Backup Strategy:**
- Automatic: Firebase performs daily Firestore backups
- Retention: 7 days
- User-initiated backups: Export feature (GDPR compliance)

**Restore Procedures:**
- Firestore: Contact Firebase support for backup restoration (manual process)
- User data: Users can re-import from exported JSON (self-service)

### Monitoring & Alerting

**Metrics to Track:**

1. **Availability:**
   - Firebase uptime (target: >99.95%)
   - App crash rate (target: <0.5%)

2. **Performance:**
   - App launch time (target: <3s)
   - Dose logging time (target: <10s)
   - Firestore query latency (target: p95 <500ms)

3. **Usage:**
   - Daily active users (DAU)
   - Doses logged per user per day
   - Premium conversion rate

4. **Errors:**
   - JS errors (Sentry)
   - Native crashes (Crashlytics)
   - Cloud Function failures

**Logging Strategy:**
- **Client-side:** Sentry for JS errors, Crashlytics for native crashes
- **Server-side:** Cloud Functions logs in Firebase console
- **Structured logging:** JSON format with context (uid, screen, action)

**Alerting Thresholds:**
- Crash rate >1%: Critical alert (page on-call engineer)
- Firestore p95 latency >1s: Warning alert (investigate)
- Cloud Function error rate >5%: Warning alert (check logs)
- Firebase uptime <99.9%: Informational (wait for Firebase resolution)

**Example Alert:**
```
Alert: High crash rate
Metric: crash_free_rate < 99%
Threshold: 99%
Current: 98.5%
Action: Investigate recent crashes in Sentry, deploy hotfix if needed
```

---

## Development & Deployment

### Code Organization

**Project Structure:**
```
wean/
├── app/                      # Expo Router (file-based routing)
│   ├── (tabs)/              # Tab navigator screens
│   │   ├── index.tsx        # Home/Daily screen
│   │   ├── dose.tsx         # Add Dose screen
│   │   ├── insight.tsx      # Analytics screen (premium)
│   │   ├── plan.tsx         # Taper Planner screen (premium)
│   │   └── settings.tsx     # Settings screen
│   ├── _layout.tsx          # Root layout (providers)
│   └── +not-found.tsx       # 404 screen
├── components/              # Reusable UI components
│   ├── DoseCard/
│   ├── DoseGauge/
│   ├── CalendarStrip/
│   ├── Button/
│   └── Modal/
├── hooks/                   # Custom React hooks
│   ├── useDoses.ts
│   ├── useSettings.ts
│   ├── useFireauth.ts
│   └── useDaily.ts
├── context/                 # React Context providers
│   ├── FirebaseProvider.tsx
│   ├── SettingsProvider.tsx
│   ├── DosesProvider.tsx
│   └── DailyProvider.tsx
├── utils/                   # Utility functions
│   ├── dateUtils.ts
│   ├── unitConversion.ts
│   └── validation.ts
├── constants/               # Constants (colors, sizes, tokens)
│   ├── Colors.ts
│   ├── Sizes.ts
│   └── Theme.ts
├── firebase/                # Firebase config
│   ├── config.ts
│   └── firestore.rules
├── functions/               # Cloud Functions
│   ├── src/
│   │   ├── index.ts
│   │   ├── taperPlan.ts
│   │   └── analytics.ts
│   └── package.json
├── assets/                  # Images, fonts, icons
├── app.json                 # Expo config
├── package.json
└── tsconfig.json
```

**Module Boundaries:**
- Components: Pure UI (no business logic)
- Hooks: Business logic (data fetching, state management)
- Context: Global state (auth, settings)
- Utils: Pure functions (no side effects)

**Naming Conventions:**
- Components: PascalCase (DoseCard.tsx)
- Hooks: camelCase, use prefix (useDoses.ts)
- Utils: camelCase (dateUtils.ts)
- Constants: UPPER_SNAKE_CASE or PascalCase for objects

### Testing Strategy

**Unit Testing:**
- **Framework:** Jest + React Native Testing Library
- **Coverage Target:** 80%+
- **What to test:** Hooks, utils, components (logic, not styling)

**Example:**
```typescript
// useDoses.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useDoses } from './useDoses';

jest.mock('@react-native-firebase/firestore');

describe('useDoses', () => {
  it('should fetch doses for selected date', async () => {
    const { result } = renderHook(() => useDoses(new Date('2026-01-22')));

    await waitFor(() => {
      expect(result.current.doses).toHaveLength(3);
      expect(result.current.dailyTotal).toBe(8.5);
    });
  });

  it('should convert units correctly', async () => {
    const { result } = renderHook(() => useDoses(new Date('2026-01-22')));

    await waitFor(() => {
      expect(result.current.dailyTotal).toBe(8.5); // grams
      expect(result.current.dailyTotalOz).toBeCloseTo(0.3, 2); // ounces
    });
  });
});
```

**Integration Testing:**
- **Framework:** Jest + Firebase Emulator
- **What to test:** Firestore queries, Cloud Functions, auth flows

**Example:**
```typescript
// dose.integration.test.ts
import firestore from '@react-native-firebase/firestore';
import { addDose, getDoses } from './doseService';

beforeAll(async () => {
  // Start Firebase Emulator
  await firestore().useEmulator('localhost', 8080);
});

describe('Dose CRUD', () => {
  it('should add and retrieve dose', async () => {
    const dose = {
      substance: 'Kratom',
      amount: 3.5,
      doseUnit: 'g',
      date: new Date()
    };

    const doseId = await addDose('test-uid', dose);
    const doses = await getDoses('test-uid', new Date());

    expect(doses).toHaveLength(1);
    expect(doses[0].amount).toBe(3.5);
  });
});
```

**E2E Testing:**
- **Framework:** Detox (iOS/Android) or Maestro (iOS/Android/web)
- **What to test:** Critical user journeys (onboarding, dose logging, premium upgrade)

**Example (Maestro):**
```yaml
# flows/dose-logging.yaml
appId: com.wean.app
---
- launchApp
- tapOn: "+" # FAB
- inputText: "3.5" # Amount slider
- tapOn: "Save"
- assertVisible: "3.5g" # Dose appears in timeline
- assertVisible: "8.5g" # Gauge updates
```

**Accessibility Testing:**
- **Manual:** VoiceOver (iOS), TalkBack (Android)
- **Automated:** `@testing-library/react-native` accessibility queries

**Performance Testing:**
- **Tool:** React Native Performance Monitor (Flipper)
- **Metrics:** FPS, memory, network requests
- **Load testing:** Firebase Test Lab (simulate 100K users)

### CI/CD Pipeline

**Pipeline Stages:**

1. **Build:**
   - Install dependencies (`npm install`)
   - Type check (`tsc --noEmit`)
   - Lint (`eslint`)
   - Run tests (`jest`)

2. **Test:**
   - Unit tests (Jest)
   - Integration tests (Firebase Emulator)
   - E2E tests (Maestro on EAS)

3. **Deploy:**
   - EAS Build (iOS/Android binaries)
   - EAS Submit (publish to app stores)
   - Firebase Hosting (web build)
   - EAS Update (OTA updates for JS changes)

**GitHub Actions Workflow:**
```yaml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --non-interactive
      - run: eas submit --platform all --non-interactive
```

**Automated Testing Gates:**
- All tests must pass before merge (PR checks)
- Lint must pass (no warnings)
- Type check must pass (no TypeScript errors)
- Coverage must be >80%

### Environments

**Development:**
- Local development: Expo Go or Expo Dev Client
- Firebase: Development project (separate from production)
- Hot reload: Fast iteration (code changes reflected immediately)

**Staging:**
- EAS Preview builds (internal testing)
- Firebase: Staging project (separate from production)
- TestFlight (iOS) and Internal Testing (Android)

**Production:**
- EAS Production builds (published to app stores)
- Firebase: Production project
- App Store (iOS) and Google Play Store (Android)

**Environment Configuration:**
```typescript
// config/environment.ts
const ENV = {
  dev: {
    firebaseConfig: { /* dev Firebase config */ },
    revenueCatApiKey: 'rc_dev_...',
    sentryDsn: 'https://dev-sentry...'
  },
  staging: {
    firebaseConfig: { /* staging Firebase config */ },
    revenueCatApiKey: 'rc_staging_...',
    sentryDsn: 'https://staging-sentry...'
  },
  production: {
    firebaseConfig: { /* prod Firebase config */ },
    revenueCatApiKey: 'rc_prod_...',
    sentryDsn: 'https://prod-sentry...'
  }
};

export const config = __DEV__ ? ENV.dev : ENV.production;
```

**Secrets Management:**
- EAS Secrets (Expo Application Services)
- Firebase API keys in `google-services.json` (iOS) and `GoogleService-Info.plist` (Android)
- `.env` files (not committed to git, added to `.gitignore`)

### Deployment Strategy

**Blue-Green Deployment:**
- Not applicable (mobile apps don't support blue-green)
- Instead: Gradual rollout via app store phased release

**Canary Deployment:**
- EAS Update: Deploy OTA update to 10% of users first
- Monitor crash rate, error rate for 24 hours
- If stable, roll out to 100%

**Rolling Deployment:**
- App stores: iOS App Store and Google Play Store
- Phased release: 1% → 10% → 50% → 100% over 7 days
- Pause/rollback if crash rate increases

**Rollback Strategy:**
- **EAS Update:** Revert to previous OTA update (instant)
- **App Store:** Publish new version with fix (24-48 hour review)
- **Play Store:** Rollback to previous version (instant, but requires all users to update)

---

## Traceability & Trade-offs

### Functional Requirements Traceability

| FR ID | FR Name | Components | Implementation Notes |
|-------|---------|------------|---------------------|
| FR-001 | Quick Dose Logging | Mobile Client (Add Dose Screen, useDoses hook, Firestore) | Client-side validation, optimistic UI, offline queuing |
| FR-002 | Daily Dose Gauge | Mobile Client (DoseGauge component, useDoses hook) | React Native SVG, animated progress, color-coded status |
| FR-003 | Rolling Calendar Week | Mobile Client (CalendarStrip component, useDaily hook) | Horizontal FlatList, swipe navigation, date selection |
| FR-004 | Daily Dose Timeline | Mobile Client (DoseCard component, useDoses hook, Firestore) | Real-time listener, edit/delete actions, pull-to-refresh |
| FR-005 | Dark/Light Theme | Mobile Client (ThemeProvider, useSettings hook, Firestore) | React Context, persisted to Firestore, applies immediately |
| FR-006 | Anonymous Authentication | Firebase Auth, Mobile Client (useFireauth hook) | Auto-sign-in on first launch, JWT token management |
| FR-007 | Smart Taper Planner | Cloud Functions (generateTaperPlan), Mobile Client (Taper Plan Screen), Firestore | AI-assisted algorithm (5-10% weekly reduction), accounts for half-life |
| FR-008 | Trend Analytics | Mobile Client (Analytics Screen, useDoses hook), Firestore | Line charts (react-native-chart-kit), 7/30/90-day views |
| FR-009 | Goal Setting | Mobile Client (Goal Setting Screen, useDoses hook), Firestore | Target amount, milestones, progress tracking |
| FR-010 | Dose Reminders | FCM, Mobile Client (Notification Settings Screen) | Scheduled push notifications, user-configurable times |
| FR-011 | Export & Backup | Mobile Client (Export Screen, useDoses hook) | PDF/CSV/JSON export, system share sheet |
| FR-012 | Freemium Paywall | RevenueCat, Mobile Client (Paywall Screen) | IAP abstraction, cross-platform subscription management |
| FR-013 | Onboarding Flow | Mobile Client (Onboarding Carousel, First Dose Prompt) | 3-4 screen carousel, skip option, deep link to dose entry |

**Coverage:** 13/13 functional requirements (100%)

---

### Non-Functional Requirements Traceability

| NFR ID | NFR Name | Solution | Validation |
|--------|----------|----------|------------|
| NFR-001 | Performance | Client-side caching, Firestore indexing, lazy loading, optimistic UI | Monitor app launch (<3s), dose logging (<10s), query latency (p95 <500ms) |
| NFR-002 | Security | HTTPS/TLS, Firestore security rules, anonymous auth, no PII in analytics | Penetration testing, security rules audit, analytics review |
| NFR-003 | Reliability | Firebase 99.95% SLA, offline-first sync, error monitoring (Sentry/Crashlytics) | Monitor uptime (>99.9%), data loss incidents (zero), crash rate (<0.5%) |
| NFR-004 | Usability & Accessibility | React Native Paper MD3, ARIA labels, WCAG 2.1 AA compliance | VoiceOver/TalkBack testing, contrast checker, accessibility audit |
| NFR-005 | Scalability | Firestore indexes, client-side caching, pagination, cost optimization | Load testing (100K users), Firestore cost monitoring (<$500/month) |
| NFR-006 | Privacy & Compliance | Data export (GDPR), account deletion (GDPR), privacy policy, analytics opt-out | Test export/deletion, legal review (GDPR/CCPA compliance) |
| NFR-007 | Compatibility | React Native 0.76 + Expo SDK 52, iOS 15+, Android 10+, web (PWA) | Test on iOS Simulator, Android Emulator, web browsers |

**Coverage:** 7/7 non-functional requirements (100%)

---

### Key Trade-offs

**Decision 1: Firebase vs. Custom Backend**

**Trade-off:**
- ✓ **Gain:** Fast development, low ops overhead, auto-scaling, offline-first, 99.95% SLA
- ✗ **Lose:** Vendor lock-in, less control over backend, query limitations (no joins), cost at scale

**Rationale:**
- For a Level 2 mobile app (5-15 stories), Firebase's benefits far outweigh costs
- Custom backend would add 3-6 months of development time (server setup, ops, monitoring)
- Firebase costs are predictable: $50-500/month at 100K users (vs. $2000+ for EC2 + ops engineer)
- Vendor lock-in is acceptable: Core business logic in client, Firebase is data layer only

**Mitigation:**
- Core business logic in React Native (portable to other backends if needed)
- Data export feature enables migration (users can export JSON)
- Firestore → PostgreSQL migration path exists (write Cloud Function to sync data)

---

**Decision 2: React Native vs. Native iOS + Android**

**Trade-off:**
- ✓ **Gain:** Code reuse (90%+), faster development, lower maintenance cost, web support
- ✗ **Lose:** 95% native performance (acceptable for this use case), larger app size (+5MB)

**Rationale:**
- Wean is a CRUD app with simple UI (dose logging, charts, settings)
- No performance-critical features (no gaming, no AR, no complex animations)
- Cross-platform code sharing reduces development effort by 50%+
- Team can iterate faster (single codebase vs. maintaining iOS + Android separately)

**Mitigation:**
- Use native modules for performance-critical features (animations via React Native Reanimated)
- Optimize bundle size (code splitting, tree shaking, Hermes engine)
- Test on low-end devices (ensure acceptable performance)

---

**Decision 3: Offline-First vs. Online-Only**

**Trade-off:**
- ✓ **Gain:** Works offline, fast reads from cache, better UX (instant dose logging)
- ✗ **Lose:** Sync complexity, potential conflicts, larger client bundle (+2MB)

**Rationale:**
- Users log doses multiple times per day (offline support is critical)
- Network reliability varies (subway, airplane, rural areas)
- Firestore handles offline sync automatically (no custom conflict resolution needed)
- Cache improves performance: Reads from local cache = zero latency

**Mitigation:**
- Firestore's last-write-wins conflict resolution is acceptable (dose logging is append-only)
- Show sync status in UI ("Saving...", "3 doses pending sync")
- Limit cache size to prevent excessive storage usage (configurable)

---

**Decision 4: Anonymous Auth vs. Email Auth**

**Trade-off:**
- ✓ **Gain:** Zero friction (no signup form), fast onboarding, less PII collected
- ✗ **Lose:** No cross-device sync by default, users can't recover account if app deleted

**Rationale:**
- Substance use tracking is sensitive (users prefer anonymity)
- Email requirement would reduce signup conversion by ~50%
- Anonymous auth provides uid for data isolation (same security as email auth)
- Users can upgrade to email auth later (premium feature consideration)

**Mitigation:**
- Educate users: "Your data is tied to this device. Delete the app = lose data."
- Provide data export feature (users can backup before deleting app)
- Future: Offer email linking (preserves data, enables cross-device sync)

---

**Decision 5: Serverless (Cloud Functions) vs. Always-On Server**

**Trade-off:**
- ✓ **Gain:** Zero ops, auto-scaling, pay-per-use, cold start penalty only for rare operations
- ✗ **Lose:** Cold start latency (1-3 seconds), limited control over execution environment

**Rationale:**
- Complex operations (taper plan generation) are infrequent (<1% of user actions)
- Cold start penalty acceptable for taper plan generation (user expects computation time)
- Cost-effective: $0 at low usage, $10-50/month at 100K users (vs. $500+ for EC2)

**Mitigation:**
- Minimize cold starts: Keep functions warm with scheduled invocations (every 5 minutes)
- Move frequent operations to client (dose calculations, unit conversions)
- Use Cloud Functions only for complex operations (taper plan, analytics aggregation)

---

## Appendix A: Architecture Diagram (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Mobile Client                           │
│              (React Native 0.76 + Expo SDK 52)                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    UI Layer                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │   │
│  │  │  Screens │  │Components│  │ Navigation│  │ Theme  │ │   │
│  │  │ (Home,   │  │ (Gauge,  │  │  (Tabs)   │  │(Light/ │ │   │
│  │  │ Add Dose)│  │  Cards)  │  │           │  │ Dark)  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                         │
│  ┌────────────────────▼────────────────────────────────────┐   │
│  │                 State Layer                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │   │
│  │  │  Hooks   │  │ Context  │  │ AsyncStorage │ │ Cache  │ │   │
│  │  │(useDoses,│  │(Firebase,│  │(Settings)│  │(Doses) │ │   │
│  │  │ useFire  │  │ Settings)│  │          │  │        │ │   │
│  │  │  auth)   │  │          │  │          │  │        │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                         │
│  ┌────────────────────▼────────────────────────────────────┐   │
│  │              Integration Layer                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │   │
│  │  │ Firebase │  │RevenueCat│  │  Sentry  │             │   │
│  │  │   SDK    │  │   SDK    │  │   SDK    │             │   │
│  │  └──────────┘  └──────────┘  └──────────┘             │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │ HTTPS (TLS 1.3)
                        │
         ┌──────────────▼──────────────┐
         │    Firebase Platform        │
         │  ┌────────────────────────┐ │
         │  │   Firebase Auth        │ │
         │  │  (Anonymous, JWT)      │ │
         │  └────────────┬───────────┘ │
         │               │             │
         │  ┌────────────▼───────────┐ │
         │  │      Firestore         │ │
         │  │  (NoSQL Database)      │ │
         │  │  - doses-{uid}         │ │
         │  │  - settings            │ │
         │  │  - taperPlans          │ │
         │  │  Security Rules:       │ │
         │  │  uid-gated access      │ │
         │  └────────────┬───────────┘ │
         │               │             │
         │  ┌────────────▼───────────┐ │
         │  │   Cloud Functions      │ │
         │  │  (Node.js 20)          │ │
         │  │  - generateTaperPlan   │ │
         │  │  - aggregateAnalytics  │ │
         │  └────────────────────────┘ │
         │                             │
         │  ┌────────────────────────┐ │
         │  │        FCM             │ │
         │  │  (Push Notifications)  │ │
         │  │  - Dose reminders      │ │
         │  │  - Milestone alerts    │ │
         │  └────────────────────────┘ │
         └─────────────┬───────────────┘
                       │
         ┌─────────────▼───────────────┐
         │   External Services         │
         │  ┌────────────────────────┐ │
         │  │     RevenueCat         │ │
         │  │  (IAP Management)      │ │
         │  │  - Receipt validation  │ │
         │  │  - Subscription status │ │
         │  └────────────────────────┘ │
         │                             │
         │  ┌────────────────────────┐ │
         │  │       Sentry           │ │
         │  │  (Error Monitoring)    │ │
         │  │  - JS errors           │ │
         │  │  - Performance         │ │
         │  └────────────────────────┘ │
         │                             │
         │  ┌────────────────────────┐ │
         │  │   Crashlytics          │ │
         │  │  (Native Crashes)      │ │
         │  │  - iOS crashes         │ │
         │  │  - Android crashes     │ │
         │  └────────────────────────┘ │
         └─────────────────────────────┘
```

---

## Appendix B: Firestore Data Examples

**doses-{uid} Collection:**
```json
// Document: doses-abc123/dose-001
{
  "id": "dose-001",
  "substance": "Kratom",
  "amount": 3.5,
  "doseUnit": "g",
  "date": "2026-01-22T08:30:00Z",
  "notes": "Morning dose",
  "method": "toss and wash",
  "createdAt": "2026-01-22T08:30:05Z",
  "updatedAt": "2026-01-22T08:30:05Z"
}

// Document: doses-abc123/dose-002
{
  "id": "dose-002",
  "substance": "Kratom",
  "amount": 2.5,
  "doseUnit": "g",
  "date": "2026-01-22T14:00:00Z",
  "notes": "Afternoon dose",
  "createdAt": "2026-01-22T14:00:03Z",
  "updatedAt": "2026-01-22T14:00:03Z"
}
```

**settings Collection:**
```json
// Document: settings/abc123
{
  "userId": "abc123",
  "theme": "dark",
  "doseUnit": "g",
  "notificationsEnabled": true,
  "reminderTimes": ["08:00", "14:00", "20:00"],
  "alertApproachingLimit": true,
  "alertOverTarget": true,
  "fcmToken": "fcm-token-xyz...",
  "createdAt": "2026-01-20T10:00:00Z",
  "updatedAt": "2026-01-22T15:30:00Z"
}
```

**taperPlans Collection:**
```json
// Document: taperPlans/abc123
{
  "userId": "abc123",
  "currentDailyAvg": 12.5,
  "targetAmount": 5.0,
  "timelineWeeks": 8,
  "strategy": "gradual",
  "dailyTargets": [
    { "date": "2026-01-22", "target": 12.5 },
    { "date": "2026-01-23", "target": 12.4 },
    // ... 56 days total
    { "date": "2026-03-19", "target": 5.0 }
  ],
  "startDate": "2026-01-22T10:00:00Z",
  "active": true,
  "createdAt": "2026-01-22T10:00:00Z"
}
```

---

## Appendix C: Cloud Function Examples

**generateTaperPlan Function:**
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface GenerateTaperPlanRequest {
  currentDailyAvg: number;
  targetAmount: number;
  timelineWeeks: number;
  strategy: 'gradual' | 'aggressive';
}

interface DailyTarget {
  date: string;
  target: number;
}

export const generateTaperPlan = functions.https.onCall(
  async (data: GenerateTaperPlanRequest, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to generate taper plan'
      );
    }

    const { currentDailyAvg, targetAmount, timelineWeeks, strategy } = data;

    // Validate inputs
    if (!currentDailyAvg || !targetAmount || !timelineWeeks || !strategy) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters'
      );
    }

    if (targetAmount >= currentDailyAvg) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Target amount must be less than current daily average'
      );
    }

    if (timelineWeeks < 1 || timelineWeeks > 52) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Timeline must be between 1 and 52 weeks'
      );
    }

    // Calculate daily targets
    const reductionRate = strategy === 'aggressive' ? 0.10 : 0.05; // 10% or 5% per week
    const dailyTargets: DailyTarget[] = [];
    let current = currentDailyAvg;
    const startDate = new Date();

    for (let week = 0; week < timelineWeeks; week++) {
      // Reduce at start of each week
      if (week > 0) {
        current = current * (1 - reductionRate);
      }

      // Generate daily targets for this week
      for (let day = 0; day < 7; day++) {
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + week * 7 + day);

        dailyTargets.push({
          date: targetDate.toISOString().split('T')[0], // YYYY-MM-DD
          target: Math.round(current * 10) / 10 // round to 0.1g
        });
      }
    }

    // Ensure final target matches user's goal
    dailyTargets[dailyTargets.length - 1].target = targetAmount;

    // Save plan to Firestore
    const userId = context.auth.uid;
    await admin.firestore().collection('taperPlans').doc(userId).set({
      userId,
      currentDailyAvg,
      targetAmount,
      timelineWeeks,
      strategy,
      dailyTargets,
      startDate: admin.firestore.FieldValue.serverTimestamp(),
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    functions.logger.info('Taper plan generated', { userId, timelineWeeks, strategy });

    return {
      success: true,
      plan: dailyTargets,
      message: `Taper plan created: ${timelineWeeks} weeks, ${strategy} reduction`
    };
  }
);
```

---

## Appendix D: Cost Projections

**Firebase Cost Breakdown (100K users):**

**Firestore:**
- Reads: 100K users × 10 reads/day = 1M reads/day = 30M reads/month
- Writes: 100K users × 3 writes/day (doses) = 300K writes/day = 9M writes/month
- Storage: 100K users × 100KB/user = 10GB

**Pricing:**
- Reads: 30M / 100K (free tier) = 300 paid batches × $0.036 = **$10.80/month**
- Writes: 9M / 20K (free tier) = 450 paid batches × $0.18 = **$81/month**
- Storage: 10GB - 1GB (free) = 9GB × $0.18/GB = **$1.62/month**
- **Total Firestore: $93/month**

**Cloud Functions:**
- Invocations: 100K users × 0.5 invocations/month (taper plan) = 50K invocations
- Compute: 50K × 100ms × 256MB = 12.8 GB-seconds
- **Total Cloud Functions: $1/month** (mostly free tier)

**Firebase Hosting:**
- Bandwidth: 10K web users × 5MB = 50GB
- **Total Hosting: $5/month** (mostly free tier)

**Firebase Cloud Messaging:**
- Notifications: 100K users × 5 notifications/month = 500K messages
- **Total FCM: $0** (free)

**RevenueCat:**
- MRR: 100K users × 10% conversion × $9.99 = $99,900 MRR
- **Cost: $250/month** (5-10K MRR tier)

**Sentry:**
- Events: 100K users × 10 events/month = 1M events
- **Cost: $26/month** (10K events tier, plus overage)

**Total Monthly Cost at 100K users: ~$375/month**

**Cost per User: $0.00375/month** (very low)

---

## Approval & Sign-off

**Architect:** Claude (System Architect)

**Approval Status:**
- [x] Architect (Self-review complete)
- [ ] Product Owner (Pending review)
- [ ] Technical Lead (Pending review)

**Next Steps:**
1. Review architecture with stakeholders
2. Validate against PRD requirements (all FRs and NFRs addressed)
3. Begin sprint planning (Phase 4)

---

**This document was created using BMAD Method v6 - Phase 3 (Solutioning)**

*Architecture Date: 2026-01-22*
*Architect: Claude (System Architect)*
