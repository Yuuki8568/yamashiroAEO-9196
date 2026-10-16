#!/usr/bin/env python3
"""Generate OG image + favicon set for the AEO blog.

Brand alignment: colors/typography/logo mark are taken from the portfolio site
(yamashirogyomukaizen.com): sumi #1c2b3a, accent teal #0e7490, washi #f7f5f0,
Noto Serif JP / Noto Sans JP, and the arrow logo mark.
"""
from PIL import Image, ImageDraw, ImageFont

SERIF = "/home/user/ogfonts/NotoSerifJP-VF.otf"
SANS = "/home/user/ogfonts/NotoSansJP-VF.otf"
LOGO = "/home/user/portfolio-logo.png"
OUT = "/home/user/aeo-blog/packages/web/public"

SUMI = (28, 43, 58)
SUMI_SOFT = (74, 90, 106)
TEAL = (14, 116, 144)
WASHI = (247, 245, 240)
LINE = (229, 224, 216)
WHITE = (255, 255, 255)


def font(path, size, weight="Regular"):
    f = ImageFont.truetype(path, size)
    try:
        f.set_variation_by_name(weight)
    except Exception:
        pass
    return f


def tracked(draw, xy, text, f, fill, tracking=0.0):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=f, fill=fill)
        x += draw.textlength(ch, font=f) + tracking
    return x


def tracked_width(draw, text, f, tracking=0.0):
    return sum(draw.textlength(c, font=f) for c in text) + tracking * max(len(text) - 1, 0)


def logo_rgba(size):
    im = Image.open(LOGO).convert("RGBA")
    return im.resize((size, size), Image.LANCZOS)


def gradient_mark(size, top, bottom):
    """Arrow mark recolored with a vertical gradient."""
    mark = logo_rgba(size)
    grad = Image.new("RGBA", (1, size))
    for y in range(size):
        t = y / max(size - 1, 1)
        grad.putpixel(
            (0, y),
            (
                round(top[0] + (bottom[0] - top[0]) * t),
                round(top[1] + (bottom[1] - top[1]) * t),
                round(top[2] + (bottom[2] - top[2]) * t),
                255,
            ),
        )
    grad = grad.resize((size, size))
    grad.putalpha(mark.getchannel("A"))
    return grad


# ---------------------------------------------------------------- OG image
def build_og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), WASHI)
    d = ImageDraw.Draw(img)

    # faint vertical grid, like the portfolio hero
    for x in (150, 450, 750, 1050):
        d.line([(x, 0), (x, H)], fill=(232, 227, 218), width=1)

    # white card
    M = 44
    card = Image.new("RGBA", (W - M * 2, H - M * 2), WHITE + (255,))
    cd = ImageDraw.Draw(card)
    cw, ch = card.size

    # oversized logo watermark bleeding off the right edge
    wm = gradient_mark(700, (14, 116, 144), (28, 43, 58))
    wm.putalpha(wm.getchannel("A").point(lambda a: int(a * 0.08)))
    card.alpha_composite(wm, (cw - 400, 56))

    mask = Image.new("L", card.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, cw - 1, ch - 1], radius=20, fill=255)
    img.paste(card.convert("RGB"), (M, M), mask)
    d.rounded_rectangle([M, M, W - M - 1, H - M - 1], radius=20, outline=LINE, width=1)

    PAD = 100  # content left edge
    RIGHT = W - PAD

    # --- header lockup: mark + office name -------------------------------
    mark = logo_rgba(58)
    img.paste(mark, (PAD, 92), mark)
    f_name = font(SERIF, 30, "Bold")
    d.text((PAD + 58 + 18, 88), "山代業務改善事務所", font=f_name, fill=SUMI)
    f_sub = font(SANS, 13, "Medium")
    tracked(d, (PAD + 58 + 20, 128), "AI業務改善コンサルティング", f_sub, SUMI_SOFT, 3.0)

    # --- eyebrow ----------------------------------------------------------
    ey_y = 214
    d.line([(PAD, ey_y + 10), (PAD + 38, ey_y + 10)], fill=TEAL, width=2)
    f_ey = font(SANS, 18, "Bold")
    tracked(d, (PAD + 54, ey_y), "AI業務改善ブログ", f_ey, TEAL, 2.4)

    # --- headline ---------------------------------------------------------
    f_h = font(SERIF, 58, "Bold")
    d.text((PAD - 4, 262), "中小企業のAI活用の疑問に、", font=f_h, fill=SUMI)
    d.text((PAD - 4, 348), "ひとつずつ答えます。", font=f_h, fill=SUMI)

    # --- supporting line --------------------------------------------------
    f_p = font(SANS, 20, "Regular")
    d.text((PAD, 442), "実際に検索されている質問に、実務目線でひとつずつ回答。", font=f_p, fill=SUMI_SOFT)

    # --- footer rule + row ------------------------------------------------
    d.line([(PAD, 496), (RIGHT, 496)], fill=LINE, width=1)

    f_chip = font(SANS, 17, "Bold")
    chip_text = "オンラインで全国対応"
    cw_text = tracked_width(d, chip_text, f_chip, 1.2)
    d.rounded_rectangle([PAD, 524, PAD + cw_text + 44, 524 + 44], radius=8, fill=TEAL)
    tracked(d, (PAD + 22, 524 + 11), chip_text, f_chip, WHITE, 1.2)

    f_url = font(SANS, 18, "Medium")
    url = "yamashirogyomukaizen.com"
    d.text((RIGHT - d.textlength(url, font=f_url), 537), url, font=f_url, fill=SUMI_SOFT)

    img.save(f"{OUT}/og-image.png")
    print("og-image.png", img.size)


# ---------------------------------------------------------------- icons
def build_icon(size=512, mark_scale=0.70, radius_scale=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = round(size * radius_scale)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=SUMI + (255,))

    # soft teal glow behind the mark
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(28, 0, -1):
        rad = round(size * 0.30 * i / 28)
        a = int(30 * (1 - i / 28))
        gd.ellipse(
            [size // 2 - rad, round(size * 0.34) - rad, size // 2 + rad, round(size * 0.34) + rad],
            fill=(34, 163, 196, a),
        )
    img.alpha_composite(glow)

    m = round(size * mark_scale)
    mark = gradient_mark(m, (186, 244, 252), (29, 148, 180))
    img.alpha_composite(mark, ((size - m) // 2, round((size - m) / 2)))

    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)
    img.putalpha(mask)
    return img


def build_icons():
    icon = build_icon(512)
    icon.save(f"{OUT}/icon-512.png")

    apple = Image.new("RGB", (180, 180), SUMI)
    small = build_icon(512).resize((180, 180), Image.LANCZOS)
    apple.paste(small, (0, 0), small)
    apple.save(f"{OUT}/apple-touch-icon.png")

    # small sizes: bigger mark, tighter corners so it stays legible in a tab
    tiny = build_icon(256, mark_scale=0.82, radius_scale=0.18)
    tiny.save(f"{OUT}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("icon-512.png / apple-touch-icon.png / favicon.ico written")


if __name__ == "__main__":
    build_og()
    build_icons()
