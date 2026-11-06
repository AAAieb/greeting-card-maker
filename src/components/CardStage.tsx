import { useEffect, useRef } from "react";
import Konva from "konva";
import type { CardDoc, PanelKey } from "../types";
import { PANEL_H, PANEL_W, SAFE } from "../types";
import type { Assets } from "../lib/renderer";
import { drawPanel } from "../lib/renderer";

interface Props {
  doc: CardDoc;
  panel: PanelKey;
  assets: Assets;
  pxPerMm: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
}

export default function CardStage({
  doc,
  panel,
  assets,
  pxPerMm,
  selectedId,
  onSelect,
  onMove,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const groupRef = useRef<Konva.Group | null>(null);
  const guideRef = useRef<Konva.Group | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const stage = new Konva.Stage({
      container: host,
      width: PANEL_W * pxPerMm,
      height: PANEL_H * pxPerMm,
    });
    const layer = new Konva.Layer();
    const group = new Konva.Group({ scaleX: pxPerMm, scaleY: pxPerMm });
    const guides = new Konva.Group({ scaleX: pxPerMm, scaleY: pxPerMm, listening: false });
    layer.add(group);
    layer.add(guides);
    stage.add(layer);

    stage.on("mousedown touchstart", (e) => {
      if (e.target === stage) onSelect(null);
    });

    stageRef.current = stage;
    groupRef.current = group;
    guideRef.current = guides;

    return () => {
      stage.destroy();
      stageRef.current = null;
      groupRef.current = null;
      guideRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pxPerMm]);

  useEffect(() => {
    const stage = stageRef.current;
    const group = groupRef.current;
    const guides = guideRef.current;
    if (!stage || !group || !guides) return;

    drawPanel(group, doc.panels[panel], doc.theme, assets, {
      interactive: true,
      selectedId,
      onSelect,
      onDragEnd: onMove,
    });

    guides.destroyChildren();
    guides.add(
      new Konva.Rect({
        x: SAFE,
        y: SAFE,
        width: PANEL_W - SAFE * 2,
        height: PANEL_H - SAFE * 2,
        stroke: "#2D7FF9",
        strokeWidth: 0.15,
        dash: [1.6, 1.6],
        opacity: 0.55,
      })
    );
    guides.add(
      new Konva.Rect({
        x: 0,
        y: 0,
        width: PANEL_W,
        height: PANEL_H,
        stroke: "#C2185B",
        strokeWidth: 0.15,
        opacity: 0.5,
      })
    );
    stage.batchDraw();
  }, [doc, panel, assets, selectedId, onSelect, onMove]);

  return (
    <div className="stage-wrap">
      <div ref={hostRef} className="stage-host" />
    </div>
  );
}
