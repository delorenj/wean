#!/usr/bin/env python3
"""Generate placeholder Play Store assets for Wean.

Outputs:
- app-icon-512.png (512x512)
- feature-graphic-1024x500.png (1024x500, RGB/no alpha)
"""

from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = Path(__file__).resolve().parent

ICON_SOURCE_CANDIDATES = [
    ROOT / "assets" / "icon.png",
    ROOT / "assets" / "adaptive-icon.png",
]
MASCOT_SOURCE_CANDIDATES = [
    ROOT / "docs" / "wean-mascot.png",
    ROOT / "assets" / "icon.png",
]

ICON_OUTPUT = OUT_DIR / "app-icon-512.png"
FEATURE_OUTPUT = OUT_DIR / "feature-graphic-1024x500.png"


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(
            [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
            ]
        )
    candidates.extend(
        [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/TTF/DejaVuSans.ttf",
        ]
    )

    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue

    return ImageFont.load_default()


def pick_existing_path(paths: list[Path]) -> Path:
    for path in paths:
        if path.exists():
            return path
    raise FileNotFoundError(f"Could not find any file in: {paths}")


def create_app_icon() -> None:
    src_path = pick_existing_path(ICON_SOURCE_CANDIDATES)
    src = Image.open(src_path).convert("RGBA")

    # Preserve app branding while ensuring exact required size.
    icon = ImageOps.fit(src, (512, 512), method=Image.Resampling.LANCZOS)
    icon.save(ICON_OUTPUT, format="PNG", optimize=True)


def create_feature_graphic() -> None:
    width, height = 1024, 500

    # RGB canvas (no alpha for Play feature graphic).
    canvas = Image.new("RGB", (width, height), "#0f172a")
    draw = ImageDraw.Draw(canvas)

    # Soft vertical gradient in Wean brand-adjacent tones.
    top = (20, 84, 63)
    bottom = (7, 32, 51)
    for y in range(height):
        t = y / (height - 1)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Accent glow circles.
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((40, 40, 420, 420), fill=(88, 188, 130, 90))
    glow_draw.ellipse((650, -120, 1080, 300), fill=(129, 230, 217, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(50))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), glow).convert("RGB")

    mascot_path = pick_existing_path(MASCOT_SOURCE_CANDIDATES)
    mascot = Image.open(mascot_path).convert("RGBA")
    mascot = ImageOps.fit(mascot, (320, 320), method=Image.Resampling.LANCZOS)

    # Circular mask for a polished placeholder treatment.
    mask = Image.new("L", mascot.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, mascot.size[0] - 1, mascot.size[1] - 1), fill=255)
    mascot_circle = Image.new("RGBA", mascot.size, (0, 0, 0, 0))
    mascot_circle.paste(mascot, (0, 0), mask)

    # Shadow behind mascot.
    shadow = Image.new("RGBA", mascot.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).ellipse((8, 12, mascot.size[0] - 4, mascot.size[1] - 2), fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))

    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba.paste(shadow, (90, 95), shadow)
    canvas_rgba.paste(mascot_circle, (80, 80), mascot_circle)

    draw = ImageDraw.Draw(canvas_rgba)
    title_font = load_font(110, bold=True)
    subtitle_font = load_font(40, bold=False)
    badge_font = load_font(24, bold=True)

    draw.text((450, 135), "WEAN", font=title_font, fill=(236, 253, 245, 255))
    draw.text((450, 245), "Track doses. Build taper momentum.", font=subtitle_font, fill=(204, 251, 241, 255))

    badge_text = "PLAY STORE PLACEHOLDER"
    badge_bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
    badge_w = badge_bbox[2] - badge_bbox[0]
    badge_h = badge_bbox[3] - badge_bbox[1]
    badge_x, badge_y = 450, 322
    draw.rounded_rectangle(
        (badge_x - 18, badge_y - 10, badge_x + badge_w + 18, badge_y + badge_h + 12),
        radius=16,
        fill=(15, 23, 42, 180),
        outline=(187, 247, 208, 255),
        width=2,
    )
    draw.text((badge_x, badge_y), badge_text, font=badge_font, fill=(187, 247, 208, 255))

    canvas_rgba.convert("RGB").save(FEATURE_OUTPUT, format="PNG", optimize=True)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    create_app_icon()
    create_feature_graphic()
    print(f"Generated: {ICON_OUTPUT}")
    print(f"Generated: {FEATURE_OUTPUT}")


if __name__ == "__main__":
    main()
