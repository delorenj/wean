# WEAN UX Overhaul - BMAD Analysis Phase

**Directive:** Enterprise-grade, pleasant, intuitive UX for Expo/React Native substance abuse self-help app  
**Constraint:** Do NOT propose Android Compose rewrite  
**Date:** 2026-02-26 22:01 EST

---

## 1. UX AUDIT BASELINE: Pain Points & Heuristics

### Current Tech Stack Assessment
- **Framework:** React Native 0.76 + Expo 52
- **UI Library:** react-native-paper (Material 3)
- **Theme:** MD3LightTheme + MD3DarkTheme (Material Design 3)
- **Navigation:** React Navigation v7
- **State Management:** React Context (Firebase, Settings, Daily, Doses)

### Identified Pain Points

#### A. Interaction & Navigation
| Issue | Severity | Impact | Heuristic Violated |
|-------|----------|--------|-------------------|
| **Tab bar navigation at bottom** - 6 tabs crammed (Debug, Daily, Dose, Insight, Plan, Settings) | HIGH | Tabs fall into thumb death zone on large phones; hard to tap accurately | Match System (discoverability) + User Control |
| **Dose entry form** uses raw slider + radio buttons in black box | HIGH | No visual feedback of dosage range; unclear units (grams vs ounces); no preset options | Visibility of System Status + Error Prevention |
| **No onboarding flow** documented; users land on confusing 6-tab interface | HIGH | Cognitive overload; unclear app purpose or key first action | User Control + Help/Documentation |
| **Settings screen** - missing design (mentioned in codebase, not implemented) | MEDIUM | Users can't customize app; no personalization path | User Control |
| **Plan/Insights screens** - placeholder stubs | HIGH | Core product value (taper planning) not delivered; users see empty screens | System Capability |

#### B. Visual & Typography
| Issue | Severity | Impact | Heuristic Violated |
|-------|----------|--------|-------------------|
| **DoseForm uses hardcoded black (`backgroundColor: 'black'`) + white text** | HIGH | Breaks dark/light theme consistency; ignores theme context | Consistency with System (Material 3) |
| **No visual hierarchy** in list items; all text same size/weight | MEDIUM | Timeline hard to scan; can't quickly distinguish past/present/future doses | Visibility |
| **Font scale not 8px based** - random sizes (12px radioText, 24px dosageText) | MEDIUM | Inconsistent, amateur feel; hard to maintain | Consistency |
| **Spacing inconsistent** - some 20px padding, some 50px margins, no design tokens | MEDIUM | Layout feels ad-hoc, not systematic | Consistency |

#### C. Accessibility (WCAG 2.2)
| Issue | Severity | Impact | Heuristic Violated |
|-------|----------|--------|-------------------|
| **Radio button colors hardcoded white** (`uncheckedColor="white"` + white text) | HIGH | 0% contrast on white backgrounds; fails WCAG AAA | Accessibility Standard |
| **Slider thumbTintColor hardcoded red** (`#FF0000`) | MEDIUM | May not be visible on all backgrounds; no theme integration | Contrast (3:1 minimum) |
| **No focus indicators** visible for keyboard navigation | MEDIUM | Non-keyboard-friendly; fails WCAG keyboard requirement | Accessibility |
| **No alt text or accessibility labels** on non-text buttons | MEDIUM | Screen reader users can't navigate | ARIA/Accessibility |

#### D. State & Error Handling
| Issue | Severity | Impact | Heuristic Violated |
|-------|----------|--------|-------------------|
| **No loading states** during Firebase ops; UI might freeze | MEDIUM | Users unsure if action succeeded; no feedback | Visibility of System Status |
| **No error boundaries** - crashes may not be caught | MEDIUM | Silent failures; users lose trust | Error Recovery |
| **Pro Feature Gate** shows lock overlay with loading spinner but inconsistent styling | MEDIUM | Feels unfinished; tone breaks between screens | Consistency |

#### E. Mobile UX Specifics
| Issue | Severity | Impact | Heuristic Violated |
|-------|----------|--------|-------------------|
| **Slider form doesn't adapt to landscape** - "Slide me" text may get cut off | MEDIUM | Unusable on rotated device | Responsive Design |
| **FAB (floating action button) placement** at bottom-right - conflicts with iOS safe area on notched phones | MEDIUM | FAB might sit under notch or home indicator | Mobile Convention |
| **No gesture support** (swipe, long-press, pull-to-refresh) | LOW | Missing affordances; feels incomplete vs native iOS/Android apps | Mobile Convention |

### Heuristic Summary (Nielsen's 10)
- ❌ **#1 System Status Visibility:** No loading/error feedback
- ❌ **#2 System-World Match:** Theme inconsistencies (hardcoded colors)
- ⚠️ **#3 User Control:** No escape hatches, tab bar hard to use
- ⚠️ **#4 Error Prevention:** No input validation shown
- ⚠️ **#5 Error Recovery:** Missing error boundaries
- ✅ **#6 Help/Docs:** Exists (Plane ticket system, but not in-app)
- ❌ **#7 Flexibility:** No presets, no customization
- ⚠️ **#8 Aesthetic:** Inconsistent spacing, hardcoded colors
- ⚠️ **#9 Help/Error Messages:** Missing most error states
- ❌ **#10 Accessibility:** Fails WCAG 2.2 (contrast, keyboard nav)

---

## 2. TARGET DESIGN SYSTEM SPEC (Material 3 in RN)

### Color Palette (8 primary colors + semantic scale)
```javascript
// tokens/colors.ts
export const ColorTokens = {
  // Primary: Soft teal (substance-abuse recovery = hope + calm)
  primary: {
    50: '#F0F9F8',
    100: '#D1EEE9',
    200: '#A3DED4',
    300: '#75CEBD',  // Main brand
    400: '#58C4AC',
    500: '#3BAA93',  // Darker primary
    600: '#2D8B78',
    700: '#1F6B5D',
    800: '#134C42',
    900: '#0A2E27',
  },
  
  // Neutral: Cool grays (clean, medical feel)
  neutral: {
    0: '#FFFFFF',
    50: '#F8F8F8',
    100: '#F3F3F3',
    200: '#E8E8E8',
    300: '#DCDCDC',
    400: '#C0C0C0',
    500: '#888888',
    600: '#666666',
    700: '#444444',
    800: '#222222',
    900: '#121212',
  },
  
  // Semantic: Success (recovery), Warning (relapse risk), Error (critical)
  success: '#10B981',    // Green - progress, milestones
  warning: '#F59E0B',    // Amber - risk alerts, tapering warnings
  error: '#EF4444',      // Red - critical actions, mistakes
  info: '#3B82F6',       // Blue - information, tooltips
};

// Also define:
// - Surface colors (cards, containers)
// - Overlay colors (modals, dialogs)
// - Shadow scales (z-depth 1-4)
```

### Typography Scale (8px baseline)
```javascript
// tokens/typography.ts
export const TypographyScale = {
  // Display (hero titles, onboarding)
  displayLarge:  { fontSize: 57, lineHeight: 64, fontWeight: 400, letterSpacing: 0 },
  displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: 400, letterSpacing: 0 },
  displaySmall:  { fontSize: 36, lineHeight: 44, fontWeight: 400, letterSpacing: 0 },
  
  // Headline (section titles)
  headlineLarge:  { fontSize: 32, lineHeight: 40, fontWeight: 600, letterSpacing: 0 },
  headlineSmall:  { fontSize: 20, lineHeight: 28, fontWeight: 600, letterSpacing: 0.1 },
  
  // Title (card titles, tab labels)
  titleLarge:  { fontSize: 22, lineHeight: 28, fontWeight: 600, letterSpacing: 0 },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: 500, letterSpacing: 0.15 },
  titleSmall:  { fontSize: 14, lineHeight: 20, fontWeight: 500, letterSpacing: 0.1 },
  
  // Body (primary content)
  bodyLarge:  { fontSize: 16, lineHeight: 24, fontWeight: 400, letterSpacing: 0.5 },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: 400, letterSpacing: 0.25 },
  bodySmall:  { fontSize: 12, lineHeight: 16, fontWeight: 400, letterSpacing: 0.4 },
  
  // Label (buttons, badges)
  labelLarge:  { fontSize: 14, lineHeight: 20, fontWeight: 500, letterSpacing: 0.1 },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: 500, letterSpacing: 0.5 },
  labelSmall:  { fontSize: 11, lineHeight: 16, fontWeight: 500, letterSpacing: 0.5 },
};
```

### Component States (Wean-Specific)
```javascript
// Button states
Button {
  enabled:    { bg: primary[300], text: neutral[0], shadow: z1 }
  pressed:    { bg: primary[400], scale: 0.98, shadow: z2 }
  disabled:   { bg: neutral[200], text: neutral[400] }
  loading:    { opacity: 0.6, spinner: primary[300] }
}

// Input states (slider, text field)
Input {
  default:    { border: neutral[300], bg: neutral[50], text: neutral[900] }
  focused:    { border: primary[300], outline: primary[100], shadow: z1 }
  filled:     { bg: primary[50], border: primary[300] }
  error:      { border: error, outline: error[100] }
  disabled:   { bg: neutral[100], text: neutral[400] }
}

// Card states (dose entry, timeline items)
Card {
  default:    { bg: neutral[50], border: neutral[200], radius: 12 }
  highlighted:{ bg: primary[50], border: primary[200] }
  active:     { bg: primary[100], border: primary[300], shadow: z2 }
  error:      { bg: error[50], border: error[200] }
}

// Progress indicators
Progress {
  track:      { bg: neutral[200], height: 4 }
  fill:       { bg: primary[400], animation: smooth }
}
```

### Spacing & Layout Grid
```javascript
// tokens/spacing.ts
export const Spacing = {
  0:   0,
  2:   2,
  4:   4,
  6:   6,    // xs gaps
  8:   8,    // default gap
  12:  12,   // sm spacing
  16:  16,   // md (default padding)
  24:  24,   // lg
  32:  32,   // xl
  40:  40,   // 2xl
  48:  48,   // 3xl (section gap)
  56:  56,   // 4xl
  64:  64,   // 5xl (major gap)
};

// Safe area margins (accounting for notches)
export const SafeAreaInsets = {
  screenPadding: 16,    // top/bottom/sides
  contentGap:    8,     // between items
  bottomBar:     12,    // above FAB/tab bar
};
```

---

## 3. INFORMATION ARCHITECTURE (IA) & SCREEN FLOW REDESIGN

### Current IA (6 confusing tabs)
```
Tab Bar (bottom, hard to reach)
├── Debug (dev only, shouldn't be in prod UI)
├── Daily (timeline, good)
├── Dose (form, good)
├── Insight (empty stub)
├── Plan (empty stub)
├── Settings (unimplemented)
```

### Proposed IA (3-tier, glanceable)
```
HOME (Daily Tab)
├── Recovery Status Card (taper progress, next milestone)
├── Today's Timeline (doses, mood, notes)
├── Quick Dose Button (primary CTA, prominent)
└── Bottom Nav: [Daily] [Plan] [Settings]

PLAN (Secondary Tab)
├── Your Taper Schedule (visual graph, not table)
├── Recovery Milestones (badges, dates)
├── Recommendations (AI-driven, safe tapering)
└── Edit Plan Button (gated to pro)

SETTINGS (Tertiary Tab)
├── Recovery Goals (substance, current dose, target)
├── Preferences (notifications, theme, units)
├── Health Integrations (Health app sync)
├── Support (contact, FAQs, feedback)
└── Account (sign out, delete account)

MODALS/OVERLAYS (contextual, not tabs)
├── Quick Dose Entry (modal from Home CTA)
├── Dose Detail (tap timeline item to view/edit)
├── Insights Dashboard (swipe-up from Daily)
├── Pro Paywall (feature gate)
└── Notifications (alert center)

ONBOARDING FLOW (First 3 screens)
├── Welcome (brand, value prop)
├── Recovery Setup (substance, dosage, goal)
└── Notification Preferences → Home
```

### Why This Works
1. **Reduced cognitive load:** 3 tabs instead of 6 (remove Debug, hide Insights/Paywall in modals)
2. **Clear hierarchy:** Daily is entry point, Plan for strategy, Settings for control
3. **Mobile-first:** Tab bar has room for future growth; swipe gestures supported
4. **Accessibility:** Fewer choices, larger touch targets, clearer labels

---

## 4. ITERATION LOOP: Screenshot Critique Process

### Vision Model-Friendly Workflow

**Phase 1: High-Fidelity Mockup**
1. Use Figma or Expo Snack to create screenshot
2. Export as PNG (1080px width, mobile aspect ratio)
3. Save to: `docs/ux-iterations/{date}-{component-name}.png`

**Phase 2: Vision Model Critique**
```
Prompt to Claude with screenshot:
"Review this [component name] for:
1. Heuristic violations (Nielsen 10)
2. Accessibility issues (WCAG 2.2)
3. Mobile usability (thumb zones, gesture space)
4. Visual hierarchy (contrast, spacing, typography)
5. Consistency with Material 3 token system
6. Specific UX improvements (be actionable)"
```

**Phase 3: Iterate & Screenshot Again**
1. Implement feedback from critique
2. Capture new screenshot
3. Compare before/after (save both)
4. Document decision rationale

**Phase 4: Code Review**
```
- [ ] Tokens used (no hardcoded colors)
- [ ] Typography scale applied
- [ ] Spacing grid consistent (8px multiples)
- [ ] Focus states visible
- [ ] Dark mode works
- [ ] Accessibility props set (testID, accessibilityLabel)
- [ ] No console warnings
```

### Tools & Setup
```bash
# Create iteration tracking
mkdir -p docs/ux-iterations
touch docs/ux-iterations/ITERATIONS.md  # Log each change

# Screenshot commands
# Expo Snack: Built-in preview → tap "Share" → "Save as PNG"
# Or use React Native Screenshot tool:
npm install --save-dev react-native-screenshot
```

---

## 5. PHASED IMPLEMENTATION ROADMAP

### PHASE 1: Foundation (Weeks 1-2) — CRITICAL PATH
**Goal:** Fix broken heuristics, establish token system
**Effort:** 40h | **Risk:** Low

**Deliverables:**
1. ✅ Design tokens file (`src/tokens/`)
   - Colors (primary, neutral, semantic)
   - Typography scale
   - Spacing grid
   - Component states
   
2. ✅ Remove hardcoded colors from DoseForm, DailyPage, other components
   - Replace `backgroundColor: 'black'` → `theme.colors.background`
   - Replace `color: 'white'` → `theme.colors.onBackground`
   - Replace `thumbTintColor: '#FF0000'` → `theme.colors.primary`
   - Test light/dark mode still works

3. ✅ Fix accessibility (WCAG 2.2)
   - Add `accessibilityLabel` to RadioButton, Slider
   - Ensure 4.5:1 contrast on all text
   - Test with screen reader (TalkBack on Android)

4. ✅ Reduce tab bar from 6 → 3 tabs
   - Hide Debug screen (dev-only toggle in settings)
   - Move Insights to modal (swipe-up from Daily)
   - Remove Paywall tab (feature gate instead)
   - Update navigation stack

**Ticket Breakdown:**
- WEAN-7: Implement design tokens (colors, typography)
- WEAN-8: Remove hardcoded colors, use theme tokens
- WEAN-9: Add accessibility labels + contrast fixes
- WEAN-10: Reduce tab bar to 3 (Daily, Plan, Settings)

---

### PHASE 2: Core UX Overhaul (Weeks 3-5) — MVP REDESIGN
**Goal:** Rebuild Daily/Plan screens with new IA, fix empty placeholders
**Effort:** 80h | **Risk:** Medium (complex states, testing)

**Deliverables:**
1. ✅ Daily Screen Redesign
   - Recovery Status Card (progress bar + milestone)
   - Today's Timeline (new DailyDoseTimeline component rewrite)
   - Visual spacing (16px padding, 8px item gaps)
   - Loading + error states
   - **Screenshot critique loop:** 3 iterations min

2. ✅ Plan Screen Implementation
   - Taper schedule visualization (line chart, not table)
   - Milestone badges (30 days, 60 days, etc.)
   - Recommendations box (basic, can be AI later)
   - Pro feature gate overlay
   - **Screenshot critique:** 2 iterations

3. ✅ Dose Entry Modal
   - Replace form tab with full-screen modal from Home button
   - Quick presets (common doses)
   - Unit selector (gram vs ounce)
   - Substance selector (autocomplete)
   - Visual feedback (dose value large + bold)
   - **Screenshot critique:** 2 iterations

4. ✅ Settings Screen (implemented, not stub)
   - Recovery goals section
   - Notification preferences
   - Theme selector (light/dark)
   - Units preference (metric/imperial)
   - **Screenshot critique:** 1 iteration

**Ticket Breakdown:**
- WEAN-11: Redesign Daily screen (Recovery Status + Timeline)
- WEAN-12: Implement Plan screen (taper schedule + milestones)
- WEAN-13: Redesign Dose Entry as modal with presets
- WEAN-14: Implement Settings screen (goals, prefs, theme)

---

### PHASE 3: Polish & Animations (Weeks 6-7) — FEELS NATIVE
**Goal:** Add micro-interactions, gesture support, enterprise feel
**Effort:** 60h | **Risk:** Low (isolated feature)

**Deliverables:**
1. ✅ Micro-Interactions
   - Button press scale (0.98) + 200ms ease
   - Loading spinner on async actions
   - Success toast (slide up + fade out)
   - Swipe-to-dismiss modals
   - Pull-to-refresh on timeline

2. ✅ Gesture Support
   - Swipe-up to reveal Insights dashboard
   - Long-press dose item to edit/delete
   - Swipe-left to archive old doses

3. ✅ Dark Mode Polish
   - Test all components in dark mode
   - Verify contrast ratios hold
   - Adjust shadow opacity for dark

4. ✅ Onboarding Flow
   - Welcome screen (brand, 1 CTA)
   - Recovery setup (substance, dose, goal)
   - Notification opt-in
   - → Home

**Ticket Breakdown:**
- WEAN-15: Add micro-interactions (buttons, spinners, toasts)
- WEAN-16: Implement gesture handlers (swipe, long-press)
- WEAN-17: Dark mode final polish
- WEAN-18: Implement onboarding flow

---

### PHASE 4: Advanced Features (Weeks 8+) — OPTIONAL, NOT MVP
**Goal:** AI recommendations, analytics, integrations
**Effort:** 120h+ | **Risk:** High (complexity + dependencies)

**Deliverables:**
1. Insights dashboard (with basic analytics)
2. AI taper recommendations (backend API required)
3. Health app integration (HealthKit/Google Fit)
4. Notification reminders (scheduling)
5. Export data (PDF report)

---

## 6. RISK ASSESSMENT & MITIGATION

| Risk | Phase | Impact | Mitigation |
|------|-------|--------|-----------|
| **Dark mode breaks after token changes** | P1 | HIGH | Test every component in both themes before merge |
| **Accessibility regression** | P1-2 | HIGH | Run screen reader test (TalkBack) before release |
| **Performance: heavy animations** | P3 | MEDIUM | Profile FPS with React DevTools before shipping |
| **Onboarding complexity** | P4 | MEDIUM | A/B test with small user group first |
| **Firebase loading blocks UI during redesign** | P2 | MEDIUM | Add loading state guards, defer non-critical queries |
| **Tab bar reduction breaks user habits** | P2 | MEDIUM | Provide in-app tutorial on first launch |

---

## 7. SUCCESS METRICS (Definition of Done)

**By end of PHASE 2:**
- ✅ All Nielsen 10 heuristics at 80%+ compliance
- ✅ WCAG 2.2 AA level (contrast 4.5:1, keyboard nav functional)
- ✅ Mobile usability: 90%+ of actions reachable without reachability stretch (on 6.1" phone)
- ✅ Screenshot critiques: 0 heuristic violations remaining
- ✅ User testing: 5+ users can complete dose entry in <30 seconds
- ✅ Performance: 60 FPS during timeline scroll + theme switch
- ✅ Test coverage: 80%+ of new components have unit tests
- ✅ CI green: TypeScript no errors, ESLint clean, all tests pass

---

## 8. IMMEDIATE NEXT STEPS (For Execution)

1. **Approve this spec** — Jarad sign-off on IA, colors, phases
2. **Create branch:** `wean-ux-overhaul-phase-1`
3. **Start WEAN-7:** Implement design tokens (8h)
4. **Assign to:** Tongy (mobile IC)
5. **Timeline:** Phase 1 done by end of Week 1 (Feb 28)
6. **Communication:** Daily standup with Rar (mobile lead), Cack (CTO)

---

**Document Version:** 1.0  
**Status:** Ready for Approval  
**Author:** Tongy (Wean IC)  
**Last Updated:** 2026-02-26 22:45 EST
