import { jsPDF } from "jspdf";
import type { CardDoc, PanelKey } from "../types";
import { BLEED, MM_PER_IN, PANEL_H, PANEL_W, SAFE, SHEET_H, SHEET_W } from "../types";
import type { Assets } from "./renderer";
import { drawPanel } from "./renderer";

const PAGE_W = SHEET_W + BLEED * 2;
const PAGE_H = SHEET_H + BLEED * 2;

type Sheet = { name: string; left: PanelKey; right: PanelKey };

const SHEETS: Sheet[] = [
  { name: "outside", left: "back", right: "front" },
  { name: "inside", left: "insideLeft", right: "insideRight" },
];

async function renderSheet(doc: CardDoc, sheet: Sheet, assets: Assets, dpi: number): Promise<string> {
  const Konva = (await import("konva")).default;
  const px = dpi / MM_PER_IN;
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  document.body.appendChild(container);

  const stage = new Konva.Stage({
    container,
    width: PAGE_W * px,
    height: PAGE_H * px,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  const leftGroup = new Konva.Group({
    x: BLEED * px,
    y: BLEED * px,
    scaleX: px,
    scaleY: px,
  });
  const rightGroup = new Konva.Group({
    x: (BLEED + PANEL_W) * px,
    y: BLEED * px,
    scaleX: px,
    scaleY: px,
  });
  layer.add(leftGroup);
  layer.add(rightGroup);

  drawPanel(leftGroup, doc.panels[sheet.left], doc.theme, assets, {
    bleed: { left: true, right: false, top: true, bottom: true },
    bleedMm: BLEED,
  });
  drawPanel(rightGroup, doc.panels[sheet.right], doc.theme, assets, {
    bleed: { left: false, right: true, top: true, bottom: true },
    bleedMm: BLEED,
  });

  layer.draw();

  const url = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });
  stage.destroy();
  container.remove();
  return url;
}

function drawTrimMarks(pdf: jsPDF) {
  const t = 4; // mark length outside trim
  const gap = 1;
  const x0 = BLEED;
  const y0 = BLEED;
  const x1 = BLEED + SHEET_W;
  const y1 = BLEED + SHEET_H;

  pdf.setDrawColor(0);
  pdf.setLineWidth(0.15);
  const seg = (xa: number, ya: number, xb: number, yb: number) => pdf.line(xa, ya, xb, yb);

  // corners: horizontal + vertical marks, offset from the trim edge
  for (const [cx, dx] of [
    [x0, -1],
    [x1, 1],
  ] as const) {
    for (const [cy, dy] of [
      [y0, -1],
      [y1, 1],
    ] as const) {
      seg(cx + dx * gap, cy, cx + dx * (gap + t), cy);
      seg(cx, cy + dy * gap, cx, cy + dy * (gap + t));
    }
  }

  // fold marks at the centre, outside the trim
  const fx = BLEED + PANEL_W;
  seg(fx, y0 - gap, fx, y0 - gap - t);
  seg(fx, y1 + gap, fx, y1 + gap + t);
}

export async function exportPdf(doc: CardDoc, assets: Assets): Promise<void> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [PAGE_W, PAGE_H],
    compress: true,
  });

  for (let i = 0; i < SHEETS.length; i++) {
    const sheet = SHEETS[i];
    if (i > 0) pdf.addPage([PAGE_W, PAGE_H], "landscape");
    const png = await renderSheet(doc, sheet, assets, 300);
    pdf.addImage(png, "PNG", 0, 0, PAGE_W, PAGE_H, `sheet_${i}`, "FAST");
    drawTrimMarks(pdf);
  }

  pdf.setProperties({
    title: `Campus Card - ${doc.templateName}`,
    subject: "Print-ready A5 folded card, 3mm bleed",
    creator: "Campus Greeting Card Maker",
  });

  const stamp = new Date().toISOString().slice(0, 10);
  pdf.save(`campus-card-${doc.templateId}-${stamp}.pdf`);
}

export async function exportPng(
  doc: CardDoc,
  panel: PanelKey,
  assets: Assets,
  dpi = 300
): Promise<void> {
  const Konva = (await import("konva")).default;
  const px = dpi / MM_PER_IN;
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  document.body.appendChild(container);

  const stage = new Konva.Stage({ container, width: PANEL_W * px, height: PANEL_H * px });
  const layer = new Konva.Layer();
  const group = new Konva.Group({ scaleX: px, scaleY: px });
  layer.add(group);
  stage.add(layer);

  drawPanel(group, doc.panels[panel], doc.theme, assets);
  layer.draw();

  const url = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });
  stage.destroy();
  container.remove();

  const a = document.createElement("a");
  a.href = url;
  a.download = `campus-card-${doc.templateId}-${panel}.png`;
  a.click();
}

export const GEOMETRY = { PAGE_W, PAGE_H, BLEED, SAFE, PANEL_W, PANEL_H, SHEET_W, SHEET_H };
