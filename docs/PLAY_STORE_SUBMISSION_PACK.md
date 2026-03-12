# WEAN-21: Play Store Submission Pack

**Status:** Ready for Asset Creation & Review  
**Created:** March 10, 2026  
**Owner:** Tongy (Mobile IC)

---

## Overview

This submission pack contains everything needed to launch Wean on the Google Play Store. Sprint 1+2+3 are complete, APK is ready, and this is the highest-leverage revenue work to get Wean to market.

---

## Package Contents

### 1. Store Listing Copy ✅
**File:** `docs/play-store-listing.md`

Includes:
- App title (optimized for 30-char limit)
- Short description (80 chars)
- Full description (4000 chars, compelling copy)
- Keywords for search optimization
- Category and content rating recommendations
- Screenshot descriptions and requirements

**Status:** Draft complete, awaiting review

---

### 2. Privacy Policy ✅
**File:** `docs/privacy-policy.md`

Complete privacy policy covering:
- Data collection (minimal, anonymous)
- Firebase and RevenueCat third-party services
- User rights (GDPR, CCPA compliance)
- Data deletion process
- Security measures

**Next Step:** Host at public URL (e.g., https://wean.app/privacy)

---

### 3. Build Configuration ✅
**Files:** `app.json`, `eas.json`

Updates:
- App name: "Wean" (capitalized)
- Description added
- Android version code management (auto-increment)
- Permissions declared
- Primary color set (#58BC82)
- Play Store URL placeholder

**Status:** Configuration complete, ready for production build

---

### 4. Build Guide ✅
**File:** `docs/play-store-build-guide.md`

Comprehensive guide covering:
- EAS build process
- App signing options (Google Play App Signing recommended)
- Play Console setup
- Content rating and data safety sections
- Submission checklist
- Troubleshooting common issues
- Post-submission monitoring

**Status:** Complete reference documentation

---

### 5. Asset Specifications ✅
**File:** `docs/play-store-assets-spec.md`

Detailed specs for:
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (phone: 1080x1920, tablet optional)
- Promotional video (optional)
- Creation workflow and tools

**Status:** Specifications complete, assets need creation

---

## Implementation Status

### ✅ Complete
1. Store listing copy (draft)
2. Privacy policy (draft, needs hosting)
3. Build configuration (app.json, eas.json)
4. Build guide documentation
5. Asset specifications

### ❌ Pending
1. **Host privacy policy** at public URL
2. **Create feature graphic** (1024x500)
3. **Verify/resize app icon** to 512x512
4. **Capture screenshots** (2-8, phone)
5. **Build production AAB** with EAS
6. **Create Play Console app listing**
7. **Upload assets to Play Console**
8. **Submit for review**

---

## Quick Start: Next Actions

### Immediate (Today)
```bash
# 1. Verify app icon dimensions
cd ~/code/wean
file ./assets/icon.png
identify ./assets/icon.png

# If not 512x512, resize:
convert ./assets/icon.png -resize 512x512 ./assets/play-store/icon-512.png

# 2. Create folder structure for assets
mkdir -p assets/play-store/{icon,feature-graphic,screenshots/phone}

# 3. Review and approve store listing copy
cat docs/play-store-listing.md

# 4. Build production AAB
eas build --platform android --profile production
```

### This Week
1. **Asset Creation (4-6 hours)**
   - Feature graphic design in Figma/Canva
   - Screenshot capture from real device
   - Asset review and approval

2. **Privacy Policy Hosting**
   - Set up wean.app domain (or use subdomain)
   - Deploy privacy policy HTML
   - Verify URL is publicly accessible

3. **Play Console Setup (1-2 hours)**
   - Create app in Google Play Console
   - Fill out store listing with copy and assets
   - Complete content rating questionnaire
   - Fill data safety form

4. **Build & Test (1-2 hours)**
   - Download production AAB from EAS
   - Upload to internal testing track
   - Test on real devices
   - Fix any critical issues

5. **Submit for Review**
   - Promote build to production track
   - Submit for Google review
   - Monitor status (expect 1-7 days)

---

## Review Checklist

Before submission, verify:

### Store Listing
- [ ] App title is compelling and search-optimized
- [ ] Short description captures value proposition
- [ ] Full description is comprehensive and persuasive
- [ ] Keywords are relevant for target audience
- [ ] Screenshots show key features clearly
- [ ] Feature graphic looks professional

### Legal & Policy
- [ ] Privacy policy hosted at public URL
- [ ] Privacy policy covers all data practices
- [ ] Content rating completed and accurate
- [ ] Data safety form filled truthfully

### Build & Technical
- [ ] Production AAB built successfully
- [ ] Version code incremented correctly
- [ ] App signed properly
- [ ] Tested on multiple Android versions
- [ ] No crashes or critical bugs
- [ ] In-app purchases work (RevenueCat tested)

### Play Console
- [ ] All required fields filled
- [ ] All assets uploaded and approved
- [ ] App category selected (Health & Fitness)
- [ ] Target audience set (18+)
- [ ] Pricing set (Free with IAP)
- [ ] Distribution countries selected

---

## Timeline Estimate

| Task | Time | Status |
|------|------|--------|
| Store listing copy | 1h | ✅ Complete |
| Privacy policy | 1h | ✅ Complete (needs hosting) |
| Build config | 30m | ✅ Complete |
| Documentation | 2h | ✅ Complete |
| **Asset creation** | **4-6h** | ❌ Pending |
| Privacy policy hosting | 1h | ❌ Pending |
| Play Console setup | 1-2h | ❌ Pending |
| Build & test | 1-2h | ❌ Pending |
| **Review process** | **1-7 days** | ❌ Pending |
| **Total:** | **~2 weeks** | **In Progress** |

---

## Success Metrics

### Pre-Launch
- [ ] All assets created and approved
- [ ] Privacy policy live and accessible
- [ ] Store listing compelling and complete
- [ ] Build tested on real devices, no crashes

### Post-Launch
- [ ] App approved by Google (within 7 days)
- [ ] Live on Play Store and searchable
- [ ] 0 crashes reported in first 48 hours
- [ ] Positive initial reviews (4+ stars)
- [ ] Download tracking set up (Firebase Analytics)

### First 30 Days
- [ ] 100+ downloads
- [ ] 10+ reviews (4+ star average)
- [ ] 5+ premium conversions
- [ ] <1% crash rate
- [ ] Active user retention >40%

---

## Resources & Links

### Documentation
- **Store Listing:** `docs/play-store-listing.md`
- **Privacy Policy:** `docs/privacy-policy.md`
- **Build Guide:** `docs/play-store-build-guide.md`
- **Asset Specs:** `docs/play-store-assets-spec.md`

### External Resources
- **Google Play Console:** https://play.google.com/console
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Play Store Policies:** https://play.google.com/about/developer-content-policy/
- **Android App Bundle Guide:** https://developer.android.com/guide/app-bundle

### Tools Needed
- **EAS CLI:** `npm install -g eas-cli`
- **ImageMagick:** `brew install imagemagick` (for icon resize)
- **Figma/Canva:** For feature graphic creation
- **ADB:** For screenshot capture (included with Android Studio)

---

## Contact & Support

**Owner:** Tongy (Mobile IC)  
**Reports to:** Rar (Lead Mobile Architect)  
**Also reports to:** Cack (CTO)

**Questions or Blockers:**
Report via Plane ticket WEAN-21 or direct message to Cack.

---

## Approval Required

**Jarad DeLorenzo** must approve before submission:
1. ✅ Store listing copy (title, descriptions, keywords)
2. ❌ Feature graphic design
3. ❌ App screenshots (all)
4. ✅ Privacy policy content

**Approval Status:** Pending asset creation

---

## Git Branch

**Branch:** `wean-21-play-store-submission-2026-03-10`  
**Base:** `master`

**Files Added:**
- `docs/play-store-listing.md`
- `docs/privacy-policy.md`
- `docs/play-store-build-guide.md`
- `docs/play-store-assets-spec.md`
- `docs/PLAY_STORE_SUBMISSION_PACK.md` (this file)

**Files Modified:**
- `app.json` (metadata updates for Play Store)
- `eas.json` (no changes, verified config)

---

**Next Command:**
```bash
# Commit and push this submission pack
git add docs/play-store-*.md docs/privacy-policy.md docs/PLAY_STORE_SUBMISSION_PACK.md app.json
git commit -m "WEAN-21: Play Store submission pack (copy, policy, guides)"
git push -u origin wean-21-play-store-submission-2026-03-10

# Create PR for review
gh pr create --base master --head wean-21-play-store-submission-2026-03-10 \
  --title "WEAN-21: Play Store Submission Pack" \
  --body "Complete submission pack with store listing, privacy policy, build config, and asset specs. Ready for asset creation and review."
```

---

**Status:** ✅ Documentation complete, awaiting asset creation and review
