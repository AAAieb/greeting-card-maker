interface Props {
  onStart: () => void;
  templateCount: number;
}

const FEATURES = [
  {
    number: "01",
    icon: "✦",
    title: "Made for campus moments",
    body: "Thoughtful designs for birthdays, graduations and the teachers who made a difference.",
  },
  {
    number: "02",
    icon: "Aa",
    title: "Personal in every detail",
    body: "Make every card your own with a message, beautiful type, colour and a favourite photo.",
  },
  {
    number: "03",
    icon: "□",
    title: "Designed to print beautifully",
    body: "Print-aware layouts, safe areas and live previews help every card come out as intended.",
  },
];

const STEPS = [
  {
    number: "01",
    label: "Choose",
    title: "Pick a template",
    body: "Start with a design that fits the person and the moment.",
  },
  {
    number: "02",
    label: "Create",
    title: "Make it personal",
    body: "Add your own words, colours and a favourite photograph.",
  },
  {
    number: "03",
    label: "Share",
    title: "Preview and export",
    body: "Check every detail, then prepare your card to print or share.",
  },
];

export default function Home({ onStart, templateCount }: Props) {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <button
            className="landing-brand"
            type="button"
            onClick={onStart}
            aria-label="Browse card templates"
          >
            <span className="landing-brand-mark" aria-hidden="true">
              C
            </span>
            <span>Campus Card</span>
          </button>

          <nav className="landing-links" aria-label="Main navigation">
            <a href="#moments">Moments</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </nav>

          <button
            className="landing-nav-button"
            type="button"
            onClick={onStart}
          >
            Create a card
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-kicker">
              <span aria-hidden="true" />
              A card-making studio for university life
            </p>

            <h1>
              Turn a campus moment into something{" "}
              <em>worth keeping.</em>
            </h1>

            <p className="landing-intro">
              Create a thoughtful greeting card in minutes. Choose a
              campus-inspired template, write your message and add a favourite
              photo — no design experience needed.
            </p>

            <div className="landing-actions">
              <button
                className="landing-primary-button"
                type="button"
                onClick={onStart}
              >
                Start creating
                <span aria-hidden="true">→</span>
              </button>

              <a className="landing-text-link" href="#how-it-works">
                See how it works
              </a>
            </div>

            <ul className="landing-benefits">
              <li>No account required</li>
              <li>{templateCount} original templates</li>
              <li>Print-aware layouts</li>
            </ul>
          </div>

          <div
            className="landing-card-scene"
            aria-label="Examples of campus greeting cards"
          >
            <div
              className="landing-decoration decoration-one"
              aria-hidden="true"
            />
            <div
              className="landing-decoration decoration-two"
              aria-hidden="true"
            />

            <article className="sample-card sample-card-graduation">
              <span className="sample-card-category">Graduation</span>
              <span className="sample-card-symbol" aria-hidden="true">
                ✦
              </span>
              <div>
                <h2>Here’s to your next chapter.</h2>
                <p>Class of 2026</p>
              </div>
            </article>

            <article className="sample-card sample-card-birthday">
              <span className="sample-card-category">Birthday</span>

              <div className="sample-photo" aria-hidden="true">
                <span>
                  Your
                  <br />
                  photo
                </span>
              </div>

              <div>
                <h2>
                  Another year,
                  <br />
                  another adventure.
                </h2>
                <p>Make it a good one.</p>
              </div>
            </article>

            <article className="sample-card sample-card-thanks">
              <span className="sample-card-category">Thank you</span>
              <span className="sample-card-symbol flower" aria-hidden="true">
                ✿
              </span>
              <div>
                <h2>For helping me grow.</h2>
                <p>With gratitude</p>
              </div>
            </article>

            <div className="template-count-badge">
              <strong>{templateCount}</strong>
              <span>
                original
                <br />
                templates
              </span>
            </div>
          </div>
        </section>

        <section className="landing-moments" id="moments">
          <p>Made for the moments that shape university life</p>

          <div className="moment-list">
            <span>Birthdays</span>
            <i aria-hidden="true">•</i>
            <span>Graduations</span>
            <i aria-hidden="true">•</i>
            <span>Teacher thanks</span>
            <i aria-hidden="true">•</i>
            <span>Friendships</span>
          </div>
        </section>

        <section className="landing-features" id="features">
          <div className="landing-section-heading">
            <p className="landing-kicker">
              <span aria-hidden="true" />
              Thoughtful by design
            </p>

            <h2>
              Simple to make.
              <br />
              <em>Meaningful to receive.</em>
            </h2>
          </div>

          <div className="landing-feature-grid">
            {FEATURES.map((feature) => (
              <article className="landing-feature-card" key={feature.number}>
                <span className="feature-number">{feature.number}</span>

                <div className="feature-icon" aria-hidden="true">
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-how" id="how-it-works">
          <div className="landing-how-intro">
            <p className="landing-kicker">
              <span aria-hidden="true" />
              How it works
            </p>

            <h2>
              From blank page to personal card in three easy steps.
            </h2>

            <button
              className="landing-light-button"
              type="button"
              onClick={onStart}
            >
              Browse templates
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <ol className="landing-step-list">
            {STEPS.map((step) => (
              <li key={step.number}>
                <span className="step-number">{step.number}</span>

                <div>
                  <small>{step.label}</small>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="landing-final-callout">
          <p className="landing-kicker">
            <span aria-hidden="true" />
            Your words, beautifully presented
          </p>

          <h2>Some moments deserve more than a message.</h2>

          <button
            className="landing-light-button"
            type="button"
            onClick={onStart}
          >
            Create your card
            <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <span className="landing-brand-mark" aria-hidden="true">
            C
          </span>
          <strong>Campus Card</strong>
        </div>

        <p>Made for meaningful moments on campus.</p>
        <p>Student project · 2026</p>
      </footer>
    </div>
  );
}