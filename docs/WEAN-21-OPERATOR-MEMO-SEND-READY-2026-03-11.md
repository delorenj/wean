# WEAN-21 Operator Memo (Send-Ready)

**Timestamp:** 2026-03-11 21:14 ET  
**Branch:** `wean-21-play-store-submission-2026-03-10`  
**Purpose:** Single outbound sequence for clearing remaining external blockers.

## Source Packets
- Blocker packet: `docs/WEAN-21-BLOCKER-RESOLUTION-PACKET-2026-03-11.md`
- External unblock kit: `docs/WEAN-21-EXTERNAL-UNBLOCK-KIT-2026-03-11.md`

---

## Immediate Outbound Asks (strict order)

### 1) Ask: Release-track approval
- **Who to ask:** Jarad (primary approver)
- **Template section to use:** `WEAN-21-EXTERNAL-UNBLOCK-KIT-2026-03-11.md` → **Blocker 3 — Release-Track Approval**
- **Expected response format:**
  - `APPROVED: closed testing`
  - or `OVERRIDE: internal`
  - or `OVERRIDE: production`
- **Why first:** determines submission path and risk profile before asset upload timing decisions.

### 2) Ask: Content-rating approval
- **Who to ask:** Jarad (policy/brand approver)
- **Template section to use:** `WEAN-21-EXTERNAL-UNBLOCK-KIT-2026-03-11.md` → **Blocker 4 — Content Rating Answers**
- **Expected response format:**
  - `APPROVED content-rating packet`
  - or `CHANGES: <exact edits>`
- **Why second:** policy answers must be approved before final console completion.

### 3) Ask: Design asset production + ETA
- **Who to ask:** Design owner / creative producer (assigned by Jarad)
- **Template section to use:** `WEAN-21-EXTERNAL-UNBLOCK-KIT-2026-03-11.md` → **Blocker 1 — Design Assets**
- **Expected response format:**
  - `ASSIGNEE: <name>`
  - `ETA: <date/time ET>`
  - `DELIVERY: <paths confirmed>`
- **Why third:** asset generation depends on approved launch framing and content posture.

### 4) Ask: Privacy policy URL publish
- **Who to ask:** Web/infra owner (hosting)
- **Template section to use:** `WEAN-21-EXTERNAL-UNBLOCK-KIT-2026-03-11.md` → **Blocker 2 — Privacy Policy URL Hosting**
- **Expected response format:**
  - `URL: https://...`
  - `PUBLIC_ACCESS: confirmed`
  - `OPTION: A|B|C`
- **Why fourth:** can execute in parallel with design after approvals are locked.

---

## Operator Execution Notes (post-replies)

1. Update `assets/playstore/manifest.yaml` with approved track + privacy URL + asset statuses.
2. Confirm required files are present in `assets/playstore/` contract paths.
3. Trigger/confirm production AAB decision per blocker packet recommendation.
4. Perform Play Console upload using:
   - `docs/WEAN-21-OPERATOR-UPLOAD-CHECKLIST-2026-03-11.md`

---

## Minimal Ready/Not-Ready Gate

**READY to upload only when all four are resolved:**
- [ ] Release-track decision received
- [ ] Content-rating packet approved
- [ ] Feature graphic + phone screenshots delivered
- [ ] Public privacy-policy URL confirmed
