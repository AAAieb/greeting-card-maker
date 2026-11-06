import { useEffect, useState } from "react";
import type { CardDoc, Occasion } from "../types";
import type { Assets } from "../lib/renderer";
import { renderPanelThumb } from "../lib/thumb";
import { TEMPLATES } from "../data/templates";
import { OCCASION_LABEL } from "../data/greetings";

interface Props {
  assets: Assets;
  onPick: (doc: CardDoc) => void;
  onHome: () => void;
}

const FILTERS: (Occasion | "all")[] = ["all", "birthday", "graduation", "teacher"];

export default function Gallery({ assets, onPick, onHome }: Props) {
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<Occasion | "all">("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      const next: Record<string, string> = {};
      for (const t of TEMPLATES) {
        next[t.id] = await renderPanelThumb(t.build(), "front", 300, { images: new Map() });
      }
      if (alive) setThumbs(next);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const list = TEMPLATES.filter((t) => filter === "all" || t.occasion === filter);

  return (
    <div className="templates-page">
      <header className="nav">
        <div className="nav-inner">
          <button className="brand" onClick={onHome}>
            <span className="brand-mark" aria-hidden />
            Campus Card
          </button>
          <div className="spacer" />
          <button className="btn ghost" onClick={onHome}>
            ← 首页
          </button>
        </div>
      </header>

      <main className="templates-body">
        <div className="templates-head">
          <h1>选一张模板</h1>
          <p className="lede">先挑一张接近你心意的，后面什么都能改——文字、颜色、照片。</p>
        </div>

        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={filter === f ? "chip active" : "chip"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? `全部 ${TEMPLATES.length}` : OCCASION_LABEL[f]}
            </button>
          ))}
        </div>

        <div className="grid">
          {list.map((t) => (
            <button key={t.id} className="tile" onClick={() => onPick(t.build())}>
              <div className="thumb">
                {thumbs[t.id] ? <img src={thumbs[t.id]} alt={t.name} /> : <div className="thumb-skeleton" />}
              </div>
              <div className="tile-meta">
                <span className="tile-name">{t.name}</span>
                <span className="tile-blurb">{t.blurb}</span>
              </div>
            </button>
          ))}
        </div>

        <p className="templates-foot">
          模板会持续补充。这一版包含 {TEMPLATES.length} 张，覆盖生日、毕业和感谢老师三个场合。
        </p>
      </main>
    </div>
  );
}
