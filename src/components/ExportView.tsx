import {
  useEffect,
  useState,
} from "react";
import type {
  CardDoc,
  PanelKey,
} from "../types";
import { PANEL_LABEL } from "../lib/checks";
import type { Issue } from "../lib/checks";
import type { Assets } from "../lib/renderer";
import { renderPanelThumb } from "../lib/thumb";

interface Props {
  doc: CardDoc;
  assets: Assets;
  issues: Issue[];
  onEdit: () => void;
  onPickIssue: (issue: Issue) => void;
  onRestart: () => void;
}

const ORDER: PanelKey[] = [
  "front",
  "insideLeft",
  "insideRight",
  "back",
];

export default function ExportView({
  doc,
  assets,
  issues,
  onEdit,
  onPickIssue,
  onRestart,
}: Props) {
  const [thumbnails, setThumbnails] =
    useState<
      Partial<Record<PanelKey, string>>
    >({});

  const errors = issues.filter(
    (issue) => issue.level === "error"
  );

  const warnings = issues.filter(
    (issue) => issue.level === "warn"
  );

  useEffect(() => {
    let isActive = true;

    async function createThumbnails() {
      const nextThumbnails: Partial<
        Record<PanelKey, string>
      > = {};

      for (const panel of ORDER) {
        nextThumbnails[panel] =
          await renderPanelThumb(
            doc,
            panel,
            420,
            assets
          );
      }

      if (isActive) {
        setThumbnails(nextThumbnails);
      }
    }

    createThumbnails();

    return () => {
      isActive = false;
    };
  }, [doc, assets]);

  const hasPassed = issues.length === 0;

  return (
    <div className="refined-export-page">
      <header className="refined-export-nav">
        <div className="refined-export-nav-inner">
          <button
            className="refined-export-brand"
            type="button"
            onClick={onRestart}
            aria-label="Return to template collection"
          >
            <span
              className="refined-export-brand-mark"
              aria-hidden="true"
            >
              C
            </span>

            <span>Campus Card</span>
          </button>

          <button
            className="refined-export-back"
            type="button"
            onClick={onEdit}
          >
            <span aria-hidden="true">←</span>
            Continue editing
          </button>
        </div>
      </header>

      <main className="refined-export-main">
        <section className="refined-export-heading">
          <div>
            <p className="refined-export-kicker">
              <span aria-hidden="true" />
              Final review
            </p>

            <h1>
              Ready to make it
              <br />
              <em>something real?</em>
            </h1>
          </div>

          <div className="refined-export-summary">
            <p>
              Review the front, inside pages and back of
              your folded card before preparing it to
              print or share.
            </p>

            <div
              className={
                hasPassed
                  ? "refined-status passed"
                  : "refined-status attention"
              }
            >
              <span aria-hidden="true">
                {hasPassed ? "✓" : "!"}
              </span>

              <div>
                <strong>
                  {hasPassed
                    ? "Ready to continue"
                    : "Needs attention"}
                </strong>

                <small>
                  {hasPassed
                    ? "All quality checks passed"
                    : `${errors.length} ${
                        errors.length === 1
                          ? "issue"
                          : "issues"
                      } and ${warnings.length} ${
                        warnings.length === 1
                          ? "warning"
                          : "warnings"
                      }`}
                </small>
              </div>
            </div>
          </div>
        </section>

        <section
          className="refined-preview-section"
          aria-labelledby="preview-title"
        >
          <div className="refined-section-title">
            <div>
              <span>01</span>
              <h2 id="preview-title">
                Your complete card
              </h2>
            </div>

            <p>{doc.templateName}</p>
          </div>

          <div className="refined-preview-grid">
            {ORDER.map((panel) => (
              <figure
                key={panel}
                className="refined-preview-card"
              >
                <div className="refined-preview-image">
                  {thumbnails[panel] ? (
                    <img
                      src={thumbnails[panel]}
                      alt={`${PANEL_LABEL[panel]} preview`}
                    />
                  ) : (
                    <div
                      className="refined-preview-loading"
                      aria-label={`Loading ${PANEL_LABEL[panel]} preview`}
                    />
                  )}
                </div>

                <figcaption>
                  <span>{PANEL_LABEL[panel]}</span>
                  <small>
                    {panel === "front"
                      ? "Folded cover"
                      : panel === "back"
                        ? "Back cover"
                        : "Inside panel"}
                  </small>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section
          className="refined-check-section"
          aria-labelledby="checks-title"
        >
          <div className="refined-section-title">
            <div>
              <span>02</span>
              <h2 id="checks-title">
                Quality check
              </h2>
            </div>

            <p>
              {hasPassed
                ? "Everything looks good"
                : "Select an item to fix it"}
            </p>
          </div>

          {hasPassed ? (
            <div className="refined-passed-card">
              <span
                className="refined-passed-icon"
                aria-hidden="true"
              >
                ✓
              </span>

              <div>
                <h3>Your card is ready</h3>

                <p>
                  Text is inside the safe area, images are
                  clear enough for printing and no empty
                  elements were found.
                </p>
              </div>
            </div>
          ) : (
            <ul className="issues wide refined-issues">
              {issues.map((issue) => (
                <li
                  key={issue.key}
                  className={issue.level}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onPickIssue(issue)
                    }
                  >
                    <strong>{issue.title}</strong>

                    <span className="where">
                      {PANEL_LABEL[issue.panel]}
                    </span>

                    <span className="detail">
                      {issue.detail}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="refined-export-actions">
          <div className="refined-actions-copy">
            <p className="refined-export-kicker">
              <span aria-hidden="true" />
              Next step
            </p>

            <h2>Prepare your card to share.</h2>

            <p>
              Print-ready PDF and shareable image export
              will be connected in the next development
              milestone.
            </p>
          </div>

          <div className="refined-export-options">
            <div className="refined-export-option">
              <span aria-hidden="true">PDF</span>

              <div>
                <strong>Print-ready PDF</strong>
                <small>Prepared for A5 folded printing</small>
              </div>

              <em>Coming next</em>
            </div>

            <div className="refined-export-option">
              <span aria-hidden="true">PNG</span>

              <div>
                <strong>Shareable images</strong>
                <small>One image for each card panel</small>
              </div>

              <em>Coming next</em>
            </div>
          </div>

          <div className="refined-action-buttons">
            <button
              className="refined-primary-action"
              type="button"
              onClick={onEdit}
            >
              Continue editing
              <span aria-hidden="true">→</span>
            </button>

            <button
              className="refined-secondary-action"
              type="button"
              onClick={onRestart}
            >
              Choose another template
            </button>
          </div>
        </section>
      </main>

      <footer className="refined-export-footer">
        <div>
          <span
            className="refined-export-brand-mark"
            aria-hidden="true"
          >
            C
          </span>

          <strong>Campus Card</strong>
        </div>

        <p>
          Made for meaningful moments on campus.
        </p>

        <p>Student project · 2026</p>
      </footer>
    </div>
  );
}