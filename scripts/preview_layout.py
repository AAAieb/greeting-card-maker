"""Rough layout preview of the card templates using Pillow.

This is a *visual sanity check* only: it approximates what the Konva renderer
draws (same millimetre coordinates), so layout mistakes show up before the app
is opened in a browser. It is not a pixel-accurate preview.
"""

import json
import os

from PIL import Image, ImageDraw, ImageFont

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(BASE, ".tmp", "templates.json")
OUT = os.path.join(BASE, ".tmp", "preview")

PX_PER_MM = 3.2
PANEL_W, PANEL_H = 148.5, 210

FONTS = {
    "sans-cn": r"C:\Windows\Fonts\msyh.ttc",
    "serif-cn": r"C:\Windows\Fonts\simsun.ttc",
    "kai": r"C:\Windows\Fonts\simkai.ttf",
    "latin-serif": r"C:\Windows\Fonts\georgia.ttf",
    "latin-sans": r"C:\Windows\Fonts\arial.ttf",
}
BOLD = r"C:\Windows\Fonts\msyhbd.ttc"


def font(px, key="sans-cn", weight=400):
    path = FONTS.get(key, FONTS["sans-cn"])
    if weight >= 600 and os.path.exists(BOLD):
        path = BOLD
    if not os.path.exists(path):
        path = r"C:\Windows\Fonts\msyh.ttc"
    return ImageFont.truetype(path, max(6, int(px)))


def wrap(draw, text, fnt, max_w):
    lines = []
    for para in text.split("\n"):
        if not para:
            lines.append("")
            continue
        cur = ""
        for ch in para:
            if draw.textlength(cur + ch, font=fnt) > max_w and cur:
                lines.append(cur)
                cur = ch
            else:
                cur += ch
        lines.append(cur)
    return lines


def draw_text(draw, layer):
    size_px = layer["size"] * PX_PER_MM
    fnt = font(size_px, layer["font"], layer.get("weight", 400))
    lines = wrap(draw, layer["text"], fnt, layer["w"] * PX_PER_MM)
    lh = size_px * layer.get("lineHeight", 1.35)
    color = layer.get("color", "#111")
    for i, line in enumerate(lines):
        w = draw.textlength(line, font=fnt)
        if layer.get("align") == "center":
            x = layer["x"] * PX_PER_MM + (layer["w"] * PX_PER_MM - w) / 2
        elif layer.get("align") == "right":
            x = layer["x"] * PX_PER_MM + layer["w"] * PX_PER_MM - w
        else:
            x = layer["x"] * PX_PER_MM
        y = layer["y"] * PX_PER_MM + i * lh
        draw.text((x, y), line, font=fnt, fill=color)


def render(doc, panel="front"):
    W = int(PANEL_W * PX_PER_MM)
    H = int(PANEL_H * PX_PER_MM)
    img = Image.new("RGB", (W, H), doc["theme"]["bg"])
    d = ImageDraw.Draw(img)

    for l in doc["panels"][panel]:
        t = l["type"]
        if t == "shape":
            s = l["shape"]
            if s == "rect":
                box = [
                    l["x"] * PX_PER_MM,
                    l["y"] * PX_PER_MM,
                    (l["x"] + l["w"]) * PX_PER_MM,
                    (l["y"] + l["h"]) * PX_PER_MM,
                ]
                fill = l.get("fill")
                fill = None if fill in (None, "#00000000") else fill
                d.rectangle(box, fill=fill, outline=l.get("stroke"), width=1)
            elif s == "circle":
                box = [
                    l["x"] * PX_PER_MM,
                    l["y"] * PX_PER_MM,
                    (l["x"] + l["w"]) * PX_PER_MM,
                    (l["y"] + l["h"]) * PX_PER_MM,
                ]
                fill = l.get("fill")
                fill = None if fill in (None, "#00000000") else fill
                d.ellipse(box, fill=fill, outline=l.get("stroke"))
            elif s == "line":
                pts = l["points"]
                d.line(
                    [pts[0] * PX_PER_MM, pts[1] * PX_PER_MM, pts[2] * PX_PER_MM, pts[3] * PX_PER_MM],
                    fill=l.get("stroke", "#000"),
                    width=max(1, int(l.get("strokeWidth", 0.4) * PX_PER_MM)),
                )
            elif s == "polygon":
                pts = l["points"]
                poly = [(pts[i] * PX_PER_MM, pts[i + 1] * PX_PER_MM) for i in range(0, len(pts), 2)]
                d.polygon(poly, fill=l.get("fill"))
        elif t == "text":
            draw_text(d, l)
        elif t == "image":
            d.rectangle(
                [
                    l["x"] * PX_PER_MM,
                    l["y"] * PX_PER_MM,
                    (l["x"] + l["w"]) * PX_PER_MM,
                    (l["y"] + l["h"]) * PX_PER_MM,
                ],
                fill="#DCD6CE",
            )

    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    docs = json.load(open(DOCS, encoding="utf-8"))

    for doc in docs:
        for panel in ("front", "back"):
            img = render(doc, panel)
            img.save(os.path.join(OUT, f"{doc['templateId']}-{panel}.png"))

    # contact sheets: fronts and backs
    cols, rows = 4, 2
    w, h = render(docs[0], "front").size
    gap = 24
    for panel in ("front", "back"):
        sheet = Image.new(
            "RGB", (cols * w + gap * (cols + 1), rows * h + gap * (rows + 1)), "#EFEFEF"
        )
        for i, doc in enumerate(docs):
            img = render(doc, panel)
            r, c = divmod(i, cols)
            sheet.paste(img, (gap + c * (w + gap), gap + r * (h + gap)))
        sheet.save(os.path.join(OUT, f"sheet-{panel}s.png"))
    print("ok", len(docs), "templates ->", OUT)


if __name__ == "__main__":
    main()
