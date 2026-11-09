import { useMemo, useState } from "react";
import type {
  CardDoc,
  ImageLayer,
  Layer,
  PanelKey,
  TextLayer,
} from "../types";
import type { Issue } from "../lib/checks";
import { MAX_CHARS } from "../lib/checks";
import { suggest } from "../data/greetings";
import type {
  Relation,
  Tone,
} from "../data/greetings";
import {
  photoSummary,
  removePhotoPatch,
  resetCropPatch,
} from "../lib/photoActions";

interface Props {
  doc: CardDoc;
  panel: PanelKey;
  selected: Layer | null;
  issues: Issue[];
  cropMode: boolean;
  cropZoom: number;
  onToggleCrop: () => void;
  onLayer: (
    id: string,
    patch: Record<string, unknown>
  ) => void;
  onDelete: (id: string) => void;
  onUpload: (file: File) => void;
  onPickIssue: (issue: Issue) => void;
  onInsertGreeting: (text: string) => void;
  onZoomCrop: (zoom: number) => void;
}

const FONT_LABELS_EN: Record<string, string> = {
  "sans-cn": "Modern Sans",
  "serif-cn": "Classic Serif",
  kai: "Handwritten Kai",
  "latin-serif": "Editorial Serif",
  "latin-sans": "Clean Sans",
};

const PANEL_LABEL_EN: Record<PanelKey, string> = {
  front: "Front",
  insideLeft: "Inside left",
  insideRight: "Inside right",
  back: "Back",
};

const OCCASION_LABEL_EN = {
  birthday: "Birthday",
  graduation: "Graduation",
  teacher: "Thank a teacher",
  society: "Society & events",
};

const RELATION_LABEL_EN: Record<Relation, string> = {
  friend: "Friend",
  classmate: "Classmate",
  teacher: "Teacher",
  member: "Society member",
};

const TONE_LABEL_EN: Record<Tone, string> = {
  warm: "Warm",
  funny: "Playful",
  formal: "Formal",
  friendly: "Friendly",
};

export default function Inspector(props: Props) {
  const {
    doc,
    selected,
    issues,
  } = props;

  const [relation, setRelation] =
    useState<Relation>("friend");

  const [tone, setTone] =
    useState<Tone>("warm");

  const [showGreetings, setShowGreetings] =
    useState(false);

  const errors = issues.filter(
    (issue) => issue.level === "error"
  );

  const warnings = issues.filter(
    (issue) => issue.level === "warn"
  );

  const suggestions = useMemo(
    () => suggest(doc.occasion, relation, tone),
    [doc.occasion, relation, tone]
  );

  return (
    <aside className="inspector">
      <section className="panel">
        <h3>Selected element</h3>

        {!selected && (
          <p className="hint">
            Select a text or photo element on the card to edit it.
            Drag an element on the canvas to reposition it.
          </p>
        )}

        {selected && selected.type === "text" && (
          <>
            <label className="field">
              <span>
                Text

                <em
                  className={
                    (selected as TextLayer).text.length >
                    MAX_CHARS
                      ? "counter over"
                      : "counter"
                  }
                >
                  {(selected as TextLayer).text.length}/
                  {MAX_CHARS}
                </em>
              </span>

              <textarea
                rows={4}
                value={(selected as TextLayer).text}
                onChange={(event) =>
                  props.onLayer(selected.id, {
                    text: event.target.value,
                  })
                }
              />
            </label>

            {!(selected as TextLayer).text.trim() && (
              <p className="warn-inline">
                This text is empty and will leave a blank
                area when printed.
              </p>
            )}

            <div className="row">
              <label className="field grow">
                <span>Font</span>

                <select
                  value={(selected as TextLayer).font}
                  onChange={(event) =>
                    props.onLayer(selected.id, {
                      font: event.target.value,
                    })
                  }
                >
                  {Object.entries(FONT_LABELS_EN).map(
                    ([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="field">
                <span>Colour</span>

                <input
                  type="color"
                  value={(selected as TextLayer).color}
                  onChange={(event) =>
                    props.onLayer(selected.id, {
                      color: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>
                Font size{" "}
                {(selected as TextLayer).size.toFixed(1)} mm
              </span>

              <input
                type="range"
                min={2}
                max={24}
                step={0.2}
                value={(selected as TextLayer).size}
                onChange={(event) =>
                  props.onLayer(selected.id, {
                    size: Number(event.target.value),
                  })
                }
              />
            </label>

            <label className="field">
              <span>
                Line height{" "}
                {(selected as TextLayer).lineHeight.toFixed(2)}
              </span>

              <input
                type="range"
                min={1}
                max={2.6}
                step={0.05}
                value={(selected as TextLayer).lineHeight}
                onChange={(event) =>
                  props.onLayer(selected.id, {
                    lineHeight: Number(
                      event.target.value
                    ),
                  })
                }
              />
            </label>

            <div
              className="row"
              aria-label="Text formatting"
            >
              {(
                ["left", "center", "right"] as const
              ).map((alignment) => (
                <button
                  key={alignment}
                  className={
                    (selected as TextLayer).align ===
                    alignment
                      ? "seg active"
                      : "seg"
                  }
                  type="button"
                  onClick={() =>
                    props.onLayer(selected.id, {
                      align: alignment,
                    })
                  }
                >
                  {alignment === "left"
                    ? "Left"
                    : alignment === "center"
                      ? "Centre"
                      : "Right"}
                </button>
              ))}

              <button
                className={
                  (selected as TextLayer).weight >= 600
                    ? "seg active"
                    : "seg"
                }
                type="button"
                onClick={() =>
                  props.onLayer(selected.id, {
                    weight:
                      (selected as TextLayer).weight >= 600
                        ? 400
                        : 700,
                  })
                }
              >
                Bold
              </button>
            </div>
          </>
        )}

        {selected && selected.type === "image" && (
          <>
            <PhotoMeta
              layer={selected as ImageLayer}
            />

            <label className="field">
              <span>
                {(selected as ImageLayer).src
                  ? "Replace photo"
                  : "Upload photo"}
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0];

                  if (file) {
                    props.onUpload(file);
                  }

                  event.target.value = "";
                }}
              />
            </label>

            {(selected as ImageLayer).src ? (
              <>
                <button
                  className={
                    props.cropMode
                      ? "btn primary"
                      : "btn"
                  }
                  type="button"
                  onClick={props.onToggleCrop}
                >
                  {props.cropMode
                    ? "Finish cropping"
                    : "Adjust crop"}
                </button>

                {props.cropMode && (
                  <label
                    className="field"
                    style={{ marginTop: 12 }}
                  >
                    <span>
                      Zoom {props.cropZoom.toFixed(2)}×
                    </span>

                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.01}
                      value={props.cropZoom}
                      onChange={(event) =>
                        props.onZoomCrop(
                          Number(event.target.value)
                        )
                      }
                    />
                  </label>
                )}

                <div
                  className="row"
                  style={{ marginTop: 10 }}
                >
                  <button
                    className="btn"
                    type="button"
                    onClick={() =>
                      props.onLayer(
                        selected.id,
                        resetCropPatch(
                          selected as ImageLayer
                        )
                      )
                    }
                  >
                    Reset crop
                  </button>

                  <button
                    className="btn"
                    type="button"
                    onClick={() =>
                      props.onLayer(
                        selected.id,
                        removePhotoPatch()
                      )
                    }
                  >
                    Remove photo
                  </button>
                </div>

                <p className="hint">
                  {props.cropMode
                    ? "Drag the photo on the canvas to reposition it. Use the slider to zoom, then select Finish cropping."
                    : "Photos keep their original proportions and are never stretched. JPG, PNG and WebP files up to 8 MB are supported."}
                </p>
              </>
            ) : (
              <p className="hint">
                Use the file selector above to upload a photo.
                JPG, PNG and WebP files up to 8 MB are
                supported. The longest edge must be at least
                320 px.
              </p>
            )}
          </>
        )}

        {selected && (
          <button
            className="btn danger"
            type="button"
            onClick={() =>
              props.onDelete(selected.id)
            }
          >
            Delete this element
          </button>
        )}
      </section>

      <section className="panel">
        <h3>Message suggestions</h3>

        <button
          className="btn"
          type="button"
          onClick={() =>
            setShowGreetings((current) => !current)
          }
        >
          {showGreetings
            ? "Hide suggestions"
            : "Choose a suggested message"}
        </button>

        {showGreetings && (
          <div className="greet">
            <div className="row">
              <label className="field grow">
                <span>Recipient</span>

                <select
                  value={relation}
                  onChange={(event) =>
                    setRelation(
                      event.target.value as Relation
                    )
                  }
                >
                  {Object.entries(
                    RELATION_LABEL_EN
                  ).map(([key, label]) => (
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
                  onChange={(event) =>
                    setTone(
                      event.target.value as Tone
                    )
                  }
                >
                  {Object.entries(
                    TONE_LABEL_EN
                  ).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="hint">
              Occasion:{" "}
              {OCCASION_LABEL_EN[doc.occasion]}
            </p>

            {suggestions.map((greeting) => (
              <button
                key={greeting.en}
                className="suggestion"
                type="button"
                onClick={() => {
                  props.onInsertGreeting(greeting.en);
                  setShowGreetings(false);
                }}
              >
                <strong>{greeting.en}</strong>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h3>
          Quality check{" "}

          {errors.length + warnings.length === 0 ? (
            <span className="ok">Passed</span>
          ) : (
            <span className="count">
              {errors.length}{" "}
              {errors.length === 1
                ? "issue"
                : "issues"}{" "}
              · {warnings.length}{" "}
              {warnings.length === 1
                ? "warning"
                : "warnings"}
            </span>
          )}
        </h3>

        {issues.length === 0 && (
          <p className="hint">
            No problems found.
          </p>
        )}

        <ul className="issues">
          {issues.map((issue) => (
            <li
              key={issue.key}
              className={issue.level}
            >
              <button
                type="button"
                onClick={() =>
                  props.onPickIssue(issue)
                }
              >
                <strong>{issue.title}</strong>

                <span className="where">
                  {PANEL_LABEL_EN[issue.panel]}
                </span>

                <span className="detail">
                  {issue.detail}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function PhotoMeta({
  layer,
}: {
  layer: ImageLayer;
}) {
  const summary = photoSummary(layer);

  if (summary.placeholder) {
    return (
      <p className="hint">
        This photo frame is currently empty.
      </p>
    );
  }

  return (
    <div
      className={`photo-meta ${summary.quality}`}
    >
      <span>
        {summary.width} × {summary.height} px
      </span>

      <span>
        Approximately {summary.dpi} DPI
      </span>

      <span>
        {summary.quality === "good"
          ? "Good quality"
          : summary.quality === "soft"
            ? "Slightly low"
            : "Too low"}
      </span>
    </div>
  );
}