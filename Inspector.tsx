import { useMemo, useRef, useState } from "react";
import type { CardDoc, ImageLayer, Layer, PanelKey, TextLayer } from "../types";
import type { Issue } from "../lib/checks";
import { MAX_CHARS, PANEL_LABEL } from "../lib/checks";
import { FONT_LABELS } from "../data/templates";
import { OCCASION_LABEL, RELATION_LABEL, TONE_LABEL, suggest } from "../data/greetings";
import type { Relation, Tone } from "../data/greetings";
import { photoSummary, removePhotoPatch } from "../lib/photoActions";

interface Props {
  doc: CardDoc;
  panel: PanelKey;
  selected: Layer | null;
  issues: Issue[];
  cropZoom: number;
  onLayer: (id: string, patch: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onUpload: (file: File) => void;
  onPickIssue: (issue: Issue) => void;
  onInsertGreeting: (text: string) => void;
  onZoomCrop: (zoom: number) => void;
  onResetCrop: () => void;
}

export default function Inspector(props: Props) {
  const { doc, selected, issues } = props;

  const [relation, setRelation] = useState<Relation>("friend");
  const [tone, setTone] = useState<Tone>("warm");
  const [showGreetings, setShowGreetings] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);

  const errors = issues.filter((issue) => issue.level === "error");
  const warnings = issues.filter((issue) => issue.level === "warn");

  const suggestions = useMemo(
    () => suggest(doc.occasion, relation, tone),
    [doc.occasion, relation, tone]
  );

  const text = selected?.type === "text" ? (selected as TextLayer) : null;
  const photo = selected?.type === "image" ? (selected as ImageLayer) : null;
  const photoInfo = photo ? photoSummary(photo) : null;

  return (
    <aside className="inspector">
      <section className="panel">
        <h3>{text ? "Text" : photo ? "Photo" : "Selection"}</h3>

        {!selected && (
          <p className="hint">
            Click a piece of text or a photo on the card to edit it. Drag text to
            reposition it; drag a photo to change what part of it shows.
          </p>
        )}

        {text && (
          <div key={text.id} className="stack">
            <label className="field">
              <span>
                Content
                <em
                  className={
                    text.text.length > MAX_CHARS ? "counter over" : "counter"
                  }
                >
                  {text.text.length}/{MAX_CHARS}
                </em>
              </span>
              <textarea
                rows={4}
                autoFocus
                value={text.text}
                onChange={(event) =>
                  props.onLayer(text.id, { text: event.target.value })
                }
              />
            </label>

            {!text.text.trim() && (
              <p className="warn-inline">
                This block is empty — it will print as a blank space.
              </p>
            )}

            <div className="row">
              <label className="field grow">
                <span>Typeface</span>
                <select
                  value={text.font}
                  onChange={(event) =>
                    props.onLayer(text.id, { font: event.target.value })
                  }
                >
                  {Object.entries(FONT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field color-field">
                <span>Colour</span>
                <input
                  type="color"
                  value={text.color}
                  onChange={(event) =>
                    props.onLayer(text.id, { color: event.target.value })
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>Size {text.size.toFixed(1)} mm</span>
              <input
                type="range"
                min={2}
                max={24}
                step={0.2}
                value={text.size}
                onChange={(event) =>
                  props.onLayer(text.id, { size: Number(event.target.value) })
                }
              />
            </label>

            <label className="field">
              <span>Line height {text.lineHeight.toFixed(2)}</span>
              <input
                type="range"
                min={1}
                max={2.6}
                step={0.05}
                value={text.lineHeight}
                onChange={(event) =>
                  props.onLayer(text.id, {
                    lineHeight: Number(event.target.value),
                  })
                }
              />
            </label>

            <div className="row seg-row">
              {(["left", "center", "right"] as const).map((alignment) => (
                <button
                  key={alignment}
                  type="button"
                  className={text.align === alignment ? "seg active" : "seg"}
                  onClick={() => props.onLayer(text.id, { align: alignment })}
                  title={
                    alignment === "left"
                      ? "Align left"
                      : alignment === "center"
                        ? "Centre"
                        : "Align right"
                  }
                >
                  {alignment === "left" ? "L" : alignment === "center" ? "C" : "R"}
                </button>
              ))}

              <button
                type="button"
                className={text.weight >= 600 ? "seg active" : "seg"}
                onClick={() =>
                  props.onLayer(text.id, {
                    weight: text.weight >= 600 ? 400 : 700,
                  })
                }
                title="Bold"
              >
                B
              </button>
            </div>
          </div>
        )}

        {photo && (
          <div key={photo.id} className="stack">
            {photoInfo && !photoInfo.placeholder && (
              <div className={`photo-meta ${photoInfo.quality}`}>
                <span>
                  {photoInfo.width} × {photoInfo.height} px
                </span>
                <span>≈ {photoInfo.dpi} DPI</span>
                <span>
                  {photoInfo.quality === "good"
                    ? "Sharp"
                    : photoInfo.quality === "soft"
                      ? "Soft"
                      : "Too low"}
                </span>
              </div>
            )}

            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  props.onUpload(file);
                }
                event.target.value = "";
              }}
            />

            {photoInfo?.placeholder ? (
              <button
                type="button"
                className="upload-drop"
                onClick={() => fileInput.current?.click()}
              >
                <span className="upload-icon" aria-hidden>
                  ＋
                </span>
                <strong>Upload a photo</strong>
                <em>JPG, PNG or WebP · up to 8 MB</em>
              </button>
            ) : (
              <>
                <label className="field">
                  <span>Zoom {props.cropZoom.toFixed(2)}×</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={props.cropZoom}
                    onChange={(event) =>
                      props.onZoomCrop(Number(event.target.value))
                    }
                  />
                </label>

                <p className="hint">
                  Drag the photo on the card to reframe it. The image is never
                  stretched.
                </p>

                <div className="row">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => fileInput.current?.click()}
                  >
                    Replace
                  </button>
                  <button type="button" className="btn" onClick={props.onResetCrop}>
                    Reset
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => props.onLayer(photo.id, removePhotoPatch())}
                  >
                    Remove
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {selected && (
          <button
            type="button"
            className="btn danger block"
            onClick={() => props.onDelete(selected.id)}
          >
            Delete this element
          </button>
        )}
      </section>

      <section className="panel">
        <h3>
          Message ideas
          <span className="soft">{OCCASION_LABEL[doc.occasion]}</span>
        </h3>

        <button
          type="button"
          className="btn block"
          onClick={() => setShowGreetings((value) => !value)}
        >
          {showGreetings ? "Hide suggestions" : "Browse suggested messages"}
        </button>

        {showGreetings && (
          <div className="greet">
            <div className="row">
              <label className="field grow">
                <span>Relationship</span>
                <select
                  value={relation}
                  onChange={(event) =>
                    setRelation(event.target.value as Relation)
                  }
                >
                  {Object.entries(RELATION_LABEL).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field grow">
                <span>Tone</span>
                <select
                  value={tone}
                  onChange={(event) => setTone(event.target.value as Tone)}
                >
                  {Object.entries(TONE_LABEL).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {suggestions.map((greeting) => (
              <button
                key={greeting.en}
                type="button"
                className="suggestion"
                onClick={() => {
                  props.onInsertGreeting(greeting.en);
                  setShowGreetings(false);
                }}
              >
                <strong>{greeting.en}</strong>
                <em>{greeting.cn}</em>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h3>
          Checks
          {errors.length + warnings.length === 0 ? (
            <span className="ok">All clear</span>
          ) : (
            <span className="count">
              {errors.length} to fix · {warnings.length} to review
            </span>
          )}
        </h3>

        {issues.length === 0 && <p className="hint">Nothing to flag.</p>}

        <ul className="issues">
          {issues.map((issue) => (
            <li key={issue.key} className={issue.level}>
              <button type="button" onClick={() => props.onPickIssue(issue)}>
                <strong>{issue.title}</strong>
                <span className="where">{PANEL_LABEL[issue.panel]}</span>
              </button>
            </li>
          ))}
        </ul>

        {issues.length > 0 && (
          <p className="hint">Select one to jump straight to it.</p>
        )}
      </section>
    </aside>
  );
}
