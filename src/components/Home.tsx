interface Props {
  onStart: () => void;
  templateCount: number;
}

const FEATURES = [
  {
    title: "校园里的场合",
    body: "毕业、生日、给老师写一张。模板是照这些场合做的，不是年终大促那种通用贺卡。",
  },
  {
    title: "排得准，印得出",
    body: "版面按毫米算，有安全区和折线。你的字不会跑到裁切线外面，也不会被折痕压住。",
  },
  {
    title: "五分钟能做完",
    body: "选模板、改三行字、放一张照片。不用会设计软件，也不用注册账号。",
  },
];

const STEPS = [
  { n: "01", t: "挑一张模板", d: "生日、毕业、感谢老师，每类两张。" },
  { n: "02", t: "改成你自己的话", d: "收件人、标题、祝福语，字体字号颜色都能调。" },
  { n: "03", t: "放一张照片", d: "拖动取景、缩放，照片不会被拉变形。" },
];

export default function Home({ onStart, templateCount }: Props) {
  return (
    <div className="home">
      <header className="nav">
        <div className="nav-inner">
          <button className="brand" onClick={onStart}>
            <span className="brand-mark" aria-hidden />
            Campus Card
          </button>
          <nav className="nav-links">
            <button onClick={onStart}>模板</button>
            <a href="#how">怎么用</a>
          </nav>
          <button className="btn primary" onClick={onStart}>
            开始制作
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">校园贺卡编辑器 · {templateCount} 张模板</p>
          <h1>
            写一张，
            <br />
            他会留着的贺卡。
          </h1>
          <p className="lede">
            给室友、给同学、给写推荐信的老师。选一张模板，改成你自己的话，放一张照片，
            预览满意就好——剩下的交给打印机。
          </p>
          <div className="hero-actions">
            <button className="btn primary large" onClick={onStart}>
              开始制作
            </button>
            <a className="btn ghost large" href="#how">
              看看怎么做
            </a>
          </div>
        </div>
        <div className="hero-cards" aria-hidden>
          <div className="mini mini-1">
            <span>毕业快乐</span>
          </div>
          <div className="mini mini-2">
            <span>生日快乐</span>
          </div>
          <div className="mini mini-3">
            <span>谢谢您</span>
          </div>
        </div>
      </section>

      <section className="features">
        {FEATURES.map((f) => (
          <article key={f.title} className="feature">
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </section>

      <section className="how" id="how">
        <h2>三步做完</h2>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="step-n">{s.n}</span>
              <strong>{s.t}</strong>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
        <button className="btn primary" onClick={onStart}>
          选一张模板
        </button>
      </section>

      <footer className="footer">
        <div>
          <strong>Campus Greeting Card Maker</strong>
          <p>课程项目 · 校园场景贺卡编辑器</p>
        </div>
        <p className="footnote">
          模板与文字由本项目自制，仅用于教学演示。照片版权归上传者所有。
        </p>
      </footer>
    </div>
  );
}
