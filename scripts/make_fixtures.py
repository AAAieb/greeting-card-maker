"""生成照片模块的测试素材（正常图 + 各种畸形图）。

    python scripts/make_fixtures.py

输出到 test-fixtures/photos/，供分工 6 做回归测试。
所有素材都是程序生成的色块/噪声，不含任何第三方图片，无版权问题。
"""

import os
import random

from PIL import Image, ImageDraw

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "test-fixtures", "photos")


def blocks(w, h, seed=7):
    """一张有内容的图，方便肉眼判断取景是否正确"""
    rnd = random.Random(seed)
    img = Image.new("RGB", (w, h), "#EFE8DF")
    d = ImageDraw.Draw(img)
    for i in range(14):
        x0 = rnd.randrange(0, w)
        y0 = rnd.randrange(0, h)
        d.ellipse(
            [x0, y0, x0 + rnd.randrange(40, w // 3), y0 + rnd.randrange(40, h // 3)],
            fill=(rnd.randrange(80, 240), rnd.randrange(80, 240), rnd.randrange(80, 240)),
        )
    d.rectangle([0, 0, w - 1, h - 1], outline="#333333", width=max(2, w // 200))
    return img


def noise(w, h):
    img = Image.new("RGB", (w, h))
    px = img.load()
    rnd = random.Random(11)
    for y in range(h):
        for x in range(w):
            px[x, y] = (rnd.randrange(256), rnd.randrange(256), rnd.randrange(256))
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    made = []

    def save(img, name, **kw):
        path = os.path.join(OUT, name)
        img.save(path, **kw)
        made.append((name, os.path.getsize(path)))
        return path

    # 1. 太小：长边 240 < 320，应当被拒绝
    save(blocks(240, 240), "01-too-small-240.png")

    # 2. 正常：2000×1500，约 108mm 宽 → 约 470 DPI
    save(blocks(2000, 1500), "02-normal-2000x1500.jpg", quality=90)

    # 3. 超大：6000×4000，会被降采样到 3000 长边
    save(blocks(6000, 4000), "03-huge-6000x4000.jpg", quality=88)

    # 4. 竖拍 + EXIF 旋转 6（需要顺时针转 90° 才是正的）
    img = blocks(1200, 1600)
    exif = Image.Exif()
    exif[274] = 6
    save(img, "04-portrait-exif6.jpg", quality=92, exif=exif)

    # 5. 透明 PNG：放在深色模板上会露出底色
    rgba = Image.new("RGBA", (900, 900), (0, 0, 0, 0))
    d = ImageDraw.Draw(rgba)
    d.ellipse([100, 100, 800, 800], fill=(122, 11, 69, 210))
    d.rectangle([300, 300, 600, 600], fill=(255, 255, 255, 120))
    save(rgba, "05-transparent.png")

    # 6. 改后缀的假图片：内容是文本
    fake = os.path.join(OUT, "06-corrupted.jpg")
    with open(fake, "wb") as f:
        f.write(b"this is not a jpeg, just text pretending to be one\n")
    made.append(("06-corrupted.jpg", os.path.getsize(fake)))

    # 7. 超过 8MB（刚好超一点，够触发拒绝就行，别把仓库撑爆）
    save(noise(3000, 2200), "07-over-8mb.jpg", quality=100)

    # 8. 极端窄图：用于测取景框夹取
    save(blocks(4000, 300), "08-panorama-4000x300.jpg", quality=90)

    print(f"{'文件':34} 大小")
    for name, size in made:
        print(f"{name:34} {size / 1024:8.1f} KB")
    return made


if __name__ == "__main__":
    main()
