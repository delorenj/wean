# WEAN-22 Listing A/B Slice — Copy Variants + Measurement Rubric + Rollout Checklist

**Timestamp:** 2026-03-12 12:56 ET  
**Ticket:** WEAN-22  
**Scope:** Play Store listing optimization (conversion lane)

---

## 1) A/B Listing Copy Variants

## Test A (Control)
- **App name:** Wean: Taper & Track
- **Short description:** Track kratom intake, visualize progress, and taper safely with smart planning.
- **Long description opening line:** Wean helps you reduce kratom with structured tracking, clear trends, and step-by-step taper planning.

## Test B (Challenger)
- **App name:** Wean: Taper & Track
- **Short description:** Reduce kratom step-by-step with daily tracking, taper plans, and progress charts.
- **Long description opening line:** Build a safer taper with daily dose logs, clear trend charts, and practical milestones you can sustain.

## Test C (Optional second challenger)
- **App name:** Wean: Taper & Track
- **Short description:** Build a safe taper plan, log doses fast, and track real progress every day.
- **Long description opening line:** Turn quitting into small daily wins with guided taper planning and progress visibility.

### Positioning Notes
- Keep app name fixed to reduce confounders.
- Change one copy block at a time where possible.
- Avoid policy-risk language (no cure/medical guarantees).

---

## 2) Measurement Rubric (Measurable + Comparable)

## Primary Metric
- **Play Store Conversion Rate (CVR):** `installs / store listing visitors`

## Secondary Metrics
- **First-open rate:** first_open / installs
- **Premium CTA view rate (D0):** premium_cta_impression / first_open
- **Premium CTA CTR (D0-D1):** premium_cta_click / premium_cta_impression

## Test Quality Gates
- Minimum runtime per variant: **7 full days**
- Minimum store visitors per variant: **>= 1,000** (or org-approved threshold)
- Hold constant during test:
  - Feature graphic
  - Screenshot order
  - In-app paywall copy (until listing winner selected)

## Decision Rules
- **Winner condition:** challenger beats control by **>=5% relative CVR** with stable secondary metrics.
- **No-go condition:** CVR drops by **>=3%** or first-open quality drops materially.
- **Escalation condition:** traffic too low or external campaign contamination detected.

## Reporting Template
| Variant | Visitors | Installs | CVR | Delta vs Control | First-open rate | CTA CTR | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| A |  |  |  | baseline |  |  |  |
| B |  |  |  |  |  |  |  |
| C |  |  |  |  |  |  |  |

---

## 3) Rollout Checklist

### Pre-Launch
- [ ] Baseline snapshot captured (last 7 days control)
- [ ] Variant copy approved by owner (Jarad)
- [ ] Listing assets frozen (no screenshot/graphic edits during test window)
- [ ] Tracking sheet created with rubric fields above

### Launch
- [ ] Apply Test B copy in Play listing
- [ ] Record start timestamp ET
- [ ] Confirm no concurrent store-campaign experiments started

### Mid-Window Monitoring (Day 2/4/6)
- [ ] Pull visitor + install counts
- [ ] Validate no anomaly spikes from paid traffic changes
- [ ] Confirm app crash/first-open metrics stable

### Close + Decision
- [ ] Pull 7-day totals
- [ ] Compute CVR delta vs control
- [ ] Assign outcome: Winner / No-go / Inconclusive
- [ ] If winner: queue production adoption
- [ ] If inconclusive: run next challenger (Test C)

### Handoff
- [ ] Post outcome summary to WEAN-22 ticket
- [ ] Link evidence artifact and metrics table
- [ ] Schedule next test iteration window

---

## Evidence Links (internal)
- `docs/WEAN-22-CONVERSION-BASELINE-2026-03-12.md`
- `docs/play-store-listing.md`
- `docs/WEAN-22-CONVERSION-KICKOFF-2026-03-12.md`
