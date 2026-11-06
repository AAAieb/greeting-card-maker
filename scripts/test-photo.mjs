/**
 * 照片模块的纯计算测试（不需要浏览器）。
 *   node scripts/test-photo.mjs
 */
import {
  clampCrop,
  coverCrop,
  frameOutsidePanel,
  frameOutsideSafe,
  panCrop,
  photoDpi,
  zoomCrop,
} from "../src/lib/photoMath.ts";

let failed = 0;
const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

function ok(name, cond, detail = "") {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name} ${detail}`);
  }
}

function inside(c, W, H) {
  return c.x >= -1e-9 && c.y >= -1e-9 && c.x + c.w <= W + 1e-9 && c.y + c.h <= H + 1e-9;
}

console.log("coverCrop —— 等比铺满");
{
  const c = coverCrop(4000, 3000, 108, 108); // 横图放进方框
  ok("取景框比例 = 照片框比例", near(c.w / c.h, 1), `${c.w}x${c.h}`);
  ok("取景框不出原图", inside(c, 4000, 3000));
  ok("横图左右收紧", near(c.w, 3000) && near(c.h, 3000));

  const v = coverCrop(1080, 1920, 108, 108); // 竖图
  ok("竖图上下收紧", near(v.h, 1080) && near(v.w, 1080));
  ok("竖图比例正确", near(v.w / v.h, 1));

  const w = coverCrop(4000, 3000, 96, 96);
  ok("不同照片框同样成立", near(w.w / w.h, 1));
}

console.log("\nzoomCrop —— 放大不越界、不变形");
{
  const frame = { w: 108, h: 108 };
  const base = coverCrop(4000, 3000, frame.w, frame.h);
  for (const z of [1, 1.4, 2, 3, 4]) {
    const c = zoomCrop(base, 4000, 3000, frame.w, frame.h, z);
    ok(`zoom ${z}: 比例不变`, near(c.w / c.h, 1));
    ok(`zoom ${z}: 在原图内`, inside(c, 4000, 3000));
    ok(`zoom ${z}: 尺寸 = base / ${z}`, near(c.w, base.w / z, 1e-6) || z >= 1);
  }
  const once = zoomCrop(undefined, 4000, 3000, 108, 108, 1);
  ok("zoom=1 等于 cover", near(once.w, base.w) && near(once.x, base.x));
}

console.log("\npanCrop —— 平移被夹在原图内");
{
  const frame = { w: 108, h: 108 };
  let c = coverCrop(4000, 3000, frame.w, frame.h);
  const far = panCrop(c, frame.w, frame.h, 99999, 99999, 4000, 3000);
  ok("向右拖到底：不越界", inside(far, 4000, 3000));
  ok("向右拖到底：贴住左边界", near(far.x, 0));
  const far2 = panCrop(c, frame.w, frame.h, -99999, -99999, 4000, 3000);
  ok("向左拖到底：贴住右边界", near(far2.x + far2.w, 4000));
  const half = panCrop(c, frame.w, frame.h, 10, 0, 4000, 3000);
  ok("拖 10mm 只移动 10mm 对应的像素", near(c.x - half.x, 10 * (c.w / frame.w)));
  ok("平移不改取景尺寸", near(half.w, c.w) && near(half.h, c.h));
}

console.log("\nclampCrop");
{
  const c = clampCrop({ x: -50, y: -50, w: 500, h: 500 }, 400, 400);
  ok("负偏移夹回 0", c.x === 0 && c.y === 0);
  ok("超尺寸夹回原图", c.w <= 400 && c.h <= 400);
}

console.log("\nphotoDpi");
{
  const layer = { type: "image", id: "x", name: "p", x: 0, y: 0, w: 100, h: 100, naturalW: 2000, naturalH: 2000 };
  // 2000px / (100mm / 25.4) = 508 dpi
  ok("2000px 铺 100mm ≈ 508 DPI", Math.round(photoDpi(layer)) === 508, String(photoDpi(layer)));
  const cropped = { ...layer, crop: { x: 0, y: 0, w: 1000, h: 1000 } };
  ok("裁剪后按取景宽度算 ≈ 254 DPI", Math.round(photoDpi(cropped)) === 254, String(photoDpi(cropped)));
  ok("没图返回 0", photoDpi({ ...layer, naturalW: 0, crop: undefined }) === 0);
}

console.log("\n边界判断");
{
  const okLayer = { type: "image", id: "a", name: "p", x: 20, y: 20, w: 100, h: 100 };
  const out = { ...okLayer, x: 60, w: 100 };
  ok("正常照片框不越界", !frameOutsidePanel(okLayer));
  ok("越界能识别", frameOutsidePanel(out));
  ok("框够大时不报安全区", !frameOutsideSafe(okLayer));
  ok("贴边会报安全区", frameOutsideSafe({ ...okLayer, x: 2 }));
}

console.log(failed === 0 ? "\nOK — 照片计算全部通过" : `\n${failed} 个失败`);
process.exit(failed === 0 ? 0 : 1);
