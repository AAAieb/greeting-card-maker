import type {
  CardDoc,
  Layer,
  PanelKey,
  TextLayer,
} from "../types";
import {
  PANEL_H,
  PANEL_W,
  SAFE,
} from "../types";
import { FONT_STACKS } from "../data/templates";
import {
  frameOutsidePanel,
  photoDpi,
} from "./photoMath";

export type IssueLevel = "error" | "warn";

export interface Issue {
  key: string;
  level: IssueLevel;
  panel: PanelKey;
  layerId?: string;
  title: string;
  detail: string;
}

export const PANEL_LABEL: Record<
  PanelKey,
  string
> = {
  front: "Front",
  insideLeft: "Inside left",
  insideRight: "Inside right",
  back: "Back",
};

/** Maximum number of characters allowed in a text layer. */
export const MAX_CHARS = 200;

let context: CanvasRenderingContext2D | null = null;

function getMeasurementContext() {
  if (!context) {
    context = document
      .createElement("canvas")
      .getContext("2d");
  }

  return context!;
}

/**
 * Wrap text using the available width.
 * Returned measurements use the same unit as the font size.
 */
export function wrapText(
  text: string,
  font: string,
  size: number,
  weight: number,
  maxWidth: number
): string[] {
  const measurementContext =
    getMeasurementContext();

  measurementContext.font =
    `${weight >= 600 ? "bold " : ""}` +
    `${size}px ${font}`;

  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    if (!paragraph) {
      lines.push("");
      continue;
    }

    let line = "";

    for (const character of paragraph) {
      const nextLine = line + character;

      if (
        measurementContext.measureText(nextLine)
          .width > maxWidth &&
        line
      ) {
        if (
          /[，。、；：！？,.;:!?）】」』]/.test(
            character
          )
        ) {
          lines.push(
            line.trimEnd() + character
          );

          line = "";
        } else {
          lines.push(line.trimEnd());
          line = character;
        }
      } else {
        line = nextLine;
      }
    }

    lines.push(line.trimEnd());
  }

  return lines;
}

export function textHeight(layer: TextLayer) {
  const lines = wrapText(
    layer.text,
    FONT_STACKS[layer.font],
    layer.size,
    layer.weight,
    layer.w
  );

  return (
    Math.max(1, lines.length) *
    layer.size *
    layer.lineHeight
  );
}

function luminance(hex: string) {
  const value = hex
    .replace("#", "")
    .trim();

  const fullValue =
    value.length === 3
      ? value
          .split("")
          .map((character) => character + character)
          .join("")
      : value.slice(0, 6);

  const numericValue =
    parseInt(fullValue, 16);

  const channels = [
    (numericValue >> 16) & 255,
    (numericValue >> 8) & 255,
    numericValue & 255,
  ].map((channel) => {
    const normalised = channel / 255;

    return normalised <= 0.03928
      ? normalised / 12.92
      : Math.pow(
          (normalised + 0.055) / 1.055,
          2.4
        );
  });

  return (
    0.2126 * channels[0] +
    0.7152 * channels[1] +
    0.0722 * channels[2]
  );
}

function contrast(
  firstColour: string,
  secondColour: string
) {
  const firstLuminance =
    luminance(firstColour);

  const secondLuminance =
    luminance(secondColour);

  const highest = Math.max(
    firstLuminance,
    secondLuminance
  );

  const lowest = Math.min(
    firstLuminance,
    secondLuminance
  );

  return (
    (highest + 0.05) /
    (lowest + 0.05)
  );
}

const shorten = (
  text: string,
  maximumLength = 18
) => {
  const normalised = text
    .replace(/\s+/g, " ")
    .trim();

  return normalised.length > maximumLength
    ? normalised.slice(0, maximumLength) + "…"
    : normalised;
};

type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
};

function isOutside(
  box: Box,
  padding = 0
) {
  return (
    box.x < padding ||
    box.y < padding ||
    box.x + box.w >
      PANEL_W - padding ||
    box.y + box.h >
      PANEL_H - padding
  );
}

export function runChecks(
  doc: CardDoc
): Issue[] {
  const issues: Issue[] = [];

  const panels: PanelKey[] = [
    "front",
    "insideLeft",
    "insideRight",
    "back",
  ];

  for (const panel of panels) {
    const panelLabel =
      PANEL_LABEL[panel];

    for (
      const layer of doc.panels[
        panel
      ] as Layer[]
    ) {
      if (layer.type === "text") {
        const text = layer.text.trim();

        const box: Box = {
          x: layer.x,
          y: layer.y,
          w: layer.w,
          h: textHeight(layer),
        };

        if (!text) {
          issues.push({
            key: `${layer.id}-empty`,
            level: "error",
            panel,
            layerId: layer.id,
            title: "Empty text element",
            detail:
              `${panelLabel}: this text element is empty ` +
              "and will leave a blank area when printed.",
          });

          continue;
        }

        if (
          layer.text.length >
          MAX_CHARS
        ) {
          issues.push({
            key: `${layer.id}-long`,
            level: "error",
            panel,
            layerId: layer.id,
            title: "Text is too long",
            detail:
              `${panelLabel}: this element contains ` +
              `${layer.text.length} characters. ` +
              `The maximum is ${MAX_CHARS}. ` +
              "Shorten it or divide it into two sections.",
          });
        }

        if (isOutside(box)) {
          issues.push({
            key: `${layer.id}-out`,
            level: "error",
            panel,
            layerId: layer.id,
            title: "Text extends beyond the card",
            detail:
              `${panelLabel}: “${shorten(text)}” ` +
              "extends outside the card and will be cropped when exported.",
          });
        } else if (
          isOutside(box, SAFE)
        ) {
          issues.push({
            key: `${layer.id}-safe`,
            level: "warn",
            panel,
            layerId: layer.id,
            title: "Text is too close to the trim",
            detail:
              `${panelLabel}: “${shorten(text)}” ` +
              `is less than ${SAFE} mm from the edge and may be cut during printing.`,
          });
        } else if (
          panel === "insideLeft" &&
          box.x + box.w >
            PANEL_W - 6
        ) {
          issues.push({
            key: `${layer.id}-fold`,
            level: "warn",
            panel,
            layerId: layer.id,
            title: "Text is too close to the fold",
            detail:
              "Text on the inside-left panel is too close to the fold and may become difficult to read.",
          });
        }

        const contrastRatio = contrast(
          layer.color,
          doc.theme.bg
        );

        if (contrastRatio < 3) {
          issues.push({
            key: `${layer.id}-contrast`,
            level: "warn",
            panel,
            layerId: layer.id,
            title: "Low text contrast",
            detail:
              `“${shorten(text)}” has a contrast ratio of only ` +
              `${contrastRatio.toFixed(1)}:1 against the background. ` +
              "It may be difficult to read when printed.",
          });
        }
      }

      if (layer.type === "image") {
        if (!layer.src) {
          issues.push({
            key: `${layer.id}-none`,
            level: "warn",
            panel,
            layerId: layer.id,
            title: "Photo has not been added",
            detail:
              `${panelLabel} contains an empty photo frame. ` +
              "Upload a photo or remove the frame.",
          });
        } else {
          const dpi =
            photoDpi(layer);

          if (dpi > 0 && dpi < 150) {
            issues.push({
              key: `${layer.id}-blur`,
              level: "error",
              panel,
              layerId: layer.id,
              title: "Photo resolution is too low",
              detail:
                `At its current size, this photo will print at approximately ` +
                `${Math.round(dpi)} DPI and may look noticeably blurred. ` +
                "Use a larger image or reduce the size of the photo frame.",
            });
          } else if (
            dpi > 0 &&
            dpi < 300
          ) {
            issues.push({
              key: `${layer.id}-soft`,
              level: "warn",
              panel,
              layerId: layer.id,
              title: "Photo quality may be low",
              detail:
                `The current resolution is approximately ` +
                `${Math.round(dpi)} DPI. ` +
                "High-quality printing normally requires 300 DPI.",
            });
          }
        }

        if (
          frameOutsidePanel(layer)
        ) {
          issues.push({
            key: `${layer.id}-out`,
            level: "error",
            panel,
            layerId: layer.id,
            title: "Photo extends beyond the card",
            detail:
              `${panelLabel}: part of this photo frame is outside the card and will be cropped.`,
          });
        }
      }
    }
  }

  return issues;
}