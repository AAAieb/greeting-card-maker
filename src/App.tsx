import { useCallback, useEffect, useMemo, useState } from "react";
import type { CardDoc, ImageLayer, Layer, PanelKey, TextLayer } from "./types";
import { PANEL_H, PANEL_W } from "./types";
import Home from "./components/Home";
import Gallery from "./components/Gallery";
import CardStage from "./components/CardStage";
import Inspector from "./components/Inspector";
import ExportView from "./components/ExportView";
import { runChecks } from "./lib/checks";
import { TEMPLATES } from "./data/templates";
import { applyCrop, panCrop, readImageFile, useAssets, useDocHistory } from "./state";

type View = "home" | "templates" | "editor" | "export";

const TABS: { key: PanelKey; label: string; hint: string }[] = [
  { key: "front", label: "正面", hint: "折起来看到的那一面" },
  { key: "insideLeft", label: "内页左", hint: "翻开后的左半页" },
  { key: "insideRight", label: "内页右", hint: "翻开后的右半页" },
  { key: "back", label: "背面", hint: "封底" },
];

export default function App() {
  const { doc, update, undo, redo, reset, canUndo, canRedo, version } = useDocHistory(null);
  const [view, setView] = useState<View>("home");
  const [panel, setPanel] = useState<PanelKey>("front");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [scale, setScale] = useState(2.7);

  const assets = useAssets(doc);
  const issues = useMemo(() => (doc ? runChecks(doc) : []), [doc, version]);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      const narrow = w < 980;
      const availW = narrow ? w - 44 : w - 372 - 70;
      const byW = availW / PANEL_W;
      const byH = (window.innerHeight - (narrow ? 150 : 210)) / PANEL_H;
      const max = narrow ? 2.6 : 2.9;
      setScale(Math.max(1.1, Math.min(max, byW, narrow ? max : byH)));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(t);
  }, [toast]);

  const selected: Layer | null = useMemo(() => {
    if (!doc || !selectedId) return null;
    return doc.panels[panel].find((l) => l.id === selectedId) ?? null;
  }, [doc, panel, selectedId]);

  const onLayer = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      update(
        (d) => ({
          ...d,
          panels: {
            ...d.panels,
            [panel]: d.panels[panel].map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
          },
        }),
        true
      );
    },
    [panel, update]
  );

  const onMove = useCallback(
    (id: string, x: number, y: number) => {
      update((d) => {
        const layer = d.panels[panel].find((l) => l.id === id);
        if (!layer) return d;
        let next: Layer = { ...layer, x, y };
        if (cropMode && layer.type === "image" && layer.crop && layer.naturalW) {
          const moved = panCrop(layer as ImageLayer, x - layer.x, y - layer.y, layer.naturalW, layer.naturalH ?? 0);
          next = { ...(layer as ImageLayer), crop: moved.crop, x: layer.x, y: layer.y };
        }
        return {
          ...d,
          panels: { ...d.panels, [panel]: d.panels[panel].map((l) => (l.id === id ? next : l)) },
        };
      });
    },
    [cropMode, panel, update]
  );

  const onDelete = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        panels: { ...d.panels, [panel]: d.panels[panel].filter((l) => l.id !== id) },
      }));
      setSelectedId(null);
    },
    [panel, update]
  );

  const onUpload = useCallback(
    async (file: File) => {
      if (!selected || selected.type !== "image") {
        setToast("先选中画布上的照片框，再上传");
        return;
      }
      try {
        const { src, w, h } = await readImageFile(file);
        onLayer(selected.id, { src, naturalW: w, naturalH: h, crop: undefined });
        setCropZoom(1);
        setToast("照片已放入，可以拖动和缩放");
      } catch (e) {
        setToast((e as Error).message);
      }
    },
    [onLayer, selected]
  );

  const onInsertGreeting = useCallback(
    (text: string) => {
      update((d) => {
        const list = d.panels[panel];
        const target =
          (list.find((l) => l.id === selectedId && l.type === "text") as TextLayer | undefined) ??
          (list.find((l) => l.type === "text") as TextLayer | undefined);
        if (!target) return d;
        return {
          ...d,
          panels: { ...d.panels, [panel]: list.map((l) => (l.id === target.id ? { ...l, text } : l)) },
        };
      });
      setToast("已替换为选中的祝福语");
    },
    [panel, selectedId, update]
  );

  const onZoomCrop = useCallback(
    (z: number) => {
      setCropZoom(z);
      if (!selected || selected.type !== "image") return;
      const next = applyCrop(selected as ImageLayer, assets.images, z);
      onLayer(selected.id, { crop: next.crop });
    },
    [assets.images, onLayer, selected]
  );

  const openTemplate = (d: CardDoc) => {
    reset(d);
    setPanel("front");
    setSelectedId(null);
    setCropMode(false);
    setView("editor");
  };

  const goTemplates = () => {
    setView("templates");
    setSelectedId(null);
  };

  if (view === "home" || !doc) {
    return <Home templateCount={TEMPLATES.length} onStart={goTemplates} />;
  }

  if (view === "templates") {
    return <Gallery assets={assets} onPick={openTemplate} onHome={() => setView("home")} />;
  }

  if (view === "export") {
    return (
      <ExportView
        doc={doc}
        assets={assets}
        issues={issues}
        onEdit={() => setView("editor")}
        onPickIssue={(i) => {
          setPanel(i.panel);
          setSelectedId(i.layerId ?? null);
          setView("editor");
        }}
        onRestart={goTemplates}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="btn ghost" onClick={goTemplates}>
          ← 模板
        </button>
        <div className="doc-name">
          <strong>{doc.templateName}</strong>
          <span>A5 折卡 · 展开 297 × 210 mm</span>
        </div>
        <div className="spacer" />
        <button className="btn ghost" onClick={undo} disabled={!canUndo}>
          撤销
        </button>
        <button className="btn ghost" onClick={redo} disabled={!canRedo}>
          重做
        </button>
        <button className="btn primary" onClick={() => setView("export")}>
          预览与检查
        </button>
      </header>

      <main className="workspace">
        <div className="canvas-col">
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={panel === t.key ? "tab active" : "tab"}
                onClick={() => {
                  setPanel(t.key);
                  setSelectedId(null);
                }}
                title={t.hint}
              >
                {t.label}
              </button>
            ))}
          </div>

          <CardStage
            doc={doc}
            panel={panel}
            assets={assets}
            pxPerMm={scale}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={onMove}
          />

          <p className="canvas-note">蓝虚线是安全区（距裁切 8mm），红框是裁切线。拖动元素可改位置。</p>
        </div>

        <Inspector
          doc={doc}
          panel={panel}
          selected={selected}
          issues={issues}
          cropMode={cropMode}
          cropZoom={cropZoom}
          onToggleCrop={() => setCropMode((v) => !v)}
          onLayer={onLayer}
          onDelete={onDelete}
          onUpload={onUpload}
          onPickIssue={(i) => {
            setPanel(i.panel);
            setSelectedId(i.layerId ?? null);
          }}
          onInsertGreeting={onInsertGreeting}
          onZoomCrop={onZoomCrop}
        />
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
