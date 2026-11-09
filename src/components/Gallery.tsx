import { useEffect, useState } from "react";
import type { CardDoc, Occasion } from "../types";
import type { Assets } from "../lib/renderer";
import { renderPanelThumb } from "../lib/thumb";
import { TEMPLATES } from "../data/templates";

interface Props {
  assets: Assets;
  onPick: (doc: CardDoc) => void;
  onHome: () => void;
}

type Filter = Occasion | "all";

const FILTERS: Filter[] = [
  "all",
  "birthday",
  "graduation",
  "teacher",
];

const FILTER_LABELS: Record<Filter, string> = {
  all: "All templates",
  birthday: "Birthday",
  graduation: "Graduation",
  teacher: "Thank a teacher",
  society: "Societies & events",
};

const TEMPLATE_COPY: Record<
  Occasion,
  Array<{
    name: string;
    blurb: string;
    style: string;
  }>
> = {
  birthday: [
    {
      name: "Colour Pop",
      blurb: "Bright, joyful and perfect for a cheerful birthday message.",
      style: "Playful",
    },
    {
      name: "Midnight Wish",
      blurb: "A sophisticated dark design for a memorable celebration.",
      style: "Elegant",
    },
  ],
  graduation: [
    {
      name: "The Next Chapter",
      blurb: "A timeless card for celebrating a proud academic milestone.",
      style: "Classic",
    },
    {
      name: "Campus Memories",
      blurb: "A photo-led design made for friends and shared memories.",
      style: "Photo",
    },
  ],
    teacher: [
    {
      name: "With Gratitude",
      blurb: "A warm and thoughtful way to thank an inspiring teacher.",
      style: "Minimal",
    },
    {
      name: "Thank You for Your Patience",
      blurb: "A personal note of appreciation with an editorial feel.",
      style: "Editorial",
    },
  ],
  society: [
    {
      name: "A Moment Together",
      blurb: "A lively design for society events and shared achievements.",
      style: "Social",
    },
    {
      name: "Celebrate the Team",
      blurb: "A bold card for recognising a memorable group experience.",
      style: "Modern",
    },
  ],
};

function getTemplateCopy(templateId: string, occasion: Occasion) {
  const templatesInOccasion = TEMPLATES.filter(
    (template) => template.occasion === occasion
  );

  const position = templatesInOccasion.findIndex(
    (template) => template.id === templateId
  );

  return (
    TEMPLATE_COPY[occasion][position] ?? {
      name: "Campus Card",
      blurb: "A thoughtful card for a meaningful campus moment.",
      style: "Original",
    }
  );
}

export default function Gallery({ onPick, onHome }: Props) {
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let isActive = true;

    async function createThumbnails() {
      const nextThumbs: Record<string, string> = {};

      for (const template of TEMPLATES) {
        nextThumbs[template.id] = await renderPanelThumb(
          template.build(),
          "front",
          300,
          { images: new Map() }
        );
      }

      if (isActive) {
        setThumbs(nextThumbs);
      }
    }

    createThumbnails();

    return () => {
      isActive = false;
    };
  }, []);

  const visibleTemplates = TEMPLATES.filter(
    (template) => filter === "all" || template.occasion === filter
  );

  return (
    <div className="gallery-page">
      <header className="gallery-nav">
        <div className="gallery-nav-inner">
          <button
            className="gallery-brand"
            type="button"
            onClick={onHome}
            aria-label="Return to the Campus Card home page"
          >
            <span className="gallery-brand-mark" aria-hidden="true">
              C
            </span>
            <span>Campus Card</span>
          </button>

          <button
            className="gallery-home-button"
            type="button"
            onClick={onHome}
          >
            <span aria-hidden="true">←</span>
            Back home
          </button>
        </div>
      </header>

      <main className="gallery-main">
        <section className="gallery-heading">
          <div>
            <p className="gallery-kicker">
              <span aria-hidden="true" />
              The template collection
            </p>

            <h1>
              Find a design for
              <br />
              <em>your moment.</em>
            </h1>
          </div>

          <p className="gallery-introduction">
            Start with a design that feels right. Every word, colour and photo
            can be personalised in the editor.
          </p>
        </section>

        <section className="gallery-toolbar" aria-label="Template filters">
          <div className="gallery-filters">
            {FILTERS.map((item) => {
              const count =
                item === "all"
                  ? TEMPLATES.length
                  : TEMPLATES.filter(
                      (template) => template.occasion === item
                    ).length;

              return (
                <button
                  key={item}
                  className={
                    filter === item
                      ? "gallery-filter active"
                      : "gallery-filter"
                  }
                  type="button"
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {FILTER_LABELS[item]}
                  <span>{count}</span>
                </button>
              );
            })}
          </div>

          <p className="gallery-result-count">
            Showing {visibleTemplates.length}{" "}
            {visibleTemplates.length === 1 ? "design" : "designs"}
          </p>
        </section>

        <section className="gallery-grid" aria-live="polite">
          {visibleTemplates.map((template) => {
            const copy = getTemplateCopy(
              template.id,
              template.occasion
            );

            return (
              <article className="gallery-card" key={template.id}>
                <button
                  className="gallery-card-button"
                  type="button"
                  onClick={() => onPick(template.build())}
                  aria-label={`Use the ${copy.name} template`}
                >
                  <div className="gallery-thumbnail">
                    {thumbs[template.id] ? (
                      <img
                        src={thumbs[template.id]}
                        alt={`${copy.name} greeting card template`}
                      />
                    ) : (
                      <div
                        className="gallery-thumbnail-loading"
                        aria-label="Loading template preview"
                      />
                    )}

                    <span className="gallery-style-label">
                      {copy.style}
                    </span>

                    <span className="gallery-use-label">
                      Use this template
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>

                  <div className="gallery-card-copy">
                    <div>
                      <span className="gallery-occasion">
                        {FILTER_LABELS[template.occasion]}
                      </span>

                      <h2>{copy.name}</h2>
                    </div>

                    <p>{copy.blurb}</p>
                  </div>
                </button>
              </article>
            );
          })}
        </section>

        <section className="gallery-help">
          <div>
            <p className="gallery-kicker">
              <span aria-hidden="true" />
              Not sure where to begin?
            </p>

            <h2>Choose the feeling first. You can change everything else.</h2>
          </div>

          <p>
            Pick the closest occasion and start editing. Templates are only a
            starting point — your message is what makes the card personal.
          </p>
        </section>
      </main>

      <footer className="gallery-footer">
        <div className="gallery-footer-brand">
          <span className="gallery-brand-mark" aria-hidden="true">
            C
          </span>
          <strong>Campus Card</strong>
        </div>

        <p>{TEMPLATES.length} original templates for university life.</p>
        <p>Student project · 2026</p>
      </footer>
    </div>
  );
}