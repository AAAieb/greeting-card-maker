import type { CardDoc, Layer, PanelKey, TextLayer } from "../types";
import { PANEL_H, PANEL_W, SAFE } from "../types";
import { FONT_STACKS } from "../data/templates";
import { frameOutsidePanel, photoDpi } from "./photoMath";

export type IssueLevel = "error" | "warn";

export interface Issue {
  key: string;
  level: IssueLevel;
  panel: PanelKey;
  layerId?: string;
  title: string;
  detail: string;
}

export const PANEL_LABEL: Record<PanelKey, string> = {
  front: "正面",
  insideLeft: "内页左",
  insideRight: "内页右",
  back: "背面",
};

/** 每个文字层允许的最大字符数 */
export const MAX_CHARS = 200;

let ctx: CanvasRenderingContext2D | null = null;
function measureCtx() {
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  return ctx!;
}

/** 贪心换行，中英混排都适用；返回值单位与 fontSize 相同（毫米） */
export function wrapText(
  text: string,
  font: string,
  size: number,
  weight: number,
  maxW: number
): string[] {
  const c = measureCtx();
  c.font = `${weight >= 600 ? "bold " : ""}${size}px ${font}`;
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    if (!para) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const ch of para) {
      const next = line + ch;
      if (c.measureText(next).width > maxW && line) {
        if (/[，。、；：！？,.;:!?）】」』]/.test(ch)) {
          lines.push(line.trimEnd() + ch);
          line = "";
        } else {
          lines.push(line.trimEnd());
          line = ch;
        }
      } else {
        line = next;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines;
}

export function textHeight(l: TextLayer) {
  const lines = wrapText(l.text, FONT_STACKS[l.font], l.size, l.weight, l.w);
  return Math.max(1, lines.length) * l.size * l.lineHeight;
}

function luminance(hex: string) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function contrast(a: string, b: string) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

const trim = (s: string, n = 10) => {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
};

type Box = { x: number; y: number; w: number; h: number };

function outside(b: Box, pad = 0) {
  return b.x < pad || b.y < pad || b.x + b.w > PANEL_W - pad || b.y + b.h > PANEL_H - pad;
}

export function runChecks(doc: CardDoc): Issue[] {
  const out: Issue[] = [];
  const panels: PanelKey[] = ["front", "insideLeft", "insideRight", "back"];

  for (const p of panels) {
    const label = PANEL_LABEL[p];

    for (const l of doc.panels[p] as Layer[]) {
      if (l.type === "text") {
        const text = l.text.trim();
        const box: Box = { x: l.x, y: l.y, w: l.w, h: textHeight(l) };

        if (!text) {
          out.push({
            key: `${l.id}-empty`,
            level: "error",
            panel: p,
            layerId: l.id,
            title: "有文字是空的",
            detail: `${label}：这里原本要写内容，现在删空了，打印出来会是一块空白。`,
          });
          continue;
        }

        if (l.text.length > MAX_CHARS) {
          out.push({
            key: `${l.id}-long`,
            level: "error",
            panel: p,
            layerId: l.id,
            title: "文字太长",
            detail: `${label}：${l.text.length} 字，上限 ${MAX_CHARS} 字。删短一点，或者拆成两段。`,
          });
        }

        if (outside(box)) {
          out.push({
            key: `${l.id}-out`,
            level: "error",
            panel: p,
            layerId: l.id,
            title: "文字超出画布",
            detail: `${label}的「${trim(text)}」已经跑到卡片外面，导出后会被裁掉。`,
          });
        } else if (outside(box, SAFE)) {
          out.push({
            key: `${l.id}-safe`,
            level: "warn",
            panel: p,
            layerId: l.id,
            title: "文字太靠近裁切线",
            detail: `${label}的「${trim(text)}」离边缘不足 ${SAFE}mm，裁切时可能被切掉。`,
          });
        } else if (p === "insideLeft" && box.x + box.w > PANEL_W - 6) {
          out.push({
            key: `${l.id}-fold`,
            level: "warn",
            panel: p,
            layerId: l.id,
            title: "文字压到了折线",
            detail: "内页左侧的文字离折线太近，折起来会拱起。",
          });
        }

        if (contrast(l.color, doc.theme.bg) < 3) {
          out.push({
            key: `${l.id}-contrast`,
            level: "warn",
            panel: p,
            layerId: l.id,
            title: "文字和背景太接近",
            detail: `「${trim(text)}」和底色的对比度只有 ${contrast(l.color, doc.theme.bg).toFixed(1)}:1，打印后可能看不清。`,
          });
        }
      }

      if (l.type === "image") {
        if (!l.src) {
          out.push({
            key: `${l.id}-none`,
            level: "warn",
            panel: p,
            layerId: l.id,
            title: "还没有上传照片",
            detail: `${label}留了一个照片位。选中它上传一张，或者删掉这个照片框。`,
          });
        } else {
          const dpi = photoDpi(l);
          if (dpi > 0 && dpi < 150) {
            out.push({
              key: `${l.id}-blur`,
              level: "error",
              panel: p,
              layerId: l.id,
              title: "照片分辨率太低",
              detail: `按这个尺寸打印只有约 ${Math.round(dpi)} DPI，会明显发糊。换一张更大的图，或把照片框缩小。`,
            });
          } else if (dpi > 0 && dpi < 300) {
            out.push({
              key: `${l.id}-soft`,
              level: "warn",
              panel: p,
              layerId: l.id,
              title: "照片清晰度偏低",
              detail: `当前约 ${Math.round(dpi)} DPI，印刷一般需要 300 DPI。`,
            });
          }
        }
        if (frameOutsidePanel(l)) {
          out.push({
            key: `${l.id}-out`,
            level: "error",
            panel: p,
            layerId: l.id,
            title: "照片超出画布",
            detail: `${label}的照片有一部分在卡片外面，会被裁掉。`,
          });
        }
      }
    }
  }

  return out;
}
