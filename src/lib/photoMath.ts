/**
 * 照片相关的纯计算：取景框、分辨率、边界。
 * 不碰 DOM，可以在 Node 里直接测（scripts/test-photo.mjs）。
 *
 * 三条不变式（谁改这个文件都不能破坏）：
 *   1. crop 的宽高比永远等于照片框的宽高比 —— 照片不可能被拉伸
 *   2. crop 永远落在原图范围内 —— 不会露出空白
 *   3. 缩放只改 crop，不改照片框的 w/h —— 版面位置由模板决定
 */
import type { ImageLayer } from "../types";
import { PANEL_H, PANEL_W, SAFE } from "../types";

export const MM_PER_INCH = 25.4;
/** 解码后最长边上限，避免一张手机原图吃掉几百 MB 内存 */
export const MAX_EDGE_PX = 3000;
/** 小于这个尺寸的照片在贺卡上没有意义 */
export const MIN_EDGE_PX = 320;

export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** object-fit: cover —— 取原图中能填满照片框的最大居中矩形 */
export function coverCrop(
  imgW: number,
  imgH: number,
  frameW: number,
  frameH: number
): Crop {
  if (!imgW || !imgH || !frameW || !frameH) return { x: 0, y: 0, w: imgW || 1, h: imgH || 1 };
  const targetAR = frameW / frameH;
  const srcAR = imgW / imgH;
  if (srcAR > targetAR) {
    const w = imgH * targetAR;
    return { x: (imgW - w) / 2, y: 0, w, h: imgH };
  }
  const h = imgW / targetAR;
  return { x: 0, y: (imgH - h) / 2, w: imgW, h };
}

/** 把 crop 按边界夹回原图内 */
export function clampCrop(c: Crop, imgW: number, imgH: number): Crop {
  const w = Math.min(c.w, imgW);
  const h = Math.min(c.h, imgH);
  return {
    x: clamp(c.x, 0, imgW - w),
    y: clamp(c.y, 0, imgH - h),
    w,
    h,
  };
}

/**
 * 以当前取景中心为锚点缩放。zoom = 1 时等于 cover。
 * 这里同时保证不变式 1 和 2。
 */
export function zoomCrop(
  current: Crop | undefined,
  imgW: number,
  imgH: number,
  frameW: number,
  frameH: number,
  zoom: number
): Crop {
  const base = coverCrop(imgW, imgH, frameW, frameH);
  const z = clamp(zoom, 1, 4);
  const cx = (current?.x ?? base.x) + (current?.w ?? base.w) / 2;
  const cy = (current?.y ?? base.y) + (current?.h ?? base.h) / 2;
  const w = base.w / z;
  const h = base.h / z;
  return clampCrop({ x: cx - w / 2, y: cy - h / 2, w, h }, imgW, imgH);
}

/**
 * 拖动照片 = 平移取景框。dx/dy 是画布上的毫米位移（向左拖=看右边）。
 */
export function panCrop(
  crop: Crop,
  frameW: number,
  frameH: number,
  dxMm: number,
  dyMm: number,
  imgW: number,
  imgH: number
): Crop {
  const sx = crop.w / frameW;
  const sy = crop.h / frameH;
  return clampCrop({ ...crop, x: crop.x - dxMm * sx, y: crop.y - dyMm * sy }, imgW, imgH);
}

/** 照片在打印尺寸下的有效分辨率 */
export function photoDpi(layer: ImageLayer): number {
  const px = layer.crop?.w ?? layer.naturalW ?? 0;
  if (!px || !layer.w) return 0;
  return px / (layer.w / MM_PER_INCH);
}

/** 照片框是否跑出画布 */
export function frameOutsidePanel(layer: ImageLayer): boolean {
  return (
    layer.x < 0 ||
    layer.y < 0 ||
    layer.x + layer.w > PANEL_W ||
    layer.y + layer.h > PANEL_H
  );
}

/** 照片框是否进入安全区（会被裁切线切到） */
export function frameOutsideSafe(layer: ImageLayer): boolean {
  return (
    layer.x < SAFE ||
    layer.y < SAFE ||
    layer.x + layer.w > PANEL_W - SAFE ||
    layer.y + layer.h > PANEL_H - SAFE
  );
}
