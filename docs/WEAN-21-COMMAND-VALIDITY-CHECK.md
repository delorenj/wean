# WEAN-21 Command Validity Check

**Work item:** WEAN-21-S10  
**Timestamp:** 2026-03-11 22:31 ET

## Scope
Validate that operator runbook commands are syntactically valid, available in this environment, and aligned across WEAN-21 docs.

## Validation results

1. **CLI availability**
- `npx eas --version` -> `eas-cli/16.31.0` ✅

2. **Command presence across docs**
- `npx eas build --platform android --profile production` found in:
  - `docs/WEAN-21-BLOCKER-RESOLUTION-PACKET-2026-03-11.md`
  - `docs/WEAN-21-UPLOAD-RUNBOOK-2026-03-11.md`
  - `docs/WEAN-21-S6-SUBMISSION-HANDOFF-BRIEF.md`
  - `docs/PLAY_STORE_SUBMISSION_PACK.md`
- `npx eas submit --platform android --profile production` found in:
  - `docs/WEAN-21-UPLOAD-RUNBOOK-2026-03-11.md`
  - `docs/WEAN-21-S6-SUBMISSION-HANDOFF-BRIEF.md`

3. **Policy URL consistency**
- Preferred URL `https://wean.app/privacy` consistently referenced in WEAN-21 unblock docs ✅

4. **Track decision consistency**
- Default recommendation is consistently `closed testing` ✅

## QA verdict
**PASS (operator command set is valid and internally consistent).**

## Remaining external blockers (non-command)
- Final design assets (feature graphic + screenshots)
- Public hosted privacy policy URL confirmation
- Release-track approval confirmation from owner
