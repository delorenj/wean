# WEAN-22 Conversion Baseline Artifact

**Timestamp:** 2026-03-12 12:47 ET  
**Ticket:** WEAN-22  
**Goal:** Establish measurable conversion baseline for Play listing + premium CTA flow.

---

## 1) Store Listing CTA Copy Set (v1)

### Short Description Variants (<=80 chars)
- **A (Control):** `Track kratom intake, visualize progress, and taper safely with smart planning.`
- **B:** `Reduce kratom step-by-step with daily tracking, taper plans, and progress charts.`
- **C:** `Build a safe taper plan, log doses fast, and track real progress every day.`

### Feature Graphic Headline Variants
- **FG-1:** `Taper with clarity. Track every step.`
- **FG-2:** `Small daily wins. Safer long-term taper.`
- **FG-3:** `See progress. Stay consistent. Wean confidently.`

### Screenshot Caption Set (ordered)
1. `Log doses in seconds`
2. `See your weekly trend`
3. `Follow a smart taper plan`
4. `Hit milestones and stay motivated`
5. `Adjust safely as life changes`

### In-App Premium CTA Variants
- **P1 (Outcome):** `Unlock Smart Taper Planner + Advanced Trends`
- **P2 (Value):** `Go Premium: personalized taper steps and deeper insights`
- **P3 (Urgency):** `Upgrade now to stay on plan with premium guidance`

---

## 2) Hypothesis Table (measurable)

| ID | Hypothesis | Primary Metric | Baseline (to capture) | Target Lift |
|---|---|---|---|---|
| H1 | Short-description variant B/C improves install conversion vs control A | Play Store Visit→Install CVR | Current 7-day CVR | +8% relative |
| H2 | Outcome-led feature graphic headline improves install conversion | Visit→Install CVR by listing asset set | Current 7-day CVR | +5% relative |
| H3 | Reordered screenshot captions improve install conversion and retention intent | Install CVR + D1 open rate | Current D1 open + CVR | +4% CVR, +3% D1 |
| H4 | Outcome-led premium CTA copy improves premium click-through | Premium CTA CTR (session-level) | Current CTA CTR | +10% relative |
| H5 | Value-led premium copy improves trial/upgrade starts | Trial/upgrade start rate | Current start rate | +6% relative |

---

## 3) First Test Plan (Execution Order)

## Phase 0 — Baseline Capture (Day 0)
- Pull last 7-day baseline from Play Console:
  - Store listing visitors
  - Installs
  - Visit→Install CVR
- Pull app baseline:
  - Premium CTA impressions
  - Premium CTA clicks
  - Trial/upgrade starts

## Phase 1 — Listing Test (Days 1–7)
- Apply **Short Description B** + **Feature Graphic FG-1** + caption set order.
- Hold all other listing fields constant.
- Measure delta vs 7-day baseline.
- **Success gate:** >= +5% relative CVR lift.

## Phase 2 — Listing Iteration (Days 8–14)
- If Phase 1 gate missed, rotate to **Short Description C** + **FG-2**.
- Keep screenshot order unchanged for isolation.
- Re-measure CVR.

## Phase 3 — In-App Premium CTA Copy Test (Days 15–21)
- Roll **P1** (Outcome) for 50% exposure, keep existing copy as control.
- Compare CTR + trial/upgrade starts.
- **Success gate:** >= +10% CTR or >= +6% upgrade starts.

---

## 4) Instrumentation Checklist

- [ ] Play Console baseline values captured and logged
- [ ] Premium CTA impression/click events confirmed in analytics
- [ ] Trial/upgrade event naming normalized
- [ ] Reporting sheet created for weekly readout

---

## 5) Evidence Pointers

- Play listing source copy: `docs/play-store-listing.md`
- WEAN-22 kickoff baseline: `docs/WEAN-22-CONVERSION-KICKOFF-2026-03-12.md`
- WEAN-21 operator upload docs: `docs/WEAN-21-OPERATOR-UPLOAD-CHECKLIST-2026-03-11.md`
