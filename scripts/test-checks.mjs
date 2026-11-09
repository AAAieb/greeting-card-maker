/**
 * 检查规则的单元测试（Node 环境，用假的 canvas 量文字宽度）。
 *   node scripts/test-checks.mjs
 */
import { runChecks } from "../src/lib/checks.ts";
import { TEMPLATES } from "../src/data/templates.ts";

// 最小 canvas 替身：只需要 measureText
globalThis.document = {
  createElement: () => ({
    getContext: () => ({
      font: "",
      measureText: (s) => ({ width: String(s).length * 0.6 }),
    }),
  }),
};

let failed = 0;
function ok(name, cond, detail = "") {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failed++;
    console.error(`  ✗ ${name} ${detail}`);
  }
}

const birthday = TEMPLATES.find((t) => t.id === "birthday-01").build();
const issues = runChecks(birthday);
const contrastIssues = issues.filter((i) => i.key.endsWith("-contrast"));

console.log("birthday-01 的对比度问题：");
for (const i of contrastIssues) {
  console.log("   · " + i.detail);
}

ok("不再出现 1.0:1 的误报", !contrastIssues.some((i) => /只有 1\.0:1/.test(i.detail)));

const bandText = contrastIssues.find((i) => /阿哲/.test(i.detail));
ok("压色块的白字按色块颜色计算", !!bandText && /2\.[0-9]:1/.test(bandText.detail), bandText?.detail);
ok("小字用 4.5:1 阈值", !!bandText && /低于 4\.5:1/.test(bandText.detail), bandText?.detail);

const title = contrastIssues.find((i) => /生日快乐/.test(i.detail));
ok("大字号用 3:1 阈值", !!title && /低于 3:1/.test(title.detail), title?.detail);

// 每个模板都能跑完检查，不抛异常
console.log("\n全部模板跑一遍：");
for (const t of TEMPLATES) {
  const doc = t.build();
  let n = 0;
  try {
    n = runChecks(doc).length;
  } catch (e) {
    failed++;
    console.error(`  ✗ ${t.id} 抛异常 ${e.message}`);
    continue;
  }
  console.log(`  ✓ ${t.id.padEnd(14)} ${n} 条提示`);
}

console.log(failed === 0 ? "\nOK — 检查规则通过" : `\n${failed} 个失败`);
process.exit(failed === 0 ? 0 : 1);
