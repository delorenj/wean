# WEAN-3: Performance Baseline - Expo 52

**Date:** 2026-02-24  
**Expo Version:** 52.0.49  
**React Native:** 0.76.9

## Bundle Analysis (Production Build)

### Android Bundle
- **Bundle size:** 6.29 MB (6.1 MB on disk)
- **Total export size:** 7.2 MB
- **Modules:** 1,652
- **Bundling time:** 7.96 seconds (Metro)

### Asset Breakdown
- MaterialCommunityIcons.ttf: 1.15 MB (18% of bundle)
- Navigation assets: ~2 KB (icons, masks)
- idb (IndexedDB): 3.69 KB

### Historical Comparison
⚠️ **No baseline data from pre-Expo 52 upgrade available.**  
This is our first documented performance measurement.

---

## Runtime Performance Targets (To Be Measured)

### Startup Time (Cold Start)
**Target:** < 3 seconds to interactive  
**Measurement needed:**
1. Launch app from terminated state
2. Measure time to first render
3. Measure time to interactive (can tap buttons)

**How to measure:**
```bash
# Android
adb shell am start -W -n com.lasertoast.wean/.MainActivity
# iOS
instruments -t "Time Profiler" -D launch.trace wean.app
```

### Frame Rate (60 FPS target)
**Scenarios to test:**
- Daily tab: scrolling dose timeline
- Dose entry: slider interaction
- Plan screen: rendering taper schedule
- Settings: modal animations

**How to measure:**
```javascript
// Add to App.js for dev builds
import { enableScreens } from 'react-native-screens';
enableScreens(true);

// Monitor with Flipper or React DevTools Profiler
```

### Memory Footprint
**Target:** < 150 MB steady state  
**Measurement:**
- Initial load memory
- After 5 minutes of interaction
- Memory leaks (navigate 10x between tabs)

---

## Known Performance Risks

### 1. Icon Font Loading (1.15 MB)
- MaterialCommunityIcons loaded synchronously
- **Recommendation:** Consider icon tree-shaking or lazy load

### 2. Bundle Size (6.29 MB)
- Above 5 MB threshold for instant loads
- **Recommendation:** Code splitting, lazy components

### 3. Firebase SDK
- No lazy initialization detected
- Auth loads on app start (blocking)
- **Recommendation:** Defer non-critical Firebase modules

### 4. No Performance Monitoring Configured
- No Sentry, Firebase Performance, or similar
- **Recommendation:** Add `expo-firebase-analytics` or Sentry

---

## Recommended Next Steps

1. **Add Performance Monitoring**
   ```bash
   npx expo install expo-firebase-analytics
   # or
   npm install @sentry/react-native
   ```

2. **Measure Baseline on Device**
   - Android: Pixel 6 or equivalent (mid-range target)
   - iOS: iPhone 12 or equivalent
   - Document cold start, warm start, FPS

3. **Profile Critical Paths**
   - Dose entry flow (most frequent user action)
   - Daily timeline rendering (list performance)
   - Settings taper config (form performance)

4. **Set Performance Budgets**
   - Bundle size: 5 MB (soft) / 8 MB (hard)
   - Cold start: 2s (target) / 3s (max)
   - FPS: 55+ (acceptable) / 60 (target)
   - Memory: 120 MB (target) / 150 MB (max)

---

## Testing Checklist

- [ ] Cold start time (Android debug)
- [ ] Cold start time (Android release)
- [ ] Cold start time (iOS debug)
- [ ] Cold start time (iOS release)
- [ ] FPS during dose slider interaction
- [ ] FPS during timeline scroll
- [ ] Memory after 5-min usage
- [ ] Memory leak test (10x tab navigation)
- [ ] Bundle size after code splitting
- [ ] TTI (Time to Interactive) measurement

---

## Commands for Performance Testing

```bash
# Build production bundle and measure
npx expo export --platform android
du -h dist/_expo/static/js/android/*.hbc

# Run release build on device
npx expo run:android --variant release
npx expo run:ios --configuration Release

# Profile with Flipper (dev build)
npx expo start --dev-client

# Measure with Lighthouse (web)
npx expo export:web
npx lighthouse http://localhost:19006
```
