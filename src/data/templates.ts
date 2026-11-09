import type {
  CardDoc,
  Layer,
  Occasion,
  TextLayer,
} from "../types";

export const FONT_STACKS: Record<string, string> = {
  "sans-cn":
    '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Noto Sans SC", system-ui, sans-serif',
  "serif-cn":
    '"Songti SC", "SimSun", "Noto Serif SC", "Source Han Serif SC", Georgia, serif',
  kai:
    '"Kaiti SC", "KaiTi", "STKaiti", "Noto Serif SC", serif',
  "latin-serif":
    'Georgia, "Times New Roman", "Songti SC", serif',
  "latin-sans":
    '"Helvetica Neue", Arial, "Microsoft YaHei", sans-serif',
};

export const FONT_LABELS: Record<string, string> = {
  "sans-cn": "Modern Sans",
  "serif-cn": "Classic Serif",
  kai: "Handwritten",
  "latin-serif": "Editorial Serif",
  "latin-sans": "Clean Sans",
};

/* ---------- Layer helpers ---------- */

let sequence = 0;

export const lid = (prefix: string) =>
  `${prefix}_${(++sequence).toString(36)}`;

export function text(
  id: string,
  x: number,
  y: number,
  value: string,
  options: Partial<TextLayer> = {}
): TextLayer {
  return {
    id,
    type: "text",
    name: options.name ?? "Text",
    x,
    y,
    text: value,
    w: options.w ?? 120,
    size: options.size ?? 5,
    font: options.font ?? "sans-cn",
    weight: options.weight ?? 400,
    color: options.color ?? "#1b1b1b",
    align: options.align ?? "center",
    lineHeight: options.lineHeight ?? 1.35,
    letterSpacing: options.letterSpacing ?? 0,
  };
}

export const rect = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string | undefined,
  extra: Record<string, unknown> = {}
): Layer =>
  ({
    id,
    type: "shape",
    name: "Rectangle",
    shape: "rect",
    x,
    y,
    w: width,
    h: height,
    fill,
    ...extra,
  }) as Layer;

export const circle = (
  id: string,
  x: number,
  y: number,
  diameter: number,
  fill: string | undefined,
  extra: Record<string, unknown> = {}
): Layer =>
  ({
    id,
    type: "shape",
    name: "Circle",
    shape: "circle",
    x,
    y,
    w: diameter,
    h: diameter,
    fill,
    ...extra,
  }) as Layer;

export const line = (
  id: string,
  x: number,
  y: number,
  x2: number,
  y2: number,
  stroke: string,
  width = 0.4
): Layer =>
  ({
    id,
    type: "shape",
    name: "Line",
    shape: "line",
    x,
    y,
    w: Math.abs(x2 - x),
    h: Math.abs(y2 - y),
    points: [x, y, x2, y2],
    stroke,
    strokeWidth: width,
  }) as Layer;

export const poly = (
  id: string,
  points: number[],
  fill: string
): Layer =>
  ({
    id,
    type: "shape",
    name: "Graphic",
    shape: "polygon",
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    points,
    fill,
  }) as Layer;

const empty = (): Layer[] => [];

/* ---------- Document helper ---------- */

function doc(
  templateId: string,
  templateName: string,
  occasion: Occasion,
  theme: CardDoc["theme"],
  panels: CardDoc["panels"],
  meta: CardDoc["meta"] = {
    recipient: "Emma",
    sender: "Alex",
  }
): CardDoc {
  return {
    templateId,
    templateName,
    occasion,
    theme,
    panels,
    qr: {
      url: "",
      enabled: false,
    },
    meta,
  };
}

/* ---------- Shared colours ---------- */

const CORAL = "#FF6B5A";
const DARK_CORAL = "#9D352D";
const GOLD = "#C7A24A";
const INK = "#221F26";

/* ---------- Templates ---------- */

export const TEMPLATES = [
  {
    id: "birthday-01",
    name: "Birthday · Colour Pop",
    occasion: "birthday" as Occasion,
    blurb:
      "A bright and joyful design for a cheerful birthday message.",

    build: () =>
      doc(
        "birthday-01",
        "Birthday · Colour Pop",
        "birthday",
        {
          bg: "#FFF6F1",
          ink: INK,
          accent: CORAL,
          muted: "#6F5F58",
        },
        {
          front: [
            rect(
              "b1band",
              0,
              150,
              148.5,
              60,
              CORAL
            ),

            circle(
              "b1dot",
              104,
              22,
              46,
              "#FFD166"
            ),

            circle(
              "b1dot2",
              126,
              60,
              12,
              "#FFD166"
            ),

            text(
              "b1rcpt",
              14,
              44,
              "TO EMMA",
              {
                w: 120,
                size: 4.2,
                font: "latin-sans",
                color: "#6F5F58",
                align: "left",
                letterSpacing: 0.6,
              }
            ),

            text(
              "b1title",
              14,
              62,
              "Happy\nBirthday",
              {
                w: 120,
                size: 16,
                font: "latin-serif",
                weight: 700,
                color: DARK_CORAL,
                align: "left",
                lineHeight: 1.05,
              }
            ),

            text(
              "b1title2",
              14,
              104,
              "MAKE A WISH",
              {
                w: 120,
                size: 3.4,
                font: "latin-sans",
                color: INK,
                align: "left",
                letterSpacing: 0.9,
              }
            ),

            text(
              "b1msg",
              14,
              116,
              "May everything you wished for arrive early this year.",
              {
                w: 112,
                size: 4.3,
                color: INK,
                align: "left",
                lineHeight: 1.55,
              }
            ),

            text(
              "b1sign",
              14,
              178,
              "ALEX · NOV 2026",
              {
                w: 112,
                size: 3.8,
                font: "latin-sans",
                weight: 700,
                color: INK,
                align: "left",
                letterSpacing: 0.5,
              }
            ),
          ],

          insideLeft: [
            text(
              "b1in",
              18,
              30,
              "A NOTE FOR YOU",
              {
                w: 112,
                size: 3.5,
                font: "latin-sans",
                color: "#6F5F58",
                align: "left",
                letterSpacing: 0.7,
              }
            ),

            text(
              "b1in2",
              18,
              42,
              "Meeting you is one of the best things university gave me.\n\nHere is to another year of small joys, big plans and much more sleep.",
              {
                w: 112,
                size: 4.7,
                font: "latin-serif",
                color: INK,
                align: "left",
                lineHeight: 1.75,
              }
            ),
          ],

          insideRight: empty(),

          back: [
            text(
              "b1b",
              18,
              170,
              "CAMPUS CARD STUDIO",
              {
                w: 112,
                size: 3.4,
                font: "latin-sans",
                color: "#6F5F58",
                align: "left",
                letterSpacing: 0.6,
              }
            ),
          ],
        }
      ),
  },

  {
    id: "birthday-02",
    name: "Birthday · Midnight Wish",
    occasion: "birthday" as Occasion,
    blurb:
      "A sophisticated dark design for a memorable celebration.",

    build: () =>
      doc(
        "birthday-02",
        "Birthday · Midnight Wish",
        "birthday",
        {
          bg: "#1D1A22",
          ink: "#F6F0E8",
          accent: "#E8C36A",
          muted: "#AAA0B2",
        },
        {
          front: [
            circle(
              "b2c",
              40,
              24,
              3,
              "#E8C36A"
            ),

            circle(
              "b2c2",
              100,
              40,
              2,
              "#E8C36A"
            ),

            circle(
              "b2c3",
              118,
              18,
              1.6,
              "#AAA0B2"
            ),

            text(
              "b2title",
              22,
              66,
              "Happy\nBirthday",
              {
                w: 104,
                size: 17,
                font: "latin-serif",
                color: "#F6F0E8",
                align: "left",
                lineHeight: 1.15,
              }
            ),

            line(
              "b2line",
              22,
              118,
              60,
              118,
              "#E8C36A",
              0.5
            ),

            text(
              "b2msg",
              22,
              126,
              "One year older.\nStill curious about tomorrow.",
              {
                w: 100,
                size: 4.6,
                font: "latin-serif",
                color: "#DED6E2",
                align: "left",
                lineHeight: 1.9,
              }
            ),

            text(
              "b2sign",
              22,
              176,
              "— ALEX",
              {
                w: 100,
                size: 4,
                font: "latin-sans",
                color: "#E8C36A",
                align: "left",
                letterSpacing: 0.7,
              }
            ),
          ],

          insideLeft: [
            text(
              "b2in",
              20,
              32,
              "TO EMMA",
              {
                w: 110,
                size: 3.6,
                font: "latin-sans",
                color: "#AAA0B2",
                align: "left",
                letterSpacing: 0.8,
              }
            ),

            text(
              "b2in2",
              20,
              44,
              "If this year offered only one wish,\nI would choose more ordinary days spent laughing with you.",
              {
                w: 108,
                size: 4.8,
                font: "latin-serif",
                color: "#F2ECF4",
                align: "left",
                lineHeight: 2,
              }
            ),
          ],

          insideRight: empty(),

          back: [
            text(
              "b2b",
              20,
              180,
              "CAMPUS CARD STUDIO",
              {
                w: 108,
                size: 3,
                font: "latin-sans",
                color: "#AAA0B2",
                align: "left",
                letterSpacing: 0.8,
              }
            ),
          ],
        }
      ),
  },

  {
    id: "graduation-01",
    name: "Graduation · The Next Chapter",
    occasion: "graduation" as Occasion,
    blurb:
      "A timeless design for celebrating an academic milestone.",

    build: () =>
      doc(
        "graduation-01",
        "Graduation · The Next Chapter",
        "graduation",
        {
          bg: "#F5F1E8",
          ink: "#23201D",
          accent: GOLD,
          muted: "#746B5D",
        },
        {
          front: [
            poly(
              "g1cap",
              [
                50, 44,
                74.25, 34,
                98.5, 44,
                74.25, 54,
              ],
              "#2E2A33"
            ),

            poly(
              "g1cap2",
              [
                63, 49,
                85.5, 49,
                85.5, 60,
                63, 60,
              ],
              "#2E2A33"
            ),

            line(
              "g1tassel",
              98.5,
              44,
              98.5,
              58,
              GOLD,
              0.5
            ),

            circle(
              "g1knot",
              97.5,
              58,
              2,
              GOLD
            ),

            text(
              "g1rcpt",
              0,
              66,
              "FOR EMMA",
              {
                w: 148.5,
                size: 3.8,
                font: "latin-sans",
                color: "#746B5D",
                letterSpacing: 0.7,
              }
            ),

            text(
              "g1title",
              0,
              78,
              "You Did It",
              {
                w: 148.5,
                size: 17,
                font: "latin-serif",
                weight: 700,
                color: "#23201D",
              }
            ),

            text(
              "g1sub",
              0,
              101,
              "CONGRATULATIONS ON YOUR GRADUATION",
              {
                w: 148.5,
                size: 2.6,
                font: "latin-sans",
                color: "#806517",
                letterSpacing: 0.8,
              }
            ),

            line(
              "g1rule",
              54,
              109,
              94.5,
              109,
              GOLD,
              0.4
            ),

            text(
              "g1msg",
              24,
              118,
              "May your bags be light\nand your future full of promise.",
              {
                w: 100,
                size: 5,
                font: "latin-serif",
                color: "#3A342C",
                lineHeight: 1.9,
              }
            ),

            text(
              "g1sign",
              24,
              172,
              "ALEX · JUNE 2026",
              {
                w: 100,
                size: 3.8,
                font: "latin-sans",
                color: "#746B5D",
                align: "left",
              }
            ),
          ],

          insideLeft: [
            text(
              "g1in",
              20,
              26,
              "FOUR YEARS, ONE CHAPTER",
              {
                w: 110,
                size: 3.4,
                font: "latin-sans",
                color: "#746B5D",
                align: "left",
                letterSpacing: 0.5,
              }
            ),

            line(
              "g1in2",
              20,
              34,
              50,
              34,
              GOLD,
              0.3
            ),

            text(
              "g1in3",
              20,
              42,
              "I remember our first lecture,\nthe window seat in the library,\nand who cried first at our final dinner.\n\nMay the next city bring you people worth remembering too.",
              {
                w: 108,
                size: 4.3,
                font: "latin-serif",
                color: "#3A342C",
                align: "left",
                lineHeight: 1.9,
              }
            ),
          ],

          insideRight: empty(),

          back: [
            circle(
              "g1seal",
              62,
              150,
              24,
              undefined,
              {
                stroke: GOLD,
                strokeWidth: 0.4,
              }
            ),

            text(
              "g1sealT",
              62,
              158,
              "2026",
              {
                w: 24,
                size: 5,
                font: "latin-serif",
                color: "#806517",
              }
            ),

            text(
              "g1b",
              0,
              188,
              "CAMPUS CARD STUDIO",
              {
                w: 148.5,
                size: 2.8,
                font: "latin-sans",
                color: "#746B5D",
                letterSpacing: 1,
              }
            ),
          ],
        }
      ),
  },

  {
    id: "graduation-02",
    name: "Graduation · Campus Memories",
    occasion: "graduation" as Occasion,
    blurb:
      "A photo-led design made for friends and shared memories.",

    build: () =>
      doc(
        "graduation-02",
        "Graduation · Campus Memories",
        "graduation",
        {
          bg: "#FFFFFF",
          ink: "#1F1D1A",
          accent: "#2E2A33",
          muted: "#716D67",
        },
        {
          front: [
            rect(
              "g2ph",
              20.25,
              26,
              108,
              108,
              "#EFEFEF",
              {
                radius: 0,
              }
            ),

            {
              id: "g2img",
              type: "image",
              name: "Group photo",
              x: 20.25,
              y: 26,
              w: 108,
              h: 108,
              radius: 0,
            } as Layer,

            text(
              "g2cap",
              20.25,
              140,
              "JUNE 2026 · OUTSIDE THE LIBRARY",
              {
                w: 108,
                size: 3.2,
                font: "latin-sans",
                color: "#716D67",
                align: "left",
                letterSpacing: 0.4,
              }
            ),

            text(
              "g2title",
              20.25,
              152,
              "We Graduated",
              {
                w: 108,
                size: 11,
                font: "latin-serif",
                weight: 700,
                color: "#1F1D1A",
                align: "left",
              }
            ),

            text(
              "g2msg",
              20.25,
              170,
              "Only one photograph,\nbut everyone who laughed that day is here.",
              {
                w: 108,
                size: 4.2,
                font: "latin-serif",
                color: "#4A4640",
                align: "left",
                lineHeight: 1.7,
              }
            ),

            text(
              "g2sign",
              20.25,
              193,
              "FROM ALEX",
              {
                w: 108,
                size: 3.4,
                font: "latin-sans",
                color: "#716D67",
                align: "right",
                letterSpacing: 0.5,
              }
            ),
          ],

          insideLeft: [
            text(
              "g2in",
              20,
              30,
              "A NOTE FOR THE FUTURE",
              {
                w: 108,
                size: 3.4,
                font: "latin-sans",
                color: "#716D67",
                align: "left",
                letterSpacing: 0.5,
              }
            ),

            text(
              "g2in2",
              20,
              42,
              "If you find this card years from now,\nI hope life has been kind to you.",
              {
                w: 108,
                size: 5,
                font: "latin-serif",
                color: "#1F1D1A",
                align: "left",
                lineHeight: 1.9,
              }
            ),
          ],

          insideRight: empty(),

          back: [
            text(
              "g2b",
              20,
              186,
              "CAMPUS CARD STUDIO",
              {
                w: 108,
                size: 2.8,
                font: "latin-sans",
                color: "#716D67",
                align: "left",
                letterSpacing: 1,
              }
            ),
          ],
        }
      ),
  },

  {
    id: "teacher-01",
    name: "Thank You · With Gratitude",
    occasion: "teacher" as Occasion,
    blurb:
      "A restrained and thoughtful design for an inspiring teacher.",

    build: () =>
      doc(
        "teacher-01",
        "Thank You · With Gratitude",
        "teacher",
        {
          bg: "#FBF7EF",
          ink: "#22232A",
          accent: "#3C4A63",
          muted: "#716D61",
        },
        {
          front: [
            rect(
              "t1frame",
              12,
              12,
              124.5,
              186,
              undefined,
              {
                stroke: "#3C4A63",
                strokeWidth: 0.3,
              }
            ),

            text(
              "t1rcpt",
              0,
              30,
              "FOR PROFESSOR MORGAN",
              {
                w: 148.5,
                size: 3.4,
                font: "latin-sans",
                color: "#716D61",
                letterSpacing: 0.5,
              }
            ),

            text(
              "t1title",
              0,
              44,
              "Thank You",
              {
                w: 148.5,
                size: 15,
                font: "latin-serif",
                weight: 700,
                color: "#22232A",
              }
            ),

            text(
              "t1sub",
              0,
              64,
              "WITH GRATITUDE",
              {
                w: 148.5,
                size: 2.8,
                font: "latin-sans",
                color: "#3C4A63",
                letterSpacing: 1.6,
              }
            ),

            line(
              "t1rule",
              60,
              74,
              88.5,
              74,
              "#3C4A63",
              0.3
            ),

            text(
              "t1msg",
              26,
              86,
              "Thank you for writing in that reference letter what I could not say myself.\n\nI will remember this course for much more than the grade.",
              {
                w: 96,
                size: 4.2,
                font: "latin-serif",
                color: "#33353D",
                lineHeight: 1.8,
              }
            ),

            text(
              "t1sign",
              26,
              164,
              "WITH THANKS,\nALEX · JUNE 2026",
              {
                w: 96,
                size: 3.5,
                font: "latin-sans",
                color: "#716D61",
                align: "left",
                lineHeight: 1.8,
                letterSpacing: 0.3,
              }
            ),
          ],

          insideLeft: [
            text(
              "t1in",
              26,
              30,
              "A FINAL NOTE",
              {
                w: 96,
                size: 3.5,
                font: "latin-sans",
                color: "#716D61",
                align: "left",
                letterSpacing: 0.6,
              }
            ),

            text(
              "t1in2",
              26,
              42,
              "I wanted to say this in person, but it always felt too formal.\nWriting it here feels just right.",
              {
                w: 96,
                size: 4.4,
                font: "latin-serif",
                color: "#33353D",
                align: "left",
                lineHeight: 2,
              }
            ),
          ],

          insideRight: empty(),

          back: [
            text(
              "t1b",
              0,
              190,
              "CAMPUS CARD STUDIO",
              {
                w: 148.5,
                size: 2.6,
                font: "latin-sans",
                color: "#716D61",
                letterSpacing: 1.2,
              }
            ),
          ],
        }
      ),
  },

  {
    id: "teacher-02",
    name: "Thank You · Editorial",
    occasion: "teacher" as Occasion,
    blurb:
      "A modern editorial card for a sincere message of thanks.",

    build: () =>
      doc(
        "teacher-02",
        "Thank You · Editorial",
        "teacher",
        {
          bg: "#FFFFFF",
          ink: "#1A1A1A",
          accent: "#7A0B45",
          muted: "#696566",
        },
        {
          front: [
            rect(
              "t2top",
              0,
              0,
              148.5,
              8,
              "#7A0B45"
            ),

            text(
              "t2cn",
              16,
              40,
              "Thank You for Your Patience",
              {
                w: 116,
                size: 10,
                font: "latin-serif",
                weight: 700,
                color: "#1A1A1A",
                align: "left",
                lineHeight: 1.1,
              }
            ),

            text(
              "t2en",
              16,
              66,
              "FOR EVERY QUESTION YOU ANSWERED",
              {
                w: 116,
                size: 3.2,
                font: "latin-sans",
                color: "#7A0B45",
                align: "left",
                letterSpacing: 0.7,
              }
            ),

            line(
              "t2r",
              16,
              76,
              132.5,
              76,
              "#E6DFE2",
              0.3
            ),

            text(
              "t2msg",
              16,
              86,
              "I asked many questions this term, some of them more than once.\n\nYou explained them again every time.",
              {
                w: 116,
                size: 4.5,
                font: "latin-serif",
                color: "#3A3A3A",
                align: "left",
                lineHeight: 1.9,
              }
            ),

            text(
              "t2msg2",
              16,
              132,
              "That is why I kept asking.",
              {
                w: 116,
                size: 4,
                font: "latin-serif",
                color: "#696566",
                align: "left",
              }
            ),

            text(
              "t2sign",
              16,
              170,
              "ALEX · JUNE 2026",
              {
                w: 116,
                size: 3.8,
                font: "latin-sans",
                color: "#1A1A1A",
                align: "left",
                letterSpacing: 0.4,
              }
            ),
          ],

          insideLeft: [
            text(
              "t2in",
              16,
              28,
              "P.S.",
              {
                w: 116,
                size: 4,
                font: "latin-sans",
                color: "#696566",
                align: "left",
              }
            ),

            text(
              "t2in2",
              16,
              38,
              "The course may be over, but I still have questions.\nI hope you will not mind hearing from me again.",
              {
                w: 116,
                size: 4.5,
                font: "latin-serif",
                color: "#3A3A3A",
                align: "left",
                lineHeight: 1.9,
              }
            ),
          ],

          insideRight: empty(),

          back: [
            rect(
              "t2b",
              0,
              200,
              148.5,
              10,
              "#7A0B45"
            ),
          ],
        }
      ),
  },
];

export const templateById = (
  id: string
) =>
  TEMPLATES.find(
    (template) => template.id === id
  ) ?? TEMPLATES[0];