import type { CardDoc, Layer, Occasion, TextLayer } from "../types";

export const FONT_STACKS: Record<string, string> = {
  "sans-cn":
    '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Noto Sans SC", system-ui, sans-serif',
  "serif-cn":
    '"Songti SC", "SimSun", "Noto Serif SC", "Source Han Serif SC", Georgia, serif',
  kai: '"Kaiti SC", "KaiTi", "STKaiti", "Noto Serif SC", serif',
  "latin-serif": 'Georgia, "Times New Roman", "Songti SC", serif',
  "latin-sans": '"Helvetica Neue", Arial, "Microsoft YaHei", sans-serif',
};

export const FONT_LABELS: Record<string, string> = {
  "sans-cn": "黑体 / Sans",
  "serif-cn": "宋体 / Serif",
  kai: "楷体 / Kai",
  "latin-serif": "西文衬线",
  "latin-sans": "西文无衬线",
};

/* ---------- layer helpers ---------- */

let seq = 0;
export const lid = (p: string) => `${p}_${(++seq).toString(36)}`;

export function text(
  id: string,
  x: number,
  y: number,
  value: string,
  opts: Partial<TextLayer> = {}
): TextLayer {
  return {
    id,
    type: "text",
    name: opts.name ?? "文字",
    x,
    y,
    text: value,
    w: opts.w ?? 120,
    size: opts.size ?? 5,
    font: opts.font ?? "sans-cn",
    weight: opts.weight ?? 400,
    color: opts.color ?? "#1b1b1b",
    align: opts.align ?? "center",
    lineHeight: opts.lineHeight ?? 1.35,
    letterSpacing: opts.letterSpacing ?? 0,
  };
}

export const rect = (id: string, x: number, y: number, w: number, h: number, fill: string | undefined, extra: Record<string, unknown> = {}): Layer =>
  ({ id, type: "shape", name: "色块", shape: "rect", x, y, w, h, fill, ...extra } as Layer);

export const circle = (id: string, x: number, y: number, d: number, fill: string | undefined, extra: Record<string, unknown> = {}): Layer =>
  ({ id, type: "shape", name: "圆形", shape: "circle", x, y, w: d, h: d, fill, ...extra } as Layer);

export const line = (id: string, x: number, y: number, x2: number, y2: number, stroke: string, w = 0.4): Layer =>
  ({ id, type: "shape", name: "线条", shape: "line", x, y, w: Math.abs(x2 - x), h: Math.abs(y2 - y), points: [x, y, x2, y2], stroke, strokeWidth: w } as Layer);

export const poly = (id: string, points: number[], fill: string): Layer =>
  ({ id, type: "shape", name: "图形", shape: "polygon", x: 0, y: 0, w: 0, h: 0, points, fill } as Layer);

const empty = (): Layer[] => [];

/* ---------- templates ---------- */

function doc(
  templateId: string,
  templateName: string,
  occasion: Occasion,
  theme: CardDoc["theme"],
  panels: CardDoc["panels"],
  meta: CardDoc["meta"] = { recipient: "小林", sender: "阿哲" }
): CardDoc {
  return {
    templateId,
    templateName,
    occasion,
    theme,
    panels,
    qr: { url: "", enabled: false },
    meta,
  };
}

const A = "#FF6B5A";
const GOLD = "#C7A24A";
const INK = "#221F26";

export const TEMPLATES = [
  {
    id: "birthday-01",
    name: "生日 · 彩带",
    occasion: "birthday" as Occasion,
    blurb: "暖色大色块，适合宿舍里快速做一张",
    build: () =>
      doc("birthday-01", "生日 · 彩带", "birthday", { bg: "#FFF6F1", ink: INK, accent: A, muted: "#8A7C74" }, {
        front: [
          rect("b1band", 0, 150, 148.5, 60, A),
          circle("b1dot", 104, 22, 46, "#FFD166"),
          circle("b1dot2", 126, 60, 12, "#FFD166"),
          text("b1rcpt", 14, 44, "致 小林", { w: 120, size: 5, color: "#8A7C74", align: "left" }),
          text("b1title", 14, 62, "生日快乐", { w: 120, size: 20, weight: 700, color: A, align: "left", lineHeight: 1.1 }),
          text("b1title2", 14, 92, "Happy Birthday", { w: 120, size: 7, font: "latin-serif", color: INK, align: "left" }),
          text("b1msg", 14, 112, "愿你今年许的愿望，都不用等太久。", { w: 112, size: 4.8, color: INK, align: "left", lineHeight: 1.6 }),
          text("b1sign", 14, 178, "阿哲　2026.11", { w: 112, size: 4.2, color: "#FFF1EC", align: "left" }),
        ],
        insideLeft: [
          text("b1in", 18, 30, "写给你的话", { w: 112, size: 4, color: "#8A7C74", align: "left" }),
          text("b1in2", 18, 40, "认识你是我大学里最不亏的一件事。\n新的一岁，少熬夜，多吃饭。", { w: 112, size: 5.2, color: INK, align: "left", lineHeight: 1.9 }),
        ],
        insideRight: empty(),
        back: [
          text("b1b", 18, 170, "CAMPUS CARD STUDIO", { w: 112, size: 3.4, font: "latin-sans", color: "#B9A99F", align: "left", letterSpacing: 0.6 }),
        ],
      }),
  },
  {
    id: "birthday-02",
    name: "生日 · 夜色",
    occasion: "birthday" as Occasion,
    blurb: "深色极简，适合配一张照片",
    build: () =>
      doc("birthday-02", "生日 · 夜色", "birthday", { bg: "#1D1A22", ink: "#F6F0E8", accent: "#E8C36A", muted: "#8C8394" }, {
        front: [
          circle("b2c", 40, 24, 3, "#E8C36A"),
          circle("b2c2", 100, 40, 2, "#E8C36A"),
          circle("b2c3", 118, 18, 1.6, "#8C8394"),
          text("b2title", 22, 66, "Happy\nBirthday", { w: 104, size: 17, weight: 400, font: "latin-serif", color: "#F6F0E8", align: "left", lineHeight: 1.15 }),
          line("b2line", 22, 118, 60, 118, "#E8C36A", 0.5),
          text("b2msg", 22, 126, "又长一岁。\n愿你仍然对明天有兴趣。", { w: 100, size: 4.6, color: "#C9C1CE", align: "left", lineHeight: 1.9 }),
          text("b2sign", 22, 176, "— 阿哲", { w: 100, size: 4.4, font: "kai", color: "#E8C36A", align: "left" }),
        ],
        insideLeft: [
          text("b2in", 20, 32, "TO  小林", { w: 110, size: 3.6, color: "#8C8394", align: "left", letterSpacing: 0.8 }),
          text("b2in2", 20, 44, "如果这一年只能许一个愿，\n我希望是可以一直这样，\n在同一个走廊里碰见你。", { w: 108, size: 4.8, color: "#E9E3EC", align: "left", lineHeight: 2.1 }),
        ],
        insideRight: empty(),
        back: [text("b2b", 20, 180, "CAMPUS CARD STUDIO", { w: 108, size: 3, color: "#5C5566", align: "left", letterSpacing: 0.8 })],
      }),
  },
  {
    id: "graduation-01",
    name: "毕业 · 学士帽",
    occasion: "graduation" as Occasion,
    blurb: "纸感底色，学位帽图形，正式但不冷",
    build: () =>
      doc("graduation-01", "毕业 · 学士帽", "graduation", { bg: "#F5F1E8", ink: "#23201D", accent: GOLD, muted: "#8B8272" }, {
        front: [
          poly("g1cap", [50, 44, 74.25, 34, 98.5, 44, 74.25, 54], "#2E2A33"),
          poly("g1cap2", [63, 49, 85.5, 49, 85.5, 60, 63, 60], "#2E2A33"),
          line("g1tassel", 98.5, 44, 98.5, 58, GOLD, 0.5),
          circle("g1knot", 97.5, 58, 2, GOLD),
          text("g1rcpt", 0, 66, "致 小林", { w: 148.5, size: 4.6, color: "#8B8272" }),
          text("g1title", 0, 78, "毕业快乐", { w: 148.5, size: 18, weight: 700, color: "#23201D" }),
          text("g1sub", 0, 101, "CONGRATULATIONS ON YOUR GRADUATION", { w: 148.5, size: 2.6, font: "latin-sans", color: GOLD, letterSpacing: 0.8 }),
          line("g1rule", 54, 109, 94.5, 109, GOLD, 0.4),
          text("g1msg", 24, 118, "愿你走出校门那天，\n行李很轻，前程很重。", { w: 100, size: 5, color: "#3A342C", lineHeight: 2 }),
          text("g1sign", 24, 172, "阿哲　2026.06", { w: 100, size: 4, color: "#8B8272", align: "left" }),
        ],
        insideLeft: [
          text("g1in", 20, 26, "四年，一页纸", { w: 110, size: 4.4, color: "#8B8272", align: "left" }),
          line("g1in2", 20, 34, 50, 34, GOLD, 0.3),
          text("g1in3", 20, 42, "记得第一次班会你坐在最后一排，\n记得图书馆四楼靠窗那个位子，\n记得散伙饭那天谁先哭的。\n\n祝你在新的城市，\n也遇到这样的人。", { w: 108, size: 4.6, color: "#3A342C", align: "left", lineHeight: 2.1 }),
        ],
        insideRight: empty(),
        back: [
          circle("g1seal", 62, 150, 24, undefined, { stroke: GOLD, strokeWidth: 0.4 }),
          text("g1sealT", 62, 158, "2026", { w: 24, size: 5, font: "latin-serif", color: GOLD }),
          text("g1b", 0, 188, "CAMPUS CARD STUDIO", { w: 148.5, size: 2.8, font: "latin-sans", color: "#B3A992", letterSpacing: 1 }),
        ],
      }),
  },
  {
    id: "graduation-02",
    name: "毕业 · 合照",
    occasion: "graduation" as Occasion,
    blurb: "照片为主，一张照片撑起整张卡",
    build: () =>
      doc("graduation-02", "毕业 · 合照", "graduation", { bg: "#FFFFFF", ink: "#1F1D1A", accent: "#2E2A33", muted: "#8A8680" }, {
        front: [
          rect("g2ph", 20.25, 26, 108, 108, "#EFEFEF", { radius: 0 }),
          { id: "g2img", type: "image", name: "合照", x: 20.25, y: 26, w: 108, h: 108, radius: 0 } as Layer,
          text("g2cap", 20.25, 140, "2026 年 6 月 · 图书馆前", { w: 108, size: 3.6, color: "#8A8680", align: "left" }),
          text("g2title", 20.25, 152, "我们毕业了", { w: 108, size: 12, weight: 700, color: "#1F1D1A", align: "left" }),
          text("g2msg", 20.25, 170, "合照只有一张，\n但那天笑的人都在。", { w: 108, size: 4.4, color: "#4A4640", align: "left", lineHeight: 1.8 }),
          text("g2sign", 20.25, 190, "阿哲 赠", { w: 108, size: 3.8, color: "#8A8680", align: "right" }),
        ],
        insideLeft: [
          text("g2in", 20, 30, "留一句话给以后", { w: 108, size: 3.8, color: "#8A8680", align: "left" }),
          text("g2in2", 20, 42, "如果哪天你翻到这页，\n希望你过得还不错。", { w: 108, size: 5, color: "#1F1D1A", align: "left", lineHeight: 2 }),
        ],
        insideRight: empty(),
        back: [text("g2b", 20, 186, "CAMPUS CARD STUDIO", { w: 108, size: 2.8, font: "latin-sans", color: "#C4C0BA", align: "left", letterSpacing: 1 })],
      }),
  },
  {
    id: "teacher-01",
    name: "感谢 · 书页",
    occasion: "teacher" as Occasion,
    blurb: "克制的排版，写给老师不会失礼",
    build: () =>
      doc("teacher-01", "感谢 · 书页", "teacher", { bg: "#FBF7EF", ink: "#22232A", accent: "#3C4A63", muted: "#8C8878" }, {
        front: [
          rect("t1frame", 12, 12, 124.5, 186, undefined, { stroke: "#3C4A63", strokeWidth: 0.3 }),
          text("t1rcpt", 0, 30, "致 王老师", { w: 148.5, size: 4.4, color: "#8C8878" }),
          text("t1title", 0, 44, "谢谢您", { w: 148.5, size: 16, weight: 700, color: "#22232A" }),
          text("t1sub", 0, 62, "WITH GRATITUDE", { w: 148.5, size: 2.8, font: "latin-sans", color: "#3C4A63", letterSpacing: 1.6 }),
          line("t1rule", 60, 72, 88.5, 72, "#3C4A63", 0.3),
          text("t1msg", 26, 86, "谢谢您在那封推荐信里，\n替我写了我说不出口的部分。\n\n这门课我会一直记得。", { w: 96, size: 4.6, color: "#33353D", lineHeight: 2.2 }),
          text("t1sign", 26, 160, "学生　阿哲\n2026 年 6 月", { w: 96, size: 3.8, color: "#8C8878", align: "left", lineHeight: 1.9 }),
        ],
        insideLeft: [
          text("t1in", 26, 30, "后记", { w: 96, size: 4, color: "#8C8878", align: "left" }),
          text("t1in2", 26, 42, "一直想当面说，又觉得太郑重。\n写在纸上好像刚好。", { w: 96, size: 4.4, color: "#33353D", align: "left", lineHeight: 2.1 }),
        ],
        insideRight: empty(),
        back: [text("t1b", 0, 190, "CAMPUS CARD STUDIO", { w: 148.5, size: 2.6, font: "latin-sans", color: "#C0BCAE", letterSpacing: 1.2 })],
      }),
  },
  {
    id: "teacher-02",
    name: "感谢 · 双语",
    occasion: "teacher" as Occasion,
    blurb: "中英并置，适合给外教或专业课老师",
    build: () =>
      doc("teacher-02", "感谢 · 双语", "teacher", { bg: "#FFFFFF", ink: "#1A1A1A", accent: "#7A0B45", muted: "#8E8A8A" }, {
        front: [
          rect("t2top", 0, 0, 148.5, 8, "#7A0B45"),
          text("t2cn", 16, 40, "谢谢您的耐心", { w: 116, size: 11, weight: 700, color: "#1A1A1A", align: "left" }),
          text("t2en", 16, 58, "Thank you for your patience", { w: 116, size: 5.4, font: "latin-serif", color: "#7A0B45", align: "left" }),
          line("t2r", 16, 72, 132.5, 72, "#E6DFE2", 0.3),
          text("t2msg", 16, 82, "这学期问过您很多问题，\n有些甚至重复了。\n您每次都重新讲了一遍。", { w: 116, size: 4.6, color: "#3A3A3A", align: "left", lineHeight: 2.1 }),
          text("t2msg2", 16, 118, "You explained it again every time.\nThat is why I kept asking.", { w: 116, size: 3.8, font: "latin-serif", color: "#8E8A8A", align: "left", lineHeight: 1.9 }),
          text("t2sign", 16, 170, "阿哲　2026.06", { w: 116, size: 4, color: "#1A1A1A", align: "left" }),
        ],
        insideLeft: [
          text("t2in", 16, 28, "P.S.", { w: 116, size: 4, font: "latin-sans", color: "#8E8A8A", align: "left" }),
          text("t2in2", 16, 38, "课程结束了，问题还没问完。\n以后大概还会来打扰您。", { w: 116, size: 4.6, color: "#3A3A3A", align: "left", lineHeight: 2 }),
        ],
        insideRight: empty(),
        back: [rect("t2b", 0, 200, 148.5, 10, "#7A0B45")],
      }),
  }
];

export const templateById = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
