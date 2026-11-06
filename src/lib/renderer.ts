import Konva from "konva";
import type { Layer, Theme } from "../types";
import { FONT_STACKS } from "../data/templates";
import { coverCrop as coverCropMath } from "./photoMath";

export type Assets = {
  images: Map<string, HTMLImageElement>;
  /** 二维码素材，下一阶段启用 */
  qr?: Map<string, HTMLImageElement>;
};

const imageCache = new Map<string, HTMLImageElement>();
const qrCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  const hit = imageCache.get(src);
  if (hit && hit.complete && hit.naturalWidth) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function putQr(url: string, img: HTMLImageElement) {
  qrCache.set(url, img);
}
export function getQr(url: string) {
  return qrCache.get(url);
}

/** object-fit: cover 的取景框（原图像素坐标）；实现见 lib/photoMath.ts */
export function coverCrop(img: HTMLImageElement, wMm: number, hMm: number) {
  return coverCropMath(img.naturalWidth, img.naturalHeight, wMm, hMm);
}

function addText(l: Layer & { type: "text" }, n: Konva.Text) {
  return n;
}

const noop = (..._args: unknown[]) => {};

export interface DrawOpts {
  interactive?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onDragEnd?: (id: string, x: number, y: number) => void;
  /** bleed overflow flags for export */
  bleed?: { left: boolean; right: boolean; top: boolean; bottom: boolean };
  bleedMm?: number;
}

export function drawPanel(
  group: Konva.Group,
  layers: Layer[],
  theme: Theme,
  assets: Assets,
  opts: DrawOpts = {}
) {
  group.destroyChildren();

  const b = opts.bleed;
  const bm = opts.bleedMm ?? 0;
  if (b && bm > 0) {
    const x = b.left ? -bm : 0;
    const y = b.top ? -bm : 0;
    const w = PANEL_W_LOCAL + (b.left ? bm : 0) + (b.right ? bm : 0);
    const h = PANEL_H_LOCAL + (b.top ? bm : 0) + (b.bottom ? bm : 0);
    group.add(new Konva.Rect({ x, y, width: w, height: h, fill: theme.bg, listening: false }));
  } else {
    group.add(
      new Konva.Rect({ x: 0, y: 0, width: PANEL_W_LOCAL, height: PANEL_H_LOCAL, fill: theme.bg, listening: false })
    );
  }

  for (const l of layers) {
    const node = buildNode(l, assets, opts);
    if (node) {
      node.setAttr("layerId", l.id);
      group.add(node);
    }
  }
  void addText;
  void noop;
}

const PANEL_W_LOCAL = 148.5;
const PANEL_H_LOCAL = 210;

function buildNode(l: Layer, assets: Assets, opts: DrawOpts): Konva.Shape | null {
  const common = {
    x: l.x,
    y: l.y,
    draggable: !!opts.interactive && l.type !== "shape",
    name: "layer",
  };

  if (l.type === "shape") {
    if (l.shape === "rect") {
      return new Konva.Rect({
        x: l.x,
        y: l.y,
        width: l.w,
        height: l.h,
        fill: l.fill,
        stroke: l.stroke,
        strokeWidth: l.strokeWidth ?? 0,
        cornerRadius: l.radius ?? 0,
        listening: false,
        ...("rotation" in l ? { rotation: (l as { rotation?: number }).rotation ?? 0 } : {}),
      });
    }
    if (l.shape === "circle") {
      return new Konva.Circle({
        x: l.x + l.w / 2,
        y: l.y + l.h / 2,
        radius: l.w / 2,
        fill: l.fill,
        stroke: l.stroke,
        strokeWidth: l.strokeWidth ?? 0,
        listening: false,
      });
    }
    if (l.shape === "line") {
      const p = l.points ?? [l.x, l.y, l.x + l.w, l.y + l.h];
      return new Konva.Line({
        points: p,
        stroke: l.stroke,
        strokeWidth: l.strokeWidth ?? 0.4,
        lineCap: "butt",
        listening: false,
      });
    }
    if (l.shape === "polygon") {
      return new Konva.Line({
        points: l.points ?? [],
        closed: true,
        fill: l.fill,
        stroke: l.stroke,
        strokeWidth: l.strokeWidth ?? 0,
        listening: false,
      });
    }
    return null;
  }

  if (l.type === "text") {
    const n = new Konva.Text({
      ...common,
      text: l.text,
      width: l.w,
      fontSize: l.size,
      fontFamily: FONT_STACKS[l.font] ?? FONT_STACKS["sans-cn"],
      fontStyle: l.weight >= 600 ? "bold" : l.weight <= 300 ? "300" : "normal",
      fill: l.color,
      align: l.align,
      lineHeight: l.lineHeight,
      letterSpacing: l.letterSpacing,
      wrap: "word",
      perfectDrawEnabled: false,
    });
    if (opts.selectedId === l.id) {
      n.shadowColor("#2D7FF9");
      n.shadowBlur(0.8);
      n.shadowOpacity(1);
    }
    wire(n, opts);
    return n;
  }

  if (l.type === "image") {
    const img = l.src ? assets.images.get(l.src) : undefined;
    const c = l.crop ?? (img ? coverCrop(img, l.w, l.h) : undefined);
    const crop = c ? { x: c.x, y: c.y, width: c.w, height: c.h } : undefined;
    const n = new Konva.Image({
      ...common,
      image: img,
      width: l.w,
      height: l.h,
      crop,
      cornerRadius: l.radius ?? 0,
      opacity: img ? 1 : 0,
    });
    if (!img) {
      const ph = new Konva.Rect({
        x: l.x,
        y: l.y,
        width: l.w,
        height: l.h,
        fill: "#EFEBE6",
        dash: [2.4, 1.6],
        stroke: "#B9B2A8",
        strokeWidth: 0.3,
        listening: false,
      });
      const label = new Konva.Text({
        x: l.x,
        y: l.y + l.h / 2 - 2.2,
        width: l.w,
        text: "点击上传照片",
        fontSize: 3.4,
        fontFamily: FONT_STACKS["sans-cn"],
        fill: "#8A8078",
        align: "center",
        listening: false,
      });
      const icon = new Konva.Rect({
        x: l.x + l.w / 2 - 3,
        y: l.y + l.h / 2 - 9,
        width: 6,
        height: 4.4,
        stroke: "#8A8078",
        strokeWidth: 0.25,
        cornerRadius: 0.5,
        listening: false,
      });
      wire(n, opts);
      const g = new Konva.Group();
      g.add(ph);
      g.add(icon);
      g.add(label);
      g.add(n);
      return g as unknown as Konva.Shape;
    }
    if (opts.selectedId === l.id) {
      n.stroke("#2D7FF9");
      n.strokeWidth(0.3);
    }
    wire(n, opts);
    return n;
  }

  if (l.type === "qr") {
    const img = l.url ? assets.qr?.get(l.url) : undefined;
    const g = new Konva.Group({ x: l.x, y: l.y, draggable: !!opts.interactive });
    g.add(
      new Konva.Rect({
        x: -l.pad,
        y: -l.pad,
        width: l.size + l.pad * 2,
        height: l.size + l.pad * 2,
        fill: "#FFFFFF",
        listening: false,
      })
    );
    if (img) {
      g.add(new Konva.Image({ image: img, width: l.size, height: l.size, listening: false }));
    } else {
      g.add(
        new Konva.Rect({
          width: l.size,
          height: l.size,
          stroke: "#B9B2A8",
          strokeWidth: 0.3,
          dash: [1.5, 1.5],
          listening: false,
        })
      );
    }
    g.on("dragend", () => {
      opts.onDragEnd?.(l.id, g.x(), g.y());
    });
    return g as unknown as Konva.Shape;
  }

  return null;
}

function wire(node: Konva.Node, opts: DrawOpts) {
  if (!opts.interactive) return;
  node.on("mousedown touchstart", (e) => {
    e.cancelBubble = true;
    opts.onSelect?.(node.getAttr("layerId") ?? null);
  });
  node.on("dragend", () => {
    opts.onDragEnd?.(node.getAttr("layerId"), node.x(), node.y());
  });
}
