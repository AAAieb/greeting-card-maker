import { writeFileSync, mkdirSync } from "node:fs";
import { TEMPLATES } from "../src/data/templates.ts";

mkdirSync(".tmp", { recursive: true });
const out = TEMPLATES.map((t) => t.build());
writeFileSync(".tmp/templates.json", JSON.stringify(out, null, 2), "utf8");
console.log("wrote .tmp/templates.json", out.length);
