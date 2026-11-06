import { useMemo, useState } from "react";
import type { CardDoc, ImageLayer, Layer, PanelKey, TextLayer } from "../types";
import type { Issue } from "../lib/checks";
import { MAX_CHARS, PANEL_LABEL } from "../lib/checks";
import { FONT_LABELS } from "../data/templates";
import { OCCASION_LABEL, RELATION_LABEL, TONE_LABEL, suggest } from "../data/greetings";
import type { Relation, Tone } from "../data/greetings";
import { photoSummary, removePhotoPatch, resetCropPatch } from "../lib/photoActions";

interface Props {
  doc: CardDoc;
  panel: PanelKey;
  selected: Layer | null;
  issues: Issue[];
  cropMode: boolean;
  cropZoom: number;
  onToggleCrop: () => void;
  onLayer: (id: string, patch: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onUpload: (file: File) => void;
  onPickIssue: (i: Issue) => void;
  onInsertGreeting: (text: string) => void;
  onZoomCrop: (zoom: number) => void;
}

export default function Inspector(p: Props) {
  const { doc, selected, issues } = p;
  const [relation, setRelation] = useState<Relation>("friend");
  const [tone, setTone] = useState<Tone>("warm");
  const [showGreet, setShowGreet] = useState(false);

  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");

  const suggestions = useMemo(() => suggest(doc.occasion, relation, tone), [doc.occasion, relation, tone]);

  return (
    <aside className="inspector">
      <section className="panel">
        <h3>当前元素</h3>
        {!selected && (
          <p className="hint">点画布上的文字或照片来编辑。按住拖动可以改位置。</p>
        )}

        {selected && selected.type === "text" && (
          <>
            <label className="field">
              <span>
                文字
                <em className={(selected as TextLayer).text.length > MAX_CHARS ? "counter over" : "counter"}>
                  {(selected as TextLayer).text.length}/{MAX_CHARS}
                </em>
              </span>
              <textarea
                rows={4}
                value={(selected as TextLayer).text}
                onChange={(e) => p.onLayer(selected.id, { text: e.target.value })}
              />
            </label>
            {!(selected as TextLayer).text.trim() && (
              <p className="warn-inline">这段是空的，打印出来会是一块空白。</p>
            )}
            <div className="row">
              <label className="field grow">
                <span>字体</span>
                <select
                  value={(selected as TextLayer).font}
                  onChange={(e) => p.onLayer(selected.id, { font: e.target.value })}
                >
                  {Object.entries(FONT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>颜色</span>
                <input
                  type="color"
                  value={(selected as TextLayer).color}
                  onChange={(e) => p.onLayer(selected.id, { color: e.target.value })}
                />
              </label>
            </div>
            <label className="field">
              <span>字号 {(selected as TextLayer).size.toFixed(1)} mm</span>
              <input
                type="range"
                min={2}
                max={24}
                step={0.2}
                value={(selected as TextLayer).size}
                onChange={(e) => p.onLayer(selected.id, { size: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>行高 {(selected as TextLayer).lineHeight.toFixed(2)}</span>
              <input
                type="range"
                min={1}
                max={2.6}
                step={0.05}
                value={(selected as TextLayer).lineHeight}
                onChange={(e) => p.onLayer(selected.id, { lineHeight: Number(e.target.value) })}
              />
            </label>
            <div className="row">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  className={(selected as TextLayer).align === a ? "seg active" : "seg"}
                  onClick={() => p.onLayer(selected.id, { align: a })}
                >
                  {a === "left" ? "左" : a === "center" ? "中" : "右"}
                </button>
              ))}
              <button
                className={(selected as TextLayer).weight >= 600 ? "seg active" : "seg"}
                onClick={() =>
                  p.onLayer(selected.id, { weight: (selected as TextLayer).weight >= 600 ? 400 : 700 })
                }
              >
                粗
              </button>
            </div>
          </>
        )}

        {selected && selected.type === "image" && (
          <>
            <PhotoMeta layer={selected as ImageLayer} />

            <label className="field">
              <span>{(selected as ImageLayer).src ? "更换照片" : "上传照片"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) p.onUpload(f);
                  e.target.value = "";
                }}
              />
            </label>

            {(selected as ImageLayer).src ? (
              <>
                <button className={p.cropMode ? "btn primary" : "btn"} onClick={p.onToggleCrop}>
                  {p.cropMode ? "完成裁剪" : "调整取景"}
                </button>
                {p.cropMode && (
                  <label className="field" style={{ marginTop: 12 }}>
                    <span>缩放 {p.cropZoom.toFixed(2)}×</span>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.01}
                      value={p.cropZoom}
                      onChange={(e) => p.onZoomCrop(Number(e.target.value))}
                    />
                  </label>
                )}
                <div className="row" style={{ marginTop: 10 }}>
                  <button
                    className="btn"
                    onClick={() => p.onLayer(selected.id, resetCropPatch(selected as ImageLayer))}
                  >
                    复位取景
                  </button>
                  <button className="btn" onClick={() => p.onLayer(selected.id, removePhotoPatch())}>
                    移除照片
                  </button>
                </div>
                <p className="hint">
                  {p.cropMode
                    ? "在画布上拖动照片调整取景，滑块缩放。完成后点“完成裁剪”。"
                    : "照片始终按原始比例显示，不会被拉伸。支持 JPG / PNG / WebP，8MB 以内。"}
                </p>
              </>
            ) : (
              <p className="hint">
                点上面的选择按钮上传照片。支持 JPG / PNG / WebP，8MB 以内，长边至少 320px。
              </p>
            )}
          </>
        )}

        {selected && (
          <button className="btn danger" onClick={() => p.onDelete(selected.id)}>
            删除这个元素
          </button>
        )}
      </section>

      <section className="panel">
        <h3>祝福语</h3>
        <button className="btn" onClick={() => setShowGreet((v) => !v)}>
          {showGreet ? "收起" : "从语库里选一句（中英对照）"}
        </button>
        {showGreet && (
          <div className="greet">
            <div className="row">
              <label className="field grow">
                <span>关系</span>
                <select value={relation} onChange={(e) => setRelation(e.target.value as Relation)}>
                  {Object.entries(RELATION_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field grow">
                <span>语气</span>
                <select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
                  {Object.entries(TONE_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="hint">场合：{OCCASION_LABEL[doc.occasion]}（跟随模板）</p>
            {suggestions.map((g) => (
              <button
                key={g.cn}
                className="suggestion"
                onClick={() => {
                  p.onInsertGreeting(g.cn);
                  setShowGreet(false);
                }}
              >
                <strong>{g.cn}</strong>
                <em>{g.en}</em>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h3>
          检查{" "}
          {errors.length + warns.length === 0 ? (
            <span className="ok">通过</span>
          ) : (
            <span className="count">
              {errors.length} 个问题 · {warns.length} 个提醒
            </span>
          )}
        </h3>
        {issues.length === 0 && <p className="hint">没有发现问题。</p>}
        <ul className="issues">
          {issues.map((i) => (
            <li key={i.key} className={i.level}>
              <button onClick={() => p.onPickIssue(i)}>
                <strong>{i.title}</strong>
                <span className="where">{PANEL_LABEL[i.panel]}</span>
                <span className="detail">{i.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function PhotoMeta({ layer }: { layer: ImageLayer }) {
  const s = photoSummary(layer);
  if (s.placeholder) {
    return <p className="hint">这个照片框还是空的。</p>;
  }
  return (
    <div className={`photo-meta ${s.quality}`}>
      <span>
        {s.width} × {s.height} px
      </span>
      <span>约 {s.dpi} DPI</span>
      <span>{s.quality === "good" ? "够清楚" : s.quality === "soft" ? "略低" : "太低"}</span>
    </div>
  );
}
