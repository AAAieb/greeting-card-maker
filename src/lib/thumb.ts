import type { CardDoc, PanelKey } from "../types";
import { MM_PER_IN, PANEL_H, PANEL_W } from "../types";
import type { Assets } from "./renderer";
import { drawPanel } from "./renderer";

/** Render one panel to a PNG data URL at a given width, for gallery thumbnails. */
export async function renderPanelThumb(
  doc: CardDoc,
  panel: PanelKey,
  widthPx: number,
  assets: Assets
): Promise<string> {
  const Konva = (await import("konva")).default;
  const scale = widthPx / PANEL_W;
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  document.body.appendChild(container);

  const stage = new Konva.Stage({
    container,
    width: widthPx,
    height: PANEL_H * scale,
  });
  const layer = new Konva.Layer();
  const group = new Konva.Group({ scaleX: scale, scaleY: scale });
  layer.add(group);
  stage.add(layer);
  drawPanel(group, doc.panels[panel], doc.theme, assets);
  layer.draw();

  const url = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });
  stage.destroy();
  container.remove();
  return url;
}

export const MM_PER_PX = MM_PER_IN / 96;
