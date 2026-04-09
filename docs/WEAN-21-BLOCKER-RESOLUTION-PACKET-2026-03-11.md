# WEAN-21 Blocker-Resolution Packet

**Timestamp:** 2026-03-11 20:53 ET  
**Branch:** `wean-21-play-store-submission-2026-03-10`  
**Purpose:** Single decision packet to clear remaining Play Store blockers.

---

## 1) Exact Asset Request Brief (Designer Handoff)

### Required Deliverables (Play Store)

1. **Feature Graphic (Required)**
   - Filename: `assets/playstore/feature-graphic-1024x500.png`
   - Size: **1024 x 500 px**
   - Format: PNG (preferred)
   - Max size: 8MB
   - Content direction:
     - Brand color family: teal/green (`#58BC82` primary)
     - App name visible: **Wean: Taper & Track**
     - Tone: supportive, clean, non-judgmental
     - Avoid: medical claims, before/after body imagery, stigmatizing language

2. **Phone Screenshots (Required, min 2 / target 5)**
   - Directory: `assets/playstore/screenshots/phone/`
   - Suggested filenames:
     - `01-daily-view-1080x1920.png`
     - `02-dose-entry-1080x1920.png`
     - `03-progress-chart-1080x1920.png`
     - `04-taper-plan-1080x1920.png`
     - `05-settings-1080x1920.png`
   - Size: 1080x1920 (portrait)
   - Format: PNG/JPG

3. **Tablet Screenshots (Recommended)
   - 7-inch directory: `assets/playstore/screenshots/tablet7/`
   - 10-inch directory: `assets/playstore/screenshots/tablet10/`
   - At least 2 each recommended

### Creative QA Acceptance
- UI in screenshots matches current app state
- No placeholder text/lorem
- Visual hierarchy clear at thumbnail size
- Consistent typography and spacing
- No policy-risk claims (e.g., “cure”, “treatment guarantee”)

---

## 2) Privacy-Policy Hosting Options + Recommended Default

Local source exists: `docs/privacy-policy.md`  
Play requires a **public HTTPS URL**.

### Option A — `wean.app/privacy` (Recommended Default)
- Host page at: `https://wean.app/privacy`
- Pros:
  - Best brand trust
  - Stable long-term URL
  - Clean app-store presentation
- Cons:
  - Requires domain + deploy setup

### Option B — GitHub Pages static policy
- Example: `https://delorenj.github.io/wean/privacy`
- Pros:
  - Fast to launch
  - Free + simple
- Cons:
  - Lower brand polish vs first-party domain

### Option C — Notion/public doc host
- Pros:
  - Fastest manual setup
- Cons:
  - Weak branding; risk of link drift/permissions changes

### Recommendation
**Use Option A (`https://wean.app/privacy`)** as default.  
Fallback for immediate unblock: Option B until domain page is live.

---

## 3) Release-Track Recommendation + Rationale

### Recommendation: **Closed testing** as first external submission

**Why closed over internal/production:**
- Internal track is useful for team only, but weak signal for near-launch external validation.
- Closed track provides controlled real-user feedback with low blast radius.
- Production first release adds avoidable risk while creative/compliance assets are still finalizing.

### Suggested rollout path
1. **Closed testing** (small cohort, 25–100 users)
2. Fix critical issues
3. Promote to **Production staged rollout** (10% → 25% → 50% → 100%)

---

## 4) AAB Decision Recommendation

### Recommendation: **Generate a fresh production AAB now**

Command:
```bash
cd /home/delorenj/code/wean
npx eas build --platform android --profile production
```

### Rationale
- Ensures artifact aligns with latest approved code and metadata.
- Avoids ambiguity about older build provenance.
- Simplifies release audit trail when linking build ID in Play Console.

### When to reuse an older AAB (not preferred)
Reuse only if:
- Release freeze is strict,
- Existing artifact was built from exact target commit,
- And metadata parity is verified.

---

## Decision Checklist (Owner Sign-off)

- [ ] Designer accepted asset brief and ETA
- [ ] Privacy-policy hosting option selected (A/B/C)
- [ ] Release track approved (`closed` recommended)
- [ ] AAB strategy approved (fresh build recommended)
- [ ] Execution owner assigned for Play Console upload

---

## Immediate Execution Order (post-signoff)

1. Publish privacy URL
2. Drop final assets into `assets/playstore/`
3. Run fresh production AAB build via EAS
4. Upload listing + assets + AAB to chosen track
5. Save console draft and capture submission evidence
