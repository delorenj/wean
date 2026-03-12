# WEAN-21 External Unblock Kit (Operator-Ready)

**Timestamp:** 2026-03-11 21:10 ET  
**Branch:** `wean-21-play-store-submission-2026-03-10`  
**Purpose:** Copy/paste request templates to clear external dependencies for Play Store submission.

---

## Blocker 1 — Design Assets (feature graphic + screenshots)

### Open owner
- **Primary:** Design owner / creative producer (assign by Jarad)
- **Escalation:** Jarad

### Copy/paste request template

```text
Subject: WEAN-21 Play Store Asset Request (Required for submission)

Need final Play Store creatives delivered to repo paths below.

Required:
1) Feature graphic
   - Path: assets/playstore/feature-graphic-1024x500.png
   - Size: 1024x500
   - Format: PNG/JPG

2) Phone screenshots (min 2, target 5)
   - Path: assets/playstore/screenshots/phone/
   - Filenames:
     - 01-daily-view-1080x1920.png
     - 02-dose-entry-1080x1920.png
     - 03-progress-chart-1080x1920.png
     - 04-taper-plan-1080x1920.png
     - 05-settings-1080x1920.png

Optional (recommended):
- assets/playstore/screenshots/tablet7/
- assets/playstore/screenshots/tablet10/

Creative constraints:
- Brand color family: teal/green (#58BC82)
- App name visible: Wean: Taper & Track
- Tone: supportive, non-judgmental
- No medical cure claims

Please confirm ETA + assignee.
```

---

## Blocker 2 — Privacy Policy Public URL Hosting

### Open owner
- **Primary:** Web/infra owner for domain hosting
- **Escalation:** Jarad

### Copy/paste request template

```text
Subject: WEAN-21 Privacy Policy URL Needed for Play Console

Play Console requires a public HTTPS privacy policy URL.
Current source doc exists at:
- docs/privacy-policy.md

Request:
1) Publish policy at one of:
   - Preferred: https://wean.app/privacy
   - Fallback: GitHub Pages URL
2) Confirm URL is publicly accessible without auth
3) Confirm final URL for Play Console field

Deadline: needed before submission can proceed.
```

---

## Blocker 3 — Release-Track Approval

### Open owner
- **Primary approver:** Jarad
- **Execution owner:** Operator/Cack

### Recommended default
- **Closed testing** first (then staged production rollout)

### Copy/paste approval template

```text
Subject: WEAN-21 Release Track Approval Needed

Please approve launch track for first Android submission.

Recommendation: CLOSED TESTING (not production-first)
Rationale:
- Controlled cohort feedback
- Lower launch risk while final assets/compliance stabilize
- Fast path to production promotion after validation

Reply with one:
- APPROVED: closed testing
- OVERRIDE: internal
- OVERRIDE: production

Need decision to proceed with Play upload flow.
```

---

## Blocker 4 — Content Rating Answers (Play questionnaire)

### Open owner
- **Primary approver:** Jarad (policy/brand risk)
- **Execution owner:** Operator

### Draft answer packet (for approval)

> Use this as proposed baseline; final answers must be confirmed in Play Console UI.

- App category intent: Health & Fitness tracker
- Substance-related references: Yes (kratom tracking/taper support)
- Gambling: No
- Sexual content: No
- Violence: No
- Illegal activity promotion: No (harm-reduction framing)
- User-generated content: No
- Location sharing: No
- Real-money transactions: No

### Copy/paste approval template

```text
Subject: WEAN-21 Content Rating Approval Packet

Need approval of Play content-rating questionnaire answers before submission.

Proposed framing:
- Harm-reduction tracker app
- No gambling, sexual content, violence, UGC, or real-money mechanics
- Substance references are tracking/reduction only (non-promotional)

Please reply:
- APPROVED content-rating packet
OR
- CHANGES: <exact question/answer edits>

Once approved, operator will complete rating section in Play Console.
```

---

## Operator Quick Use (sequence)

1) Send Design Assets template
2) Send Privacy URL Hosting template
3) Send Release-Track Approval template
4) Send Content-Rating Approval template
5) Update `assets/playstore/manifest.yaml` with returned decisions/URLs

---

## Ready References

- `docs/WEAN-21-BLOCKER-RESOLUTION-PACKET-2026-03-11.md`
- `docs/WEAN-21-OPERATOR-UPLOAD-CHECKLIST-2026-03-11.md`
- `assets/playstore/manifest.template.yaml`
