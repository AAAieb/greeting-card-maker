/**
 * 照片图层上的「动作」：把用户操作翻译成要写回文档的补丁。
 * 纯函数，谁都能调，不碰 DOM。
 *
 * 分工 1 接 onMove 的时候只需要一行：
 *   const patch = dragPatch(layer, x, y)
 * 不用关心照片和文字的区别，语义都封装在这里。
 */
import type { ImageLayer, Layer } from "../types";
import { coverCrop, panCrop, photoDpi } from "./photoMath";

/**
 * 拖动结束后的补丁。
 * 文字/形状 → 移动自己；照片 → 移动取景框，框本身不动（位置由模板决定）。
 */
export function dragPatch(
  layer: Layer,
  nextX: number,
  nextY: number
): Record<string, unknown> {
  if (layer.type !== "image") return { x: nextX, y: nextY };
  if (!layer.crop || !layer.naturalW) return { x: layer.x, y: layer.y };

  const crop = panCrop(
    layer.crop,
    layer.w,
    layer.h,
    nextX - layer.x,
    nextY - layer.y,
    layer.naturalW,
    layer.naturalH ?? 0
  );
  return { crop, x: layer.x, y: layer.y };
}

/** 复位取景：回到「等比铺满、居中」 */
export function resetCropPatch(layer: ImageLayer): Record<string, unknown> {
  if (!layer.naturalW || !layer.naturalH) return {};
  return { crop: coverCrop(layer.naturalW, layer.naturalH, layer.w, layer.h) };
}

/** 移除照片但保留照片框（用户想换个位置重新放） */
export function removePhotoPatch(): Record<string, unknown> {
  return { src: undefined, naturalW: undefined, naturalH: undefined, crop: undefined };
}

export interface PhotoSummary {
  width: number;
  height: number;
  dpi: number;
  quality: "good" | "soft" | "low";
  placeholder: boolean;
}

/** 给界面显示的一句话摘要 */
export function photoSummary(layer: ImageLayer): PhotoSummary {
  const width = layer.naturalW ?? 0;
  const height = layer.naturalH ?? 0;
  const dpi = Math.round(photoDpi(layer));
  return {
    width,
    height,
    dpi,
    quality: !width ? "low" : dpi >= 300 ? "good" : dpi >= 150 ? "soft" : "low",
    placeholder: !layer.src,
  };
}
