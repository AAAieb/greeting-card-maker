import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CardDoc,
  ImageLayer,
  Layer,
  PanelKey,
  TextLayer,
} from "./types";
import { PANEL_H, PANEL_W } from "./types";
import Home from "./components/Home";
import Gallery from "./components/Gallery";
import CardStage from "./components/CardStage";
import Inspector from "./components/Inspector";
import ExportView from "./components/ExportView";
import { runChecks } from "./lib/checks";
import { TEMPLATES } from "./data/templates";
import {
  applyCrop,
  panCrop,
  readImageFile,
  useAssets,
  useDocHistory,
} from "./state";

type View = "home" | "templates" | "editor" | "export";

const TABS: {
  key: PanelKey;
  label: string;
  hint: string;
}[] = [
  {
    key: "front",
    label: "Front",
    hint: "The cover shown when the card is folded",
  },
  {
    key: "insideLeft",
    label: "Inside left",
    hint: "The left panel inside the open card",
  },
  {
    key: "insideRight",
    label: "Inside right",
    hint: "The right panel inside the open card",
  },
  {
    key: "back",
    label: "Back",
    hint: "The back cover of the card",
  },
];

export default function App() {
  const {
    doc,
    update,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    version,
  } = useDocHistory(null);

  const [view, setView] = useState<View>("home");
  const [panel, setPanel] = useState<PanelKey>("front");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [scale, setScale] = useState(2.7);

  const assets = useAssets(doc);

  const issues = useMemo(
    () => (doc ? runChecks(doc) : []),
    [doc, version]
  );

  useEffect(() => {
    const calculateScale = () => {
      const windowWidth = window.innerWidth;
      const isNarrow = windowWidth < 980;

      const availableWidth = isNarrow
        ? windowWidth - 44
        : windowWidth - 372 - 70;

      const scaleByWidth = availableWidth / PANEL_W;

      const scaleByHeight =
        (window.innerHeight - (isNarrow ? 150 : 210)) / PANEL_H;

      const maximumScale = isNarrow ? 2.6 : 2.9;

      setScale(
        Math.max(
          1.1,
          Math.min(
            maximumScale,
            scaleByWidth,
            isNarrow ? maximumScale : scaleByHeight
          )
        )
      );
    };

    calculateScale();

    window.addEventListener("resize", calculateScale);

    return () => {
      window.removeEventListener("resize", calculateScale);
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 3400);

    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  const selected: Layer | null = useMemo(() => {
    if (!doc || !selectedId) {
      return null;
    }

    return (
      doc.panels[panel].find(
        (layer) => layer.id === selectedId
      ) ?? null
    );
  }, [doc, panel, selectedId]);

  const onLayer = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      update(
        (currentDoc) => ({
          ...currentDoc,
          panels: {
            ...currentDoc.panels,
            [panel]: currentDoc.panels[panel].map((layer) =>
              layer.id === id
                ? ({ ...layer, ...patch } as Layer)
                : layer
            ),
          },
        }),
        true
      );
    },
    [panel, update]
  );

  const onMove = useCallback(
    (id: string, x: number, y: number) => {
      update((currentDoc) => {
        const layer = currentDoc.panels[panel].find(
          (item) => item.id === id
        );

        if (!layer) {
          return currentDoc;
        }

        let nextLayer: Layer = {
          ...layer,
          x,
          y,
        };

        if (
          cropMode &&
          layer.type === "image" &&
          layer.crop &&
          layer.naturalW
        ) {
          const moved = panCrop(
            layer as ImageLayer,
            x - layer.x,
            y - layer.y,
            layer.naturalW,
            layer.naturalH ?? 0
          );

          nextLayer = {
            ...(layer as ImageLayer),
            crop: moved.crop,
            x: layer.x,
            y: layer.y,
          };
        }

        return {
          ...currentDoc,
          panels: {
            ...currentDoc.panels,
            [panel]: currentDoc.panels[panel].map((item) =>
              item.id === id ? nextLayer : item
            ),
          },
        };
      });
    },
    [cropMode, panel, update]
  );

  const onDelete = useCallback(
    (id: string) => {
      update((currentDoc) => ({
        ...currentDoc,
        panels: {
          ...currentDoc.panels,
          [panel]: currentDoc.panels[panel].filter(
            (layer) => layer.id !== id
          ),
        },
      }));

      setSelectedId(null);
    },
    [panel, update]
  );

  const onUpload = useCallback(
    async (file: File) => {
      if (!selected || selected.type !== "image") {
        setToast(
          "Select a photo frame on the canvas before uploading."
        );
        return;
      }

      try {
        const { src, w, h } = await readImageFile(file);

        onLayer(selected.id, {
          src,
          naturalW: w,
          naturalH: h,
          crop: undefined,
        });

        setCropZoom(1);

        setToast(
          "Photo added. Drag or zoom to adjust the crop."
        );
      } catch (error) {
        setToast((error as Error).message);
      }
    },
    [onLayer, selected]
  );

  const onInsertGreeting = useCallback(
    (text: string) => {
      update((currentDoc) => {
        const layers = currentDoc.panels[panel];

        const target =
          (layers.find(
            (layer) =>
              layer.id === selectedId &&
              layer.type === "text"
          ) as TextLayer | undefined) ??
          (layers.find(
            (layer) => layer.type === "text"
          ) as TextLayer | undefined);

        if (!target) {
          return currentDoc;
        }

        return {
          ...currentDoc,
          panels: {
            ...currentDoc.panels,
            [panel]: layers.map((layer) =>
              layer.id === target.id
                ? { ...layer, text }
                : layer
            ),
          },
        };
      });

      setToast("The selected message has been added.");
    },
    [panel, selectedId, update]
  );

  const onZoomCrop = useCallback(
    (zoom: number) => {
      setCropZoom(zoom);

      if (!selected || selected.type !== "image") {
        return;
      }

      const next = applyCrop(
        selected as ImageLayer,
        assets.images,
        zoom
      );

      onLayer(selected.id, {
        crop: next.crop,
      });
    },
    [assets.images, onLayer, selected]
  );

  const openTemplate = (template: CardDoc) => {
    reset(template);
    setPanel("front");
    setSelectedId(null);
    setCropMode(false);
    setView("editor");
  };

  const goToTemplates = () => {
    setView("templates");
    setSelectedId(null);
  };

  /*
   * The template page does not require an active document.
   * This condition must stay before the home / !doc condition.
   */
  if (view === "templates") {
    return (
      <Gallery
        assets={assets}
        onPick={openTemplate}
        onHome={() => setView("home")}
      />
    );
  }

  if (view === "home" || !doc) {
    return (
      <Home
        templateCount={TEMPLATES.length}
        onStart={goToTemplates}
      />
    );
  }

  if (view === "export") {
    return (
      <ExportView
        doc={doc}
        assets={assets}
        issues={issues}
        onEdit={() => setView("editor")}
        onPickIssue={(issue) => {
          setPanel(issue.panel);
          setSelectedId(issue.layerId ?? null);
          setView("editor");
        }}
        onRestart={goToTemplates}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <button
          className="btn ghost"
          type="button"
          onClick={goToTemplates}
        >
          ← Templates
        </button>

        <div className="doc-name">
          <strong>{doc.templateName}</strong>
          <span>A5 folded card · 297 × 210 mm</span>
        </div>

        <div className="spacer" />

        <button
          className="btn ghost"
          type="button"
          onClick={undo}
          disabled={!canUndo}
        >
          Undo
        </button>

        <button
          className="btn ghost"
          type="button"
          onClick={redo}
          disabled={!canRedo}
        >
          Redo
        </button>

        <button
          className="btn primary"
          type="button"
          onClick={() => setView("export")}
        >
          Preview &amp; check
        </button>
      </header>

      <main className="workspace">
        <div className="canvas-col">
          <div className="tabs" aria-label="Card panels">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={
                  panel === tab.key
                    ? "tab active"
                    : "tab"
                }
                type="button"
                onClick={() => {
                  setPanel(tab.key);
                  setSelectedId(null);
                }}
                title={tab.hint}
              >
                {tab.label}
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

          <p className="canvas-note">
            The blue dashed line marks the safe area,
            8 mm from the trim. Drag an element to reposition it.
          </p>
        </div>

        <Inspector
          doc={doc}
          panel={panel}
          selected={selected}
          issues={issues}
          cropMode={cropMode}
          cropZoom={cropZoom}
          onToggleCrop={() => {
            setCropMode((current) => !current);
          }}
          onLayer={onLayer}
          onDelete={onDelete}
          onUpload={onUpload}
          onPickIssue={(issue) => {
            setPanel(issue.panel);
            setSelectedId(issue.layerId ?? null);
          }}
          onInsertGreeting={onInsertGreeting}
          onZoomCrop={onZoomCrop}
        />
      </main>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}