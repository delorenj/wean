# AGENTS.md

Source of truth for agent instructions. `CLAUDE.md` and `GEMINI.md` are symlinks to this file.

## Project Overview

**Wean** - A mobile app to help individuals wean off of Kratom safely and comfortably

## Ticket Management (MANDATORY)

No code changes without an active Plane ticket.

```
Board: https://plane.delo.sh/33god/
```

- Move ticket to "In Progress" before first code change
- Branch names must include ticket reference
- Commit messages must reference tickets
- Emergency bypass: `ALLOW_NO_TICKET=1`

## Development

```bash
# Load environment
mise trust

# Run tasks
mise tasks  # list available tasks
mise run setup  # initial setup
```

## BMAD Methodology

This project follows BMAD. All methodology files are in `_bmad/`.

- Strict BMAD adherence for prompts and tasks
- Component work delegated to specialized agents
- Maintain parity between BMAD documents and Plane boards

## Principles

- Work with full autonomy toward task goals
- Make well-informed decisions when judgment calls arise
- Speed prioritized over perfection for non-critical paths

<!-- PJAN-82: recovered from the CLAUDE.md that `ln -sf AGENTS.md CLAUDE.md`
     destroyed. The old link-agentfiles.sh could not tell a stale link it
     owned from a real file it must not touch; it unlinked this content and
     printed a green checkmark. Recovered with `git show HEAD:CLAUDE.md`. -->

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
