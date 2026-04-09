# WEAN-21 Operator Dispatch Sheet (Paste-Send)

**Timestamp:** 2026-03-11 21:18 ET  
**Branch:** `wean-21-play-store-submission-2026-03-10`

Use the 4 messages below in strict order.

---

## 1) Release-Track Approval (send to Jarad)

```text
Need final release-track approval for WEAN-21 Play submission.

Recommendation: CLOSED TESTING first, then staged production rollout.
Reason: lower launch risk while we finalize external dependencies and validate with a controlled cohort.

Reply with ONE:
- APPROVED: closed testing
- OVERRIDE: internal
- OVERRIDE: production

Blocking status: Play upload cannot proceed until this is confirmed.
```

---

## 2) Content-Rating Approval (send to Jarad)

```text
Need approval for WEAN-21 Play content-rating packet before console submission.

Proposed answers framing:
- Health & Fitness harm-reduction tracker
- Substance references are tracking/reduction only
- No gambling, violence, sexual content, user-generated content, or real-money mechanics

Reply with ONE:
- APPROVED content-rating packet
- CHANGES: <exact question + replacement answer>

Blocking status: content-rating section cannot be finalized without this approval.
```

---

## 3) Design Asset Request (send to assigned design owner)

```text
WEAN-21 Play assets needed for upload. Please deliver to exact repo paths:

Required:
1) Feature graphic
   - assets/playstore/feature-graphic-1024x500.png
   - 1024x500 PNG/JPG

2) Phone screenshots (min 2, target 5)
   - assets/playstore/screenshots/phone/
   - 01-daily-view-1080x1920.png
   - 02-dose-entry-1080x1920.png
   - 03-progress-chart-1080x1920.png
   - 04-taper-plan-1080x1920.png
   - 05-settings-1080x1920.png

Optional (recommended):
- assets/playstore/screenshots/tablet7/
- assets/playstore/screenshots/tablet10/

Creative constraints:
- Brand: #58BC82 family
- App name: Wean: Taper & Track
- Tone: supportive, non-judgmental
- No cure/treatment guarantee language

Please reply with:
- ASSIGNEE: <name>
- ETA: <date/time ET>
- DELIVERY: confirmed paths
```

---

## 4) Privacy URL Request (send to web/infra owner)

```text
WEAN-21 Play submission requires a public HTTPS privacy policy URL.

Source policy content is ready at:
- docs/privacy-policy.md

Please publish and reply with:
- URL: https://...
- PUBLIC_ACCESS: confirmed (no auth required)

Preferred target:
- https://wean.app/privacy
Fallback:
- GitHub Pages URL

Blocking status: Play listing cannot be submitted without this URL.
```

---

## Operator Note
After all 4 replies are in, update:
- `assets/playstore/manifest.yaml`
- `docs/WEAN-21-OPERATOR-UPLOAD-CHECKLIST-2026-03-11.md`
and proceed with final Play Console upload flow.
