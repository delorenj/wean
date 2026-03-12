# WEAN Play Store Assets — Directory Contract

This directory is the canonical contract for Play Console creative assets.

## Required Structure

```text
assets/playstore/
├── feature-graphic-1024x500.png
├── screenshots/
│   ├── phone/
│   │   ├── 01-daily-view-1080x1920.png
│   │   ├── 02-dose-entry-1080x1920.png
│   │   ├── 03-progress-chart-1080x1920.png
│   │   ├── 04-taper-plan-1080x1920.png
│   │   └── 05-settings-1080x1920.png
│   ├── tablet7/
│   │   ├── 01-daily-view-1200x1920.png
│   │   └── 02-plan-view-1200x1920.png
│   └── tablet10/
│       ├── 01-daily-view-1600x2560.png
│       └── 02-plan-view-1600x2560.png
└── manifest.template.yaml
```

## Naming Rules

- Use lowercase + kebab-case.
- Prefix screenshot order with `01-`, `02-`, etc.
- Include intended dimensions in filename suffix.
- PNG preferred.

## Required vs Optional

- **Required for Play upload:**
  - `feature-graphic-1024x500.png`
  - At least 2 files in `screenshots/phone/`
- **Optional but recommended:**
  - `screenshots/tablet7/*`
  - `screenshots/tablet10/*`

## Quality Rules

- No device frame overlays unless intentional and consistent.
- No placeholder lorem text.
- Must reflect current app UI and brand colors.
- Max 8MB per image.

## Owner Handoff

Design/marketing should deliver files to exact paths above.
Operator should validate against `manifest.template.yaml` before Play Console upload.
