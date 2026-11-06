/**
 * Structural checks for the template library.
 * Runs in Node (no DOM): verifies every template builds and its layers sit on the card.
 *
 *   node scripts/verify-templates.mjs
 */
import { TEMPLATES } from "../src/data/templates.ts";
import { GREETINGS, suggest } from "../src/data/greetings.ts";
import { PANEL_H, PANEL_W } from "../src/types.ts";

const PANELS = ["front", "insideLeft", "insideRight", "back"];
let failures = 0;

function fail(msg) {
  failures++;
  console.error("  ✗ " + msg);
}

console.log(`templates: ${TEMPLATES.length}`);

for (const t of TEMPLATES) {
  const doc = t.build();
  const ids = new Set();
  let layers = 0;

  for (const p of PANELS) {
    if (!Array.isArray(doc.panels[p])) {
      fail(`${t.id}: panel "${p}" missing`);
      continue;
    }
    for (const l of doc.panels[p]) {
      layers++;
      if (ids.has(l.id)) fail(`${t.id}: duplicate layer id ${l.id}`);
      ids.add(l.id);

      if (!Number.isFinite(l.x) || !Number.isFinite(l.y)) fail(`${t.id}/${l.id}: bad position`);

      if (l.type === "text") {
        if (!l.text) fail(`${t.id}/${l.id}: empty text`);
        if (!(l.size > 0)) fail(`${t.id}/${l.id}: bad font size`);
        if (!(l.w > 0)) fail(`${t.id}/${l.id}: bad wrap width`);
        // rough horizontal bounds: text origin must sit inside the panel
        if (l.x < 0 || l.x > PANEL_W) fail(`${t.id}/${l.id}: text x out of panel (${l.x})`);
        if (l.y < 0 || l.y > PANEL_H) fail(`${t.id}/${l.id}: text y out of panel (${l.y})`);
      }

      if (l.type === "image") {
        if (!(l.w > 0) || !(l.h > 0)) fail(`${t.id}/${l.id}: image frame has no size`);
        if (l.x < 0 || l.y < 0 || l.x + l.w > PANEL_W + 0.01 || l.y + l.h > PANEL_H + 0.01)
          fail(`${t.id}/${l.id}: image frame outside the panel`);
      }

      if (l.type === "shape" && l.shape === "polygon") {
        if (!l.points || l.points.length < 6) fail(`${t.id}/${l.id}: polygon needs >= 3 points`);
      }
    }
  }

  const occ = new Set(TEMPLATES.map((x) => x.occasion));
  console.log(
    `  ${t.id.padEnd(14)} ${String(layers).padStart(2)} layers  ${doc.theme.bg}  ${t.name}`
  );
  void occ;
}

const byOccasion = {};
for (const t of TEMPLATES) byOccasion[t.occasion] = (byOccasion[t.occasion] ?? 0) + 1;
console.log("per occasion:", JSON.stringify(byOccasion));
if (TEMPLATES.length !== 6) fail(`expected 6 templates, found ${TEMPLATES.length}`);
for (const [k, v] of Object.entries(byOccasion)) {
  if (v !== 2) fail(`occasion ${k} has ${v} templates, expected 2`);
}

console.log(`greetings: ${GREETINGS.length}`);
for (const occ of ["birthday", "graduation", "teacher"]) {
  const hits = suggest(occ, "friend", "warm");
  if (hits.length === 0) fail(`no greeting suggestions for ${occ}`);
  for (const h of hits) {
    if (!h.cn || !h.en) fail(`greeting missing one language in ${occ}`);
  }
}

console.log(failures === 0 ? "\nOK — all template checks passed" : `\n${failures} problem(s)`);
process.exit(failures === 0 ? 0 : 1);
