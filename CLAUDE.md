# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wean is a React Native/Expo mobile app for tracking substance doses over time. It uses Firebase (Firestore + Auth) as the backend and supports iOS, Android, and web platforms.

## Development Commands

```bash
# Start dev server (requires expo dev client)
npm start

# Run on specific platforms
npm run ios
npm run android
npm run web

# Firebase emulators (auth on 9099, firestore on 8080)
firebase emulators:start
```

## Architecture

### Provider Hierarchy (App.js)

The app wraps components in nested React Context providers in this order:
```
FirebaseProvider -> SettingsProvider -> DailyProvider -> DosesProvider -> SafeAreaProvider -> ThemedApp
```

This order matters: downstream providers depend on upstream contexts (e.g., DosesProvider needs FirebaseProvider for db access).

### Data Flow

- **Firebase Auth**: Anonymous sign-in via `useFireauth` hook. User UID gates all data access.
- **Firestore Collections**:
  - `doses-{uid}`: Per-user dose documents with Timestamp-based queries
  - `settings`: Per-user settings documents keyed by UID
- **Converters**: Each model uses Firestore converters (`ModelConverter` interface) for serialization.

### Key Hooks

| Hook | Purpose |
|------|---------|
| `useDoses` | Fetches doses for selected date, calculates daily totals with unit conversion (g/oz) |
| `useSettings` | Manages user settings with Firestore sync, includes `toggleDarkMode` |
| `useFireauth` | Handles anonymous auth, returns `user` object |
| `useDaily` | Manages selected date state for calendar navigation |

### Navigation

Material Top Tabs (bottom position) with 6 screens:
- Debug, Daily (home), Dose (entry form), Insight, Plan, Settings

### Theming

Combines React Navigation themes with React Native Paper MD3 themes. Dark/light mode toggleable via settings, persisted to Firestore.

## Data Model

**Dose** (`hooks/useDoses.ts`):
```typescript
interface Dose {
  substance: string
  amount: number
  doseUnit: string  // 'g', 'gram', 'oz', 'ounce'
  date: Timestamp
  notes?: string
  method?: string
}
```

Dose totals auto-convert to a common unit using conversion factors (1 oz = 28.3495g).

## Conventions

- Components in `components/` use subdirectories with `index.tsx`
- Pages in `pages/` are flat files
- Hooks in `hooks/` follow `use{Name}` pattern
- Contexts in `context/` export both Provider and custom hook where applicable
- Mixed JS/TS codebase (migrating toward TS)
