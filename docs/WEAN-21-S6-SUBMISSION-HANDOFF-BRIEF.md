# WEAN-21 S6 — Submission Handoff Brief

**Owner lane:** bub  
**Timestamp:** 2026-03-11 20:46 ET

## Objective
Provide a send-ready handoff for executing Play Console submission once assets and policy URL are finalized.

## Ready Now
- Build/listing/privacy docs exist:
  - `docs/PLAY_STORE_SUBMISSION_PACK.md`
  - `docs/play-store-listing.md`
  - `docs/play-store-build-guide.md`
  - `docs/privacy-policy.md`
- Build config present in repo (`app.json`, `eas.json`).

## Blocking Inputs
1. Feature graphic (1024x500)
2. Phone screenshots (2-8)
3. Public privacy policy URL confirmation
4. Track decision (`internal`/`closed`/`production`)

## Execute-on-Unblock Commands
```bash
cd /home/delorenj/code/wean
npx eas build --platform android --profile production
npx eas submit --platform android --profile production
```

## Handoff Verdict
**READY FOR OPERATOR HANDOFF** once the four blocking inputs above are supplied.
