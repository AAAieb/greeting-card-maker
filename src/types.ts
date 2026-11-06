export type Occasion = "birthday" | "graduation" | "teacher" | "society";

export type PanelKey = "front" | "insideLeft" | "insideRight" | "back";

export type FontKey = "sans-cn" | "serif-cn" | "kai" | "latin-serif" | "latin-sans";

export interface Theme {
  bg: string;
  ink: string;
  accent: string;
  muted: string;
}

interface LayerBase {
  id: string;
  name: string;
  x: number; // mm, panel space
  y: number;
}

export interface TextLayer extends LayerBase {
  type: "text";
  text: string;
  w: number; // wrap width, mm
  size: number; // mm
  font: FontKey;
  weight: number;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number; // mm
}

export interface ImageLayer extends LayerBase {
  type: "image";
  w: number;
  h: number;
  src?: string;
  naturalW?: number;
  naturalH?: number;
  /** crop in source pixels */
  crop?: { x: number; y: number; w: number; h: number };
  radius: number;
}

export type ShapeKind = "rect" | "circle" | "line" | "polygon";

export interface ShapeLayer extends LayerBase {
  type: "shape";
  shape: ShapeKind;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  points?: number[];
}

export interface QrLayer extends LayerBase {
  type: "qr";
  size: number;
  url: string;
  pad: number;
}

export type Layer = TextLayer | ImageLayer | ShapeLayer | QrLayer;

export type PanelMap = Record<PanelKey, Layer[]>;

export interface CardDoc {
  templateId: string;
  templateName: string;
  occasion: Occasion;
  theme: Theme;
  panels: PanelMap;
  qr: { url: string; enabled: boolean };
  meta: { recipient: string; sender: string };
}

export interface Template {
  id: string;
  name: string;
  occasion: Occasion;
  blurb: string;
  build: () => CardDoc;
}

export const PANEL_W = 148.5;
export const PANEL_H = 210;
export const SHEET_W = 297;
export const SHEET_H = 210;
export const BLEED = 3;
export const SAFE = 8;
export const MM_PER_IN = 25.4;
