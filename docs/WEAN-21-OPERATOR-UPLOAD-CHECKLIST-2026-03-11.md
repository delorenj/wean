# WEAN-21 Final Operator Upload Checklist

Timestamp: 2026-03-11 20:46 ET  
Branch: `wean-21-play-store-submission-2026-03-10`

## Play Console Field Mapping (source + status)

| Play Console Field | Required | Source File / Command | Current Status | Operator Action |
|---|---:|---|---|---|
| App name | Yes | `docs/play-store-listing.md` | READY | Use: **Wean: Taper & Track** |
| Short description | Yes | `docs/play-store-listing.md` | READY | Copy approved 79-char text |
| Full description | Yes | `docs/play-store-listing.md` | READY | Copy approved full block |
| Category | Yes | `docs/play-store-listing.md` | READY | Set Health & Fitness |
| Content rating answers | Yes | `docs/play-store-listing.md` | NEEDS_REVIEW | Fill questionnaire in console |
| Privacy policy URL | Yes | `docs/privacy-policy.md` (content only) | MISSING | Provide hosted public URL |
| App icon | Yes | `assets/icon.png` | NEEDS_REVIEW | Export/verify 512x512 final icon |
| Feature graphic | Yes | `assets/playstore/feature-graphic-1024x500.png` | MISSING | Add final creative file |
| Phone screenshots (2-8) | Yes | `assets/playstore/screenshots/phone/*.png` | MISSING | Add min 2, target 5 |
| 7-inch tablet screenshots | No | `assets/playstore/screenshots/tablet7/*.png` | MISSING | Optional (recommended) |
| 10-inch tablet screenshots | No | `assets/playstore/screenshots/tablet10/*.png` | MISSING | Optional (recommended) |
| Android package name | Yes | `app.json` (`expo.android.package`) | READY | `com.lasertoast.wean` |
| Version code | Yes | `app.json` + EAS prod | READY | `versionCode` set; prod autoIncrement |
| AAB artifact | Yes | `npx eas build --platform android --profile production` | MISSING | Build or reuse approved AAB |
| Release track | Yes | Product decision | MISSING | Choose `internal/closed/production` |
| Release notes | Yes | Operator-provided text | MISSING | Add concise changelog |

## Directory Contract Verification

- Contract doc: `assets/playstore/README.md`
- Manifest template: `assets/playstore/manifest.template.yaml`

## Operator Gate Checklist

- [ ] `assets/playstore/manifest.template.yaml` copied to `assets/playstore/manifest.yaml` and filled
- [ ] Privacy policy public URL resolves without auth
- [ ] Feature graphic exists and matches 1024x500
- [ ] At least 2 phone screenshots added
- [ ] AAB build ID/path recorded in manifest
- [ ] Release track selected
- [ ] Play Console draft saved with no required-field errors

## Command Evidence

```bash
cd /home/delorenj/code/wean
ls -la assets/playstore
cat assets/playstore/manifest.template.yaml
cat docs/play-store-listing.md
cat app.json
cat eas.json
```
