# WEAN-21 Play Console Upload Runbook (Slice 2)

Timestamp: 2026-03-11 20:40 ET  
Branch: `wean-21-play-store-submission-2026-03-10`

## 1) Copy/Paste Play Console Listing Values

### App details
- **App name (<=30 chars):** `Wean: Taper & Track`
- **Short description (<=80 chars):**
  `Track kratom intake, visualize progress, and taper safely with smart planning.`
- **Full description:** source from `docs/play-store-listing.md` (approved draft block)
- **Category:** Health & Fitness
- **Content rating target:** Mature 17+

## 2) Asset Slot Matrix (Upload-Ready)

> Status legend: READY / MISSING / NEEDS_REVIEW

| Play Console Slot | Required | Spec | Repo Source | Status |
|---|---:|---|---|---|
| App icon | Yes | 512x512 PNG | `assets/icon.png` (currently 1024x1024) | NEEDS_REVIEW |
| Feature graphic | Yes | 1024x500 PNG/JPG | `assets/playstore/feature-graphic-1024x500.png` | MISSING |
| Phone screenshots | Yes (2-8) | PNG/JPG | `assets/playstore/screenshots/phone/*.png` | MISSING |
| 7-inch tablet screenshots | No (recommended) | PNG/JPG | `assets/playstore/screenshots/tablet7/*.png` | MISSING |
| 10-inch tablet screenshots | No (recommended) | PNG/JPG | `assets/playstore/screenshots/tablet10/*.png` | MISSING |

## 3) Build/Release Config Snapshot

From repo config:
- Android package: `com.lasertoast.wean` (from `app.json`)
- Android versionCode: `1` (from `app.json`)
- EAS production profile: `autoIncrement: true` (from `eas.json`)

### Recommended build commands
```bash
cd /home/delorenj/code/wean

# Build production AAB
npx eas build --platform android --profile production

# Submit (after listing/assets complete)
npx eas submit --platform android --profile production
```

## 4) Privacy Policy + Contact

- Local policy doc exists: `docs/privacy-policy.md`
- **Required public URL for Play:** still missing confirmation
- Proposed URL target: `https://wean.app/privacy` (or equivalent hosted URL)

## 5) Exact Missing Inputs (blocking Play submission)

1. Final feature graphic file (`1024x500`)
2. Final screenshot set (phone mandatory, tablet optional)
3. Public hosted privacy policy URL
4. Final release-track decision (`internal` / `closed` / `production`)
5. Confirmation whether to reuse existing AAB or trigger fresh production build now

## 6) Next-30-Minute Execution Plan

1. Create `assets/playstore/` folder structure + manifest template.
2. Produce asset intake checklist with filename contract for design handoff.
3. Prepare Play Console step-by-step upload checklist with pass/fail gate lines.

## 7) Operator Checklist (submission gate)

- [ ] Listing fields pasted and saved in Play Console
- [ ] App icon validated (512x512)
- [ ] Feature graphic uploaded (1024x500)
- [ ] At least 2 phone screenshots uploaded
- [ ] Privacy policy URL resolves publicly
- [ ] Production AAB available and signed via EAS
- [ ] Release notes added
- [ ] Track selected and rollout configured
