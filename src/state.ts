import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CardDoc, ImageLayer, PanelKey } from "./types";
import type { Assets } from "./lib/renderer";
import { loadImage } from "./lib/renderer";
import { coverCrop, panCrop as panCropMath, zoomCrop } from "./lib/photoMath";
import { loadPhoto } from "./lib/photo";

export const PANEL_ORDER: PanelKey[] = ["front", "insideLeft", "insideRight", "back"];

/** 允许的图片格式与大小上限（供界面文案引用） */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_MB = 8;

/** 加载文档里引用的所有图片，供画布与缩略图使用 */
export function useAssets(doc: CardDoc | null) {
  const [assets, setAssets] = useState<Assets>({ images: new Map() });

  const srcKey = useMemo(() => {
    if (!doc) return "[]";
    const srcs = Object.values(doc.panels)
      .flat()
      .filter((l): l is ImageLayer => l.type === "image" && !!l.src)
      .map((l) => l.src!);
    return JSON.stringify(srcs);
  }, [doc]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!doc) return;
      const images = new Map<string, HTMLImageElement>();
      let srcs: string[] = [];
      try {
        srcs = JSON.parse(srcKey) as string[];
      } catch {
        srcs = [];
      }
      for (const s of srcs) {
        try {
          images.set(s, await loadImage(s));
        } catch {
          /* 坏图先跳过，检查面板会提示 */
        }
      }
      if (alive) setAssets({ images });
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcKey]);

  return assets;
}

/** 文档状态 + 撤销/重做 */
export function useDocHistory(initial: CardDoc | null) {
  const [doc, setDoc] = useState<CardDoc | null>(initial);
  const past = useRef<CardDoc[]>([]);
  const future = useRef<CardDoc[]>([]);
  const lastAt = useRef(0);
  const [version, setVersion] = useState(0);

  const update = useCallback((fn: (d: CardDoc) => CardDoc, coalesce = false) => {
    setDoc((cur) => {
      if (!cur) return cur;
      const next = fn(cur);
      if (next === cur) return cur;
      const now = Date.now();
      const canCoalesce = coalesce && now - lastAt.current < 700 && past.current.length > 0;
      if (!canCoalesce) {
        past.current.push(cur);
        if (past.current.length > 60) past.current.shift();
      }
      lastAt.current = now;
      future.current = [];
      setVersion((v) => v + 1);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setDoc((cur) => {
      const prev = past.current.pop();
      if (!prev) return cur;
      if (cur) future.current.push(cur);
      setVersion((v) => v + 1);
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setDoc((cur) => {
      const next = future.current.pop();
      if (!next) return cur;
      if (cur) past.current.push(cur);
      setVersion((v) => v + 1);
      return next;
    });
  }, []);

  const reset = useCallback((d: CardDoc) => {
    past.current = [];
    future.current = [];
    setDoc(d);
    setVersion((v) => v + 1);
  }, []);

  return {
    doc,
    update,
    undo,
    redo,
    reset,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    version,
  };
}

/** 把照片的取景框按缩放倍率重新计算，保持原始比例 */
export function applyCrop(
  layer: ImageLayer,
  images: Map<string, HTMLImageElement>,
  zoom: number
): ImageLayer {
  const img = layer.src ? images.get(layer.src) : undefined;
  if (!img) return layer;
  const crop = zoomCrop(layer.crop, img.naturalWidth, img.naturalHeight, layer.w, layer.h, zoom);
  return { ...layer, crop };
}

/** 在画布上拖动照片＝移动取景框，宽度不变 */
export function panCrop(
  layer: ImageLayer,
  dxMm: number,
  dyMm: number,
  naturalW: number,
  naturalH: number
): ImageLayer {
  if (!layer.crop) return layer;
  const crop = panCropMath(layer.crop, layer.w, layer.h, dxMm, dyMm, naturalW, naturalH);
  return { ...layer, crop };
}

/** 首次放入照片时的取景框（等比铺满） */
export function initialCrop(layer: ImageLayer, imgW: number, imgH: number) {
  return coverCrop(imgW, imgH, layer.w, layer.h);
}

/** 读取图片文件，带格式、体积、尺寸校验（实现见 lib/photo.ts） */
export async function readImageFile(
  file: File
): Promise<{ src: string; w: number; h: number }> {
  const asset = await loadPhoto(file);
  return { src: asset.src, w: asset.width, h: asset.height };
}
