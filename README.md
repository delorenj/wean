# Wean - Substance Reduction Tracking App

A React Native mobile application for tracking substance doses over time, built with Expo and Firebase.

## Overview

Wean helps users track their substance intake, visualize progress, and plan reduction strategies with smart tapering features. The app uses anonymous authentication for privacy and includes premium features via RevenueCat.

## Tech Stack

- **Frontend:** React Native 0.76.3 + Expo SDK 52
- **Navigation:** React Navigation 7 (Material Top Tabs)
- **UI Library:** React Native Paper 5 (Material Design 3)
- **Backend:** Firebase (Auth, Firestore, Cloud Functions)
- **Payments:** RevenueCat
- **State Management:** React Context API
- **Language:** TypeScript + JavaScript (migrating to full TypeScript)

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Firebase CLI: `npm install -g firebase-tools`
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourorg/wean.git
cd wean
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### Create Firebase Projects

Create three Firebase projects for different environments:
- `wean-dev` (Development)
- `wean-staging` (Staging)
- `wean-17739` (Production) - already exists

#### Enable Firebase Services

For each project:
1. **Authentication:** Enable Anonymous sign-in
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable "Anonymous" provider

2. **Firestore:** Create database
   - Go to Firestore Database > Create database
   - Start in production mode (rules are in `firestore.rules`)
   - Choose a location (us-central1 recommended)

3. **Cloud Functions:** Set up Functions
   - Go to Functions > Get started
   - Upgrade to Blaze plan (required for Cloud Functions)

#### Deploy Firestore Rules and Indexes

```bash
# For development
firebase use wean-dev
firebase deploy --only firestore:rules,firestore:indexes

# For staging
firebase use wean-staging
firebase deploy --only firestore:rules,firestore:indexes

# For production
firebase use wean-17739
firebase deploy --only firestore:rules,firestore:indexes
```

#### Get Firebase Configuration

For each project, go to Project Settings > General > Your apps:
1. Add an iOS app (bundle ID: `com.lasertoast.wean`)
2. Add an Android app (package name: `com.lasertoast.wean`)
3. Add a Web app
4. Copy the Firebase configuration values

### 4. Environment Variables

Copy the example environment file and fill in your Firebase credentials:

```bash
cp .env.example .env.development
```

Edit `.env.development`, `.env.staging`, and `.env.production` with your Firebase project credentials:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# RevenueCat Configuration (see next section)
EXPO_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_key

# Environment
EXPO_PUBLIC_ENVIRONMENT=development
```

### 5. RevenueCat Setup

#### Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com/)
2. Create a new project: "Wean"

#### Configure Products

1. **Create Entitlements:**
   - Name: "premium"
   - Identifier: `premium`

2. **Create Products:**
   - Monthly: `wean_premium_monthly` - $4.99/month
   - Yearly: `wean_premium_yearly` - $39.99/year (17% discount)

3. **Connect App Stores:**
   - iOS: Connect to App Store Connect (bundle ID: `com.lasertoast.wean`)
   - Android: Connect to Google Play Console (package: `com.lasertoast.wean`)

4. **Get API Keys:**
   - Go to Project Settings > API Keys
   - Copy the Public API Key
   - Add to environment variables: `EXPO_PUBLIC_REVENUECAT_API_KEY`

### 6. Run the App

#### Start Firebase Emulators (for local development)

```bash
firebase emulators:start
```

This starts:
- Firebase Auth emulator on port 9099
- Firestore emulator on port 8080
- Emulator UI on port 4000

#### Start Expo Development Server

```bash
npm start
```

This will open Expo Dev Tools. From there you can:
- Press `i` to run on iOS simulator
- Press `a` to run on Android emulator
- Scan QR code to run on physical device (requires Expo Go app)

Or use platform-specific commands:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
wean/
├── App.js                    # Root component with provider hierarchy
├── ThemedApp.tsx             # Themed wrapper for navigation
├── components/               # Reusable UI components
│   ├── DailyGauge/          # Dose gauge visualization
│   ├── DoseList/            # Dose timeline list
│   └── WeekCalendar/        # Week navigation calendar
├── context/                  # React Context providers
│   ├── DailyProvider.tsx    # Selected date state
│   ├── DosesProvider.tsx    # Dose data management
│   ├── FirebaseProvider.tsx # Firebase initialization
│   └── SettingsProvider.tsx # User settings management
├── hooks/                    # Custom React hooks
│   ├── useDoses.ts          # Dose CRUD operations
│   ├── useFireauth.ts       # Anonymous authentication
│   ├── useSettings.ts       # Settings management
│   └── useDaily.ts          # Date navigation
├── models/                   # Data models and converters
│   ├── Dose.ts              # Dose model
│   └── Settings.ts          # Settings model
├── pages/                    # Screen components
│   ├── DailyScreen.tsx      # Main tracking screen
│   ├── DoseScreen.tsx       # Dose entry form
│   ├── InsightScreen.tsx    # Analytics (premium)
│   ├── PlanScreen.tsx       # Taper planner (premium)
│   ├── SettingsScreen.tsx   # Settings
│   └── DebugScreen.tsx      # Dev tools (debug only)
├── firebase.json             # Firebase configuration
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Firestore indexes
└── docs/                     # Project documentation
    ├── prd-wean-*.md        # Product Requirements
    ├── architecture-*.md    # System Architecture
    └── sprint-plan-*.md     # Sprint Planning
```

## Provider Hierarchy

The app uses nested React Context providers in this specific order:

```
FirebaseProvider
  → SettingsProvider
    → DailyProvider
      → DosesProvider
        → SafeAreaProvider
          → ThemedApp
```

**Important:** This order matters! Downstream providers depend on upstream contexts.

## Development

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Running tests
npm test

# Generate coverage report
npm test -- --coverage
```

### Database Management

```bash
# Seed test data (requires emulators)
node seed-doses.js

# Clear Firestore data
firebase firestore:delete --all-collections
```

### Building for Production

```bash
# Create production build
eas build --platform all --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

- **On Push/PR:** Type check, lint, and test
- **On Merge to `develop`:** Build and deploy to staging (Expo Updates)
- **On Merge to `main` (tagged):** Build and deploy to production, submit to app stores

### Required GitHub Secrets

Add these secrets to your GitHub repository:

- `EXPO_TOKEN`: Expo access token (from `expo whoami`)
- `CODECOV_TOKEN`: Codecov upload token (optional)

## Deployment

### Staging Deployment

```bash
# Merge to develop branch
git checkout develop
git merge feature/your-feature
git push origin develop

# CI/CD will automatically deploy to Expo Updates (staging channel)
```

### Production Deployment

```bash
# Create a release tag
git checkout main
git tag v1.0.0
git push origin v1.0.0

# CI/CD will automatically:
# 1. Build for production
# 2. Deploy to Expo Updates (production channel)
# 3. Submit to App Store and Google Play
```

## Troubleshooting

### Firebase Connection Issues

If you see "Firebase not initialized":
1. Check environment variables are loaded correctly
2. Verify Firebase project credentials in `.env.*` files
3. Ensure Firebase project has Authentication and Firestore enabled

### Build Failures

```bash
# Clear Expo cache
expo start -c

# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Metro bundler cache
rm -rf $TMPDIR/metro-*
```

### Type Errors

The codebase is migrating from JavaScript to TypeScript. Some files may have `.js` extensions with TypeScript syntax. This is intentional and temporary.

## License

Proprietary - All Rights Reserved

## Support

For questions or issues, contact [your-email@example.com]
