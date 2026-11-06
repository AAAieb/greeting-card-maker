import { useEffect, useState } from "react";
import type { CardDoc, PanelKey } from "../types";
import { PANEL_LABEL } from "../lib/checks";
import type { Issue } from "../lib/checks";
import type { Assets } from "../lib/renderer";
import { renderPanelThumb } from "../lib/thumb";

interface Props {
  doc: CardDoc;
  assets: Assets;
  issues: Issue[];
  onEdit: () => void;
  onPickIssue: (i: Issue) => void;
  onRestart: () => void;
}

const ORDER: PanelKey[] = ["front", "insideLeft", "insideRight", "back"];

export default function ExportView({ doc, assets, issues, onEdit, onPickIssue, onRestart }: Props) {
  const [thumbs, setThumbs] = useState<Partial<Record<PanelKey, string>>>({});
  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");

  useEffect(() => {
    let alive = true;
    (async () => {
      const next: Partial<Record<PanelKey, string>> = {};
      for (const p of ORDER) {
        next[p] = await renderPanelThumb(doc, p, 420, assets);
      }
      if (alive) setThumbs(next);
    })();
    return () => {
      alive = false;
    };
  }, [doc, assets]);

  return (
    <div className="export-page">
      <header className="nav">
        <div className="nav-inner">
          <button className="brand" onClick={onRestart}>
            <span className="brand-mark" aria-hidden />
            Campus Card
          </button>
          <div className="spacer" />
          <button className="btn ghost" onClick={onEdit}>
            ← 继续编辑
          </button>
        </div>
      </header>

      <main className="export-body">
        <div className="export-head">
          <h1>检查与预览</h1>
          <p className="lede">
            这是折起来之后的样子：正面、两页内页、背面。确认没问题，就可以进入导出环节。
          </p>
        </div>

        <div className="export-grid">
          {ORDER.map((p) => (
            <figure key={p} className="export-card">
              <div className="thumb">
                {thumbs[p] ? <img src={thumbs[p]} alt={PANEL_LABEL[p]} /> : <div className="thumb-skeleton" />}
              </div>
              <figcaption>{PANEL_LABEL[p]}</figcaption>
            </figure>
          ))}
        </div>

        <section className="export-checks">
          <h2>
            检查结果{" "}
            {issues.length === 0 ? (
              <span className="ok">全部通过</span>
            ) : (
              <span className="count">
                {errors.length} 个必须处理 · {warns.length} 个提醒
              </span>
            )}
          </h2>
          {issues.length === 0 ? (
            <p className="hint">文字都在安全区内，照片够清晰，可以往下走了。</p>
          ) : (
            <ul className="issues wide">
              {issues.map((i) => (
                <li key={i.key} className={i.level}>
                  <button onClick={() => onPickIssue(i)}>
                    <strong>{i.title}</strong>
                    <span className="where">{PANEL_LABEL[i.panel]}</span>
                    <span className="detail">{i.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="export-actions">
          <div className="next-up">
            <strong>下一步：导出</strong>
            <p>
              PDF 与图片导出不在这一个版本里。结构已经留好——这一页之后会接上
              「导出可打印 PDF」和「导出 PNG」两个按钮。
            </p>
          </div>
          <div className="row">
            <button className="btn" onClick={onEdit}>
              回去改一改
            </button>
            <button className="btn ghost" onClick={onRestart}>
              换一张模板
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
