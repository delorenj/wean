# Play Store Build & Submission Guide

## Prerequisites

1. **EAS CLI installed**
   ```bash
   npm install -g eas-cli
   ```

2. **Expo account** with access to project `wean` (projectId: 86590188-803b-4214-b15c-fca910b2cf66)

3. **Google Play Console account** with developer access

4. **App signing configured** (Google Play App Signing recommended)

---

## Build Configuration

### 1. App Version Management

The app uses three version identifiers:

- **Version Name** (`version` in app.json): "1.0.0" - User-facing version
- **Version Code** (`android.versionCode` in app.json): 1 - Internal build number (must increment for each release)
- **Auto-increment** (enabled in eas.json): EAS automatically increments version code

### 2. Build Type: AAB (Android App Bundle)

Google Play Store requires AAB format for new apps (APK is deprecated).

**Why AAB?**
- Smaller download sizes for users
- Dynamic delivery of features
- Required by Google Play Store for new apps

### 3. EAS Build Configuration (eas.json)

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

**What `autoIncrement` does:**
- Automatically increments `android.versionCode` with each build
- No manual version management needed
- Prevents "version code already exists" errors on Play Store

---

## Build Process

### Step 1: Verify Configuration

Check current version:
```bash
cat app.json | grep -A 2 "version"
```

Verify EAS project:
```bash
eas whoami
eas project:info
```

### Step 2: Build Production AAB

```bash
eas build --platform android --profile production
```

**What happens:**
1. EAS increments `android.versionCode` automatically
2. Builds Android App Bundle (AAB)
3. Signs with Google Play App Signing (if configured)
4. Uploads to EAS servers
5. Returns build ID and download URL

**Build time:** ~5-10 minutes

### Step 3: Download AAB

Once build completes:
```bash
# Download automatically with EAS CLI
eas build:download --platform android --profile production

# Or download from EAS dashboard
# https://expo.dev/accounts/[your-account]/projects/wean/builds
```

File will be named: `wean-[build-id].aab`

---

## App Signing

### Option A: Google Play App Signing (Recommended)

**Pros:**
- Google manages signing keys securely
- Easier key rotation if compromised
- Required for Play Integrity API

**Setup:**
1. First upload to Play Console
2. Opt in to "Google Play App Signing"
3. Google generates and manages signing key
4. Upload key for future updates

### Option B: Manual Signing

**Pros:**
- Full control over signing keys

**Cons:**
- More responsibility (if key is lost, app can never be updated)
- Not recommended by Google

**Generate keystore:**
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore wean-upload-key.keystore \
  -alias wean-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Configure in eas.json:**
```json
{
  "build": {
    "production": {
      "android": {
        "credentials": {
          "keystore": {
            "keystorePath": "./wean-upload-key.keystore",
            "keystorePassword": "YOUR_PASSWORD",
            "keyAlias": "wean-key",
            "keyPassword": "YOUR_KEY_PASSWORD"
          }
        }
      }
    }
  }
}
```

**⚠️ Security Note:**
- Never commit keystores or passwords to git
- Store credentials in EAS Secrets or environment variables
- Keep backup of keystore in secure location (e.g., 1Password)

---

## Play Store Submission Checklist

### Before First Submission

- [ ] **Privacy Policy hosted** at public URL (https://wean.app/privacy)
- [ ] **Store listing complete** (title, descriptions, screenshots, feature graphic)
- [ ] **Content rating completed** via Play Console questionnaire
- [ ] **Target audience selected** (18+, substance use references)
- [ ] **App category set** (Health & Fitness)
- [ ] **Pricing & distribution** configured (free with in-app purchases)
- [ ] **Data safety form completed** in Play Console
- [ ] **App content declaration** completed (ads, in-app purchases, etc.)

### Assets Required

- [ ] **App icon:** 512x512 PNG (high-res)
- [ ] **Feature graphic:** 1024x500 PNG/JPEG
- [ ] **Screenshots (phone):** 2-8 images, 1080x1920 or 1920x1080
- [ ] **Screenshots (tablet - optional):** 1200x1920 or 1600x2560
- [ ] **Promotional video (optional):** 30s-2min, MP4/MOV

### Build Requirements

- [ ] **AAB file** downloaded from EAS build
- [ ] **Version code** incremented from previous release
- [ ] **Permissions** match app functionality
- [ ] **Signing** configured (Google Play App Signing recommended)

### Testing

- [ ] **Internal testing track** uploaded first
- [ ] **Test on real devices** (not just emulator)
- [ ] **Test on different Android versions** (API 21+ minimum)
- [ ] **Verify in-app purchases** work (RevenueCat sandbox)
- [ ] **Test offline mode** and data sync
- [ ] **Check for crashes** and performance issues

---

## Submission Process

### 1. Create App in Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in app details:
   - **App name:** Wean
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free

### 2. Set Up Store Listing

**Main store listing:**
- App name: Wean
- Short description: (80 chars max)
- Full description: (4000 chars max)
- Screenshots: Upload 2-8 images
- Feature graphic: Upload 1024x500 image
- App icon: Upload 512x512 image

**Categorization:**
- App category: Health & Fitness
- Tags: wellness, habit tracker, health

### 3. Content Rating

Complete questionnaire in Play Console:
- Select "Yes" for substance use references
- Select target age group (18+)
- Result: Likely "Mature 17+" or "Adults only 18+"

### 4. Data Safety

Declare data collection practices:
- **Personal info:** None (anonymous auth)
- **App activity:** Dose tracking data
- **Data sharing:** Not shared with third parties
- **Data security:** Encrypted in transit and at rest
- **Data deletion:** Users can delete account

### 5. App Content

- **Ads:** No (unless you add them later)
- **In-app purchases:** Yes (RevenueCat subscriptions)
- **Target audience:** Adults (18+)

### 6. Create Release

1. Go to "Production" track
2. Create new release
3. Upload AAB file
4. Add release notes (what's new)
5. Review warnings/errors
6. Submit for review

### 7. Review Process

- **Timeline:** 1-7 days (usually 24-48 hours)
- **Status:** Track in Play Console dashboard
- **Possible outcomes:**
  - **Approved:** App goes live
  - **Rejected:** Address issues and resubmit

---

## Post-Submission

### Monitor Performance

- **Crashes:** Check Play Console > Vitals
- **ANRs (App Not Responding):** Monitor and fix
- **User reviews:** Respond to feedback
- **Ratings:** Track and improve

### Updates

For each update:
1. Increment `version` in app.json (e.g., "1.0.0" → "1.1.0")
2. `versionCode` auto-increments via EAS
3. Build new AAB: `eas build --platform android --profile production`
4. Upload to Play Console
5. Add release notes describing changes
6. Submit for review

### Rollout Strategy

- **Staged rollout:** Release to 10% → 50% → 100% of users
- **Monitor crashes** before increasing percentage
- **Rollback** if critical issues found

---

## Troubleshooting

### Build Fails

**Error: "Version code already exists"**
- Solution: Ensure `autoIncrement: true` in eas.json
- Manual fix: Increment `android.versionCode` in app.json

**Error: "Keystore not found"**
- Solution: Re-run `eas credentials` to configure signing
- Use Google Play App Signing (recommended)

### Submission Rejected

**Reason: "Privacy policy missing"**
- Solution: Add privacy policy URL in store listing and app.json

**Reason: "Content rating incomplete"**
- Solution: Complete questionnaire in Play Console

**Reason: "App crashes on startup"**
- Solution: Test on real devices, fix crashes, resubmit

### App Not Appearing in Search

- **Indexing delay:** Can take 24-48 hours after approval
- **Keywords:** Optimize app title and description for search
- **Category:** Ensure correct category selected

---

## Quick Reference Commands

```bash
# Build production AAB
eas build --platform android --profile production

# Check build status
eas build:list

# Download latest build
eas build:download --platform android --profile production

# View project info
eas project:info

# Configure credentials
eas credentials

# Submit to Play Store (requires Play Store API setup)
eas submit --platform android --profile production
```

---

## Resources

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Play Console:** https://play.google.com/console
- **Google Play Policies:** https://play.google.com/about/developer-content-policy/
- **Android App Bundle Guide:** https://developer.android.com/guide/app-bundle

---

## Next Steps

1. ✅ Review and approve store listing copy
2. ✅ Create/verify assets (icon, feature graphic, screenshots)
3. ✅ Host privacy policy at public URL
4. ✅ Build production AAB with EAS
5. ✅ Create app in Play Console
6. ✅ Complete all store listing sections
7. ✅ Upload AAB to internal testing track first
8. ✅ Test thoroughly on real devices
9. ✅ Submit to production track
10. ✅ Monitor review status and respond to feedback

**Estimated Time to Live:**
- Assets preparation: 2-4 hours
- Play Console setup: 1-2 hours
- Build & testing: 1-2 hours
- Review process: 1-7 days
- **Total:** ~1-2 weeks from start to public availability
