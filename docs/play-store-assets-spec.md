# Play Store Assets Specification

## Asset Inventory

### Required Assets (Must Have)
1. ✅ App Icon (512x512) - **EXISTS** (needs verification/resize)
2. ❌ Feature Graphic (1024x500) - **TO CREATE**
3. ❌ Screenshots (2-8, phone) - **TO CREATE**

### Optional Assets (Nice to Have)
4. ❌ Screenshots (tablet, 7-inch) - **TO CREATE**
5. ❌ Screenshots (tablet, 10-inch) - **TO CREATE**
6. ❌ Promotional Video (30s-2min) - **TO CREATE**

---

## 1. App Icon (512x512)

### Current Status
- **File:** `./assets/icon.png`
- **Size:** 22K (need to verify dimensions)
- **Required:** 512x512 px, 32-bit PNG with alpha

### Action Items
```bash
# Check current icon dimensions
file ./assets/icon.png
identify ./assets/icon.png

# If not 512x512, resize with ImageMagick
convert ./assets/icon.png -resize 512x512 ./assets/icon-512.png

# Or create new high-res version from adaptive icon
```

### Design Guidelines
- **Shape:** Circular or rounded square
- **Background:** Transparent or solid color (#58BC82 teal recommended)
- **Logo/Icon:** Clear, recognizable at small sizes
- **Text:** Avoid text in icon (hard to read at small sizes)
- **Brand Colors:** Teal (#58BC82), white, dark green
- **Style:** Modern, minimal, clean

### Validation
- [ ] 512x512 px exactly
- [ ] PNG format, 32-bit with alpha channel
- [ ] File size < 1 MB
- [ ] Looks good at small sizes (48x48 preview)
- [ ] No transparency issues on dark/light backgrounds

---

## 2. Feature Graphic (1024x500)

### Status: ❌ TO CREATE

### Specifications
- **Dimensions:** 1024 x 500 px (exact)
- **Format:** PNG or JPEG (PNG recommended for transparency)
- **File Size:** < 1 MB
- **Color Mode:** RGB
- **Safe Zone:** Keep important content within center 924x400 area (50px margin)

### Design Concept

**Layout:**
```
┌────────────────────────────────────────────────┐
│  [Gradient Background: Teal → Dark Green]     │
│                                                │
│          WEAN                                  │
│          Take Control of Your Kratom Use      │
│                                                │
│     [Visual Element: Dose Gauge or Trend]     │
│                                                │
└────────────────────────────────────────────────┘
```

**Content:**
- **Headline:** "WEAN" (large, bold, white, sans-serif)
- **Tagline:** "Take Control of Your Kratom Use" (medium, white, below headline)
- **Visual:** 
  - Option A: Simplified dose gauge graphic (circular progress indicator)
  - Option B: Upward trend line showing progress
  - Option C: Abstract geometric design with teal/green gradient
- **Background:** 
  - Gradient from #58BC82 (teal) to #2D8B78 (dark green)
  - Subtle texture or pattern (optional)

**Typography:**
- **Headline Font:** Inter Bold, Poppins Bold, or Montserrat Bold
- **Tagline Font:** Inter Regular, Poppins Regular
- **Headline Size:** ~80-100px
- **Tagline Size:** ~24-32px

**Colors:**
- **Primary:** #58BC82 (teal)
- **Secondary:** #2D8B78 (dark green)
- **Accent:** #FFFFFF (white)
- **Text:** #FFFFFF (white) with 95% opacity for tagline

### Tools for Creation

**Option 1: Figma (Recommended)**
- Professional design tool
- Export at exact dimensions
- Free tier available

**Option 2: Canva**
- User-friendly, template-based
- Custom dimensions: 1024x500
- Free tier available

**Option 3: GIMP**
- Free, open-source image editor
- Full control over design
- Steeper learning curve

**Option 4: AI Generation**
- Use Midjourney, DALL-E, or Stable Diffusion
- Prompt: "Feature graphic for health app, teal gradient background, minimal modern design, 1024x500"
- Post-process in Figma/Canva to add text

### Asset File Naming
```
feature-graphic-1024x500.png
feature-graphic-alt-1024x500.png (if multiple versions)
```

### Validation
- [ ] Exactly 1024 x 500 px
- [ ] File size < 1 MB
- [ ] Text is readable at thumbnail size
- [ ] Colors match brand (#58BC82 teal)
- [ ] Looks professional and trustworthy
- [ ] Safe zone respected (no text cut off at edges)

---

## 3. Screenshots (Phone)

### Status: ❌ TO CREATE (2-8 required)

### Specifications
- **Dimensions:** 
  - Portrait: 1080 x 1920 px (16:9 aspect ratio)
  - Landscape: 1920 x 1080 px (not recommended for this app)
- **Format:** PNG or JPEG
- **File Size:** < 8 MB per screenshot
- **Quantity:** Minimum 2, maximum 8 (recommend 4-6 for best coverage)

### Screenshot Priority List

**Must Have (Minimum 2):**
1. **Daily View** - Timeline of doses with daily gauge
2. **Dose Entry** - Quick dose logging interface with slider

**Should Have (4-6 total):**
3. **Progress Chart** - Weekly/monthly trend visualization
4. **Taper Plan** - Personalized reduction schedule
5. **Milestones** - Achievement badges and celebrations

**Nice to Have (up to 8 total):**
6. **Settings** - Theme toggle, notification preferences
7. **Calendar View** - Historical dose calendar
8. **Insights** (Premium) - Advanced analytics

### Screenshot Capture Methods

**Method 1: Real Device (Best)**
```bash
# Android Debug Bridge (ADB)
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshots/

# Or use device built-in screenshot (Power + Volume Down)
```

**Method 2: Android Emulator**
```bash
# Start emulator with high-res screen
emulator -avd Pixel_6_API_33 -resolution 1080x1920

# Take screenshot via emulator UI (Camera icon)
# Or use ADB commands as above
```

**Method 3: Expo Go + Device**
- Run app on physical device with Expo Go
- Take native screenshots
- Transfer via USB or cloud

### Screenshot Enhancement (Optional)

**Add Device Frame:**
- Use [Device Frames by Facebook](https://facebook.design/devices)
- Or [Mockuuups Studio](https://mockuuups.studio/)
- Makes screenshots look more polished and professional

**Add Annotations:**
- Highlight key features with arrows or callouts
- Add short descriptive text (12-16px font)
- Keep it minimal—let the UI speak for itself

**Template Layout:**
```
┌─────────────────────┐
│                     │
│   [Screenshot]      │
│                     │
│                     │
│   Feature Name      │ ← Optional title at bottom
│                     │
└─────────────────────┘
```

### Screenshot File Naming Convention
```
screenshot-01-daily-view-1080x1920.png
screenshot-02-dose-entry-1080x1920.png
screenshot-03-progress-chart-1080x1920.png
screenshot-04-taper-plan-1080x1920.png
screenshot-05-milestones-1080x1920.png
screenshot-06-settings-1080x1920.png
```

### Screenshot Content Guidelines

**DO:**
- Show real, realistic data (not all zeros)
- Demonstrate key features clearly
- Use light mode AND dark mode (if supported)
- Show progress/success states (motivating)
- Keep UI clean and uncluttered

**DON'T:**
- Include personal/identifiable information
- Show error states or empty states
- Use Lorem Ipsum or fake data
- Include debug UI elements
- Show notifications or system UI (crop them out)

### Validation
- [ ] Exactly 1080 x 1920 px (or other approved dimensions)
- [ ] File size < 8 MB per screenshot
- [ ] PNG or JPEG format
- [ ] Shows key features clearly
- [ ] Looks professional and polished
- [ ] No personal information visible
- [ ] Consistent styling across all screenshots

---

## 4. Screenshots (Tablet, Optional)

### Status: ❌ TO CREATE (Optional)

### Specifications

**7-inch Tablet:**
- **Dimensions:** 1200 x 1920 px (portrait)
- **Format:** PNG or JPEG
- **Quantity:** 2-8 screenshots

**10-inch Tablet:**
- **Dimensions:** 1600 x 2560 px (portrait)
- **Format:** PNG or JPEG
- **Quantity:** 2-8 screenshots

### When to Create Tablet Screenshots

**Consider creating if:**
- App has tablet-optimized UI
- Significant tablet user base expected
- Budget/time allows for additional assets

**Skip if:**
- App is phone-only design
- Limited resources
- Phone screenshots adequately represent app

### Tablet-Specific Considerations

- Use landscape orientation if app supports it
- Show multi-column layouts (if implemented)
- Demonstrate tablet-specific features (split screen, drag-and-drop)

---

## 5. Promotional Video (Optional)

### Status: ❌ TO CREATE (Optional but Recommended)

### Specifications
- **Duration:** 30 seconds to 2 minutes (recommend 45-60s)
- **Format:** MP4 or MOV (H.264 codec)
- **Resolution:** 1920 x 1080 px (1080p) minimum
- **File Size:** < 100 MB
- **Frame Rate:** 30 fps or 60 fps
- **Audio:** Optional but recommended (background music + voiceover)

### Video Content Structure

**Opening (5-10s):**
- App logo/name
- Hook: "Struggling to reduce kratom use?"

**Problem (10-15s):**
- Show pain points: lack of tracking, failed quit attempts
- Relatable scenarios

**Solution (20-30s):**
- Quick tour of app features:
  - Dose logging (5s)
  - Progress charts (5s)
  - Taper planning (5s)
  - Milestones (5s)

**Call to Action (5-10s):**
- "Download Wean today"
- "Start your journey to taking control"
- App name + logo

### Production Options

**Option 1: Screen Recording + Editing**
- Record app usage with screen capture
- Add voiceover and music in post
- Tools: OBS Studio (free), iMovie, Final Cut Pro

**Option 2: Animated Explainer Video**
- Create animated graphics showing features
- Tools: After Effects, Blender, or hire freelancer

**Option 3: Live Action + Screen Recording**
- Mix real person testimonial with app demo
- More personal and relatable
- Higher production cost

### Asset File Naming
```
promo-video-1080p-60s.mp4
promo-video-1080p-45s.mp4 (shorter version)
```

### Validation
- [ ] Duration within 30s-2min
- [ ] Resolution 1920x1080 or higher
- [ ] File size < 100 MB
- [ ] MP4 or MOV format
- [ ] Audio levels balanced (no clipping)
- [ ] Captions/subtitles included (accessibility)
- [ ] Branding consistent with app
- [ ] Clear call to action at end

---

## Asset Creation Workflow

### Phase 1: Planning (30 min)
1. Review all asset requirements above
2. Prioritize: Icon → Feature Graphic → Screenshots (2-4) → Optional assets
3. Gather brand assets: colors (#58BC82), fonts, logos
4. Create folder structure:
   ```
   assets/
   ├── play-store/
   │   ├── icon/
   │   ├── feature-graphic/
   │   ├── screenshots/
   │   │   ├── phone/
   │   │   └── tablet/
   │   └── video/
   ```

### Phase 2: Icon (30 min)
1. Verify/resize existing icon to 512x512
2. Export high-res version from source file (if available)
3. Test on dark/light backgrounds
4. Save as `icon-512.png`

### Phase 3: Feature Graphic (1-2 hours)
1. Create design in Figma/Canva using specifications above
2. Export at 1024x500 exact
3. Review with team
4. Save as `feature-graphic-1024x500.png`

### Phase 4: Screenshots (2-3 hours)
1. Build app on device or emulator
2. Set up realistic data (doses, progress, milestones)
3. Capture 4-6 key screens (daily, dose entry, charts, taper, milestones)
4. Optional: Add device frames or annotations
5. Save with consistent naming: `screenshot-01-daily-view-1080x1920.png`

### Phase 5: Optional Assets (if time permits)
1. Tablet screenshots (1-2 hours)
2. Promotional video (4-8 hours or outsource)

### Phase 6: Review & Approval (30 min)
1. Create checklist from this document
2. Verify all dimensions and file sizes
3. Test display on different devices/screens
4. Get stakeholder approval (Jarad)
5. Upload to Play Console

---

## Quick Reference: Asset Checklist

### Required
- [ ] App Icon: 512x512 PNG
- [ ] Feature Graphic: 1024x500 PNG/JPEG
- [ ] Screenshots (phone): 2-8 images, 1080x1920 PNG/JPEG

### Optional
- [ ] Screenshots (7" tablet): 1200x1920 PNG/JPEG
- [ ] Screenshots (10" tablet): 1600x2560 PNG/JPEG
- [ ] Promotional Video: 30s-2min, 1920x1080 MP4/MOV

### All Assets
- [ ] Correct dimensions (exact)
- [ ] Correct file format
- [ ] File sizes within limits
- [ ] Professional quality
- [ ] Brand consistent
- [ ] No personal information
- [ ] Approved by stakeholder

---

## Tools & Resources

**Design Tools:**
- Figma: https://figma.com (free tier)
- Canva: https://canva.com (templates available)
- GIMP: https://gimp.org (free, open-source)

**Screenshot Tools:**
- Android Studio Emulator (built-in screenshot)
- ADB (Android Debug Bridge)
- Device Frames: https://facebook.design/devices

**Video Tools:**
- OBS Studio: https://obsproject.com (free screen recording)
- iMovie (Mac) / DaVinci Resolve (free editing)
- Loom: https://loom.com (quick screen recordings)

**AI Tools (for feature graphic):**
- Midjourney: https://midjourney.com
- DALL-E: https://openai.com/dall-e
- Stable Diffusion: https://stablediffusionweb.com

**Asset Validators:**
- Google Play Console (built-in validation on upload)
- ImageMagick: `identify` command to check dimensions

---

## Next Steps

1. ✅ Verify current icon dimensions: `file ./assets/icon.png`
2. ✅ Create feature graphic using Figma or Canva
3. ✅ Build app and capture 4-6 screenshots
4. ✅ Organize assets in `assets/play-store/` folder
5. ✅ Review with Jarad for approval
6. ✅ Upload to Play Console during submission
7. ✅ (Optional) Create promotional video
8. ✅ (Optional) Create tablet screenshots

**Estimated Time:**
- Icon: 30 min (if resize only)
- Feature Graphic: 1-2 hours
- Screenshots (phone): 2-3 hours
- Total minimum: ~4-6 hours
- Total with optional assets: ~8-12 hours
