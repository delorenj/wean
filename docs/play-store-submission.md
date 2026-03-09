# WEAN-21 — Play Store Submission Pack (Wean)

Last updated: 2026-03-09  
Owner: Jarad  
Branch: `chore/WEAN-21-play-store-submission`

This doc packages Play Store listing copy, visual assets, Android build checks, and submission steps for Wean.

---

## 1) App context (for listing + review)

**Product:** Wean  
**Positioning:** Wellness-focused taper support app for dose tracking, trend visibility, and reduction planning.  
**Stack:** Expo/React Native + Firebase + RevenueCat.

### Core capabilities verified in codebase

- **Dose tracking + timeline:** quick add/edit/delete dose entries (`pages/dose.js`, `components/DailyDoseTimeline/*`, `hooks/useDoses.ts`)
- **Rolling calendar + daily gauge:** 7-day review + daily target visualization (`components/RollingCalendarWeek/*`, `components/DailyDoseGauge/*`)
- **Onboarding flow:** 4-screen onboarding with "get started" handoff (`pages/onboarding.tsx`, `pages/onboarding.helpers.ts`)
- **Settings + sync status:** theme/unit/sort prefs, notification toggle, sync status + manual sync (`pages/settings.tsx`, `hooks/useSyncStatus.ts`, `components/SyncStatusIndicator/*`)
- **Offline-first sync model:** Firestore snapshot metadata + pending write awareness (`hooks/useDoses.ts`, `hooks/useSyncStatus.ts`)
- **Premium-gated features:** paywall, trends, taper planning, goals (`components/Paywall/*`, `pages/trends.tsx`, `pages/plan.tsx`, `pages/taper-plan.tsx`, `pages/goals.tsx`)
- **Account controls:** in-app account deletion confirmation flow (`pages/settings.tsx`, `hooks/useAccountDeletion.ts`)

---

## 2) Required Play Store graphic assets

### Generated placeholder assets (ready for internal track)

Files created:
- `docs/play-store-assets/app-icon-512.png` (512x512 PNG)
- `docs/play-store-assets/feature-graphic-1024x500.png` (1024x500 PNG, RGB/no alpha)
- `docs/play-store-assets/generate-placeholders.py`
- `docs/play-store-assets/generate-placeholders.sh`

Regenerate anytime:

```bash
bash docs/play-store-assets/generate-placeholders.sh
```

### App icon
- Spec: 512x512 PNG, <= 1024 KB
- Current placeholder: generated from `assets/icon.png`

### Feature graphic
- Spec: 1024x500 PNG/JPEG, no alpha
- Current placeholder: branded gradient + mascot + text

---

## 3) Store listing copy (Play Console ready)

### Title (max 30 chars)
`Wean: Dose & Taper Tracker`  
Character count: **26**

### Short description (max 80 chars)
`Track doses, monitor trends, and follow a personalized taper plan at your pace.`  
Character count: **79**

### Full description (max 4000 chars)
Character count: **1552**

```text
Wean is a wellness-focused companion for people who want to reduce and eventually stop substance use at a pace they can sustain.

Instead of trying to rely on memory, Wean gives you a simple way to log doses in seconds, review daily patterns, and plan gradual taper goals. The experience is private-by-default, with anonymous sign-in and account deletion controls.

WHAT YOU CAN DO
• Log doses quickly with amount, unit, notes, and timestamp
• View your day in a clean timeline with edit/delete controls
• Navigate a rolling 7-day calendar to review consistency
• Monitor daily totals with a visual gauge
• Check sync status (offline, syncing, synced) and trigger manual sync
• Tune app preferences (theme, default unit, sort order, notifications)

PREMIUM FEATURES
• Trend analytics (weekly/monthly views, reduction streaks, averages)
• Guided taper planning with personalized targets
• Goal tracking with progress and history
• Subscription management through Google Play billing

BUILT FOR PRIVACY AND CONTROL
• Anonymous auth supported for low-friction onboarding
• Data scoped to your account in Firestore security rules
• In-app account deletion with confirmation

IMPORTANT
Wean is a self-tracking and habit-support tool, not a medical device and not a replacement for professional care. If you are dealing with withdrawal symptoms or a medical emergency, seek licensed medical support immediately.

Whether your goal is to taper gradually or understand your current patterns, Wean helps you make consistent, informed progress one day at a time.
```

---

## 4) Screenshot requirements + capture plan

### Technical requirements (Google Play)
- JPEG or 24-bit PNG (no alpha)
- Min dimension: 320 px
- Max dimension: 3840 px
- Max side cannot exceed 2x min side
- At least 2 screenshots required to publish
- Up to 8 screenshots per device class

### Target capture sizes
- **Phone portrait:** 1080x1920
- **7" tablet portrait:** 1200x1920
- **10" tablet portrait:** 1600x2560
- **Tablet landscape option:** 1920x1200 or 2560x1600

### Screenshot shot list (phone + tablet where possible)
1. Onboarding screen sequence (value prop + taper teaser)
2. Daily home: rolling calendar + gauge + timeline
3. Add Dose screen (quick entry controls)
4. Edit/Delete dose action from timeline
5. Trends analytics (weekly/monthly)
6. Taper Plan screen (or paywall gate if unsubscribed)
7. Goals screen (or paywall gate)
8. Settings screen showing sync + privacy/account controls

Capture guidance:
- Use realistic but non-identifiable sample data
- Avoid medical claims in captions/overlays
- Keep copy wellness-oriented (tracking, support, taper progress)

---

## 5) Privacy policy URL placeholder

Play Console requires a public HTTPS privacy policy URL.

Recommended placeholder until hosted:
- `https://wean.app/privacy-policy`

Current in-app link target:
- `https://wean.app/privacy` (from `pages/settings.tsx`)

Before submission, ensure final hosted URL is public, stable, and matches app behavior.

---

## 6) Content rating questionnaire notes (substance taper context)

Because Wean discusses dose tracking and tapering, answer carefully with a **health/wellness support** framing.

Suggested positioning:
- App purpose: personal tracking + wellness support for reduction/taper progress
- Not entertainment, not promotional, not instructional for use escalation
- Includes explicit disclaimer: not medical advice

IARC response considerations:
- **Drug references:** likely **Yes** (context is tracking substance intake history)
- **Drug glorification or encouragement:** **No**
- **Violence/sexual/gambling/profanity:** **No**
- **User interaction/public UGC:** **No public social feed**

Policy/risk notes:
- Keep listing language harm-reduction and recovery-oriented
- Avoid copy that could be interpreted as teaching or encouraging consumption
- Consider setting target audience to adults (18+) due subject matter

---

## 7) Android build config verification (release compliance)

### Application/package + version
Verified in `android/app/build.gradle`:
- `applicationId 'com.lasertoast.wean'` ✅
- `versionCode 1` ✅
- `versionName "1.0.0"` ✅

### SDK levels
Verified via `android/build.gradle` defaults + `./gradlew :app:properties`:
- `compileSdkVersion: 35` ✅
- `targetSdkVersion: 34` ✅ (meets Play requirement `>= 34`)
- `minSdkVersion: 24` ✅

### Release signing setup (updated)
`android/app/build.gradle` now supports release signing values with safe fallback:
- `WEAN_UPLOAD_STORE_FILE`
- `WEAN_UPLOAD_STORE_PASSWORD`
- `WEAN_UPLOAD_KEY_ALIAS`
- `WEAN_UPLOAD_KEY_PASSWORD`

Behavior:
- If all 4 are provided: release uses `signingConfigs.release`
- If missing (local dev): release falls back to debug signing

### Optional hardening before production rollout
- Enable minification: `android.enableProguardInReleaseBuilds=true` in `android/gradle.properties` or CI env
- Smoke test signed release build on real Android device before production track

---

## 8) Release signing setup instructions

### 1) Generate upload keystore (one-time)

```bash
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore wean-upload-key.jks \
  -alias wean \
  -keyalg RSA \
  -keysize 2048 \
  -validity 9125
```

### 2) Configure signing secrets (local or CI)

`~/.gradle/gradle.properties` or CI secret env:

```properties
WEAN_UPLOAD_STORE_FILE=/absolute/path/to/wean-upload-key.jks
WEAN_UPLOAD_STORE_PASSWORD=***
WEAN_UPLOAD_KEY_ALIAS=wean
WEAN_UPLOAD_KEY_PASSWORD=***
```

### 3) Build and verify release artifacts

```bash
# APK (internal validation)
cd android && ./gradlew assembleRelease

# Preferred Play artifact via EAS (AAB)
cd .. && eas build --platform android --profile production
```

### 4) In Play Console
- Set up **App Signing by Google Play** (recommended)
- Upload AAB from production profile

---

## 9) End-to-end Play submission checklist

- [ ] Build production AAB (`eas build --platform android --profile production`)
- [ ] Upload app icon (`docs/play-store-assets/app-icon-512.png`)
- [ ] Upload feature graphic (`docs/play-store-assets/feature-graphic-1024x500.png`)
- [ ] Capture and upload phone screenshots (4-8 recommended)
- [ ] Capture and upload tablet screenshots (7" and/or 10")
- [ ] Paste title, short description, full description from this doc
- [ ] Set public privacy policy URL
- [ ] Complete IARC content rating with wellness framing
- [ ] Complete Data safety form to match Firebase + purchase handling
- [ ] Verify audience + app access settings (consider adults 18+)
- [ ] Submit to internal testing track first
- [ ] Validate install/update + core flows (onboarding, dose log, sync, paywall)
- [ ] Promote to production after internal QA signoff
