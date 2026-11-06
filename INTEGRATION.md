# 模块接入说明（INTEGRATION）

这份文档只回答三件事：**你该改哪些文件、状态怎么改、怎么提交**。
数据类型与坐标单位见 [CONTRACT.md](./CONTRACT.md)，跑起来的命令见 [README.md](./README.md)。

---

## 1. 你该改哪些文件

| 模块 | 只改这些 | 不要动 |
|---|---|---|
| ② 首页 / 导航 / 界面 | `src/components/Home.tsx`、`src/styles.css`（`:root` 变量与 `.home` `.templates-page` 段落） | `types.ts`、`state.ts`、`App.tsx` 的页面状态机 |
| ③ 模板与内容 | `src/data/templates.ts`（往 `TEMPLATES` 里追加对象）、`src/data/greetings.ts`、`public/assets/templates/` | `CardDoc` 字段、`renderer.ts` 的绘制逻辑 |
| ④ 文字编辑 | `src/components/Inspector.tsx` 的文字区、`src/lib/renderer.ts` 的 `drawText` | 照片区、`Inspector` 的 props 结构 |
| ⑤ 照片上传与调整 | `src/lib/photo.ts`、`src/lib/photoMath.ts`、`src/lib/photoActions.ts`、`src/components/Inspector.tsx` 的照片区 | 文字区、`CardStage` 的拖拽坐标系 |
| ⑥ 预览 / 检查 / 导出 | `src/lib/checks.ts`、`src/lib/export.ts`、`src/lib/qr.ts`、`src/components/ExportView.tsx` | `types.ts` 里 `CardDoc` 的既有字段语义 |

两个「公共热点」由模块一维护，**要改先打招呼**：`src/App.tsx`（页面状态机）、`src/types.ts`（图层模型）。

---

## 2. 状态怎么改

唯一入口是 `App.tsx` 里拿到的 `update`：

```ts
update((d) => ({ ...d, meta: { ...d.meta, recipient: "小林" } }));
// 连续拖动这类高频操作传第二个参数，700ms 内合并成一步撤销
update((d) => /* ... */, true);
```

- 撤销 / 重做 / 重置由 `state.ts` 的 `useDocHistory` 负责，**不要在组件里另存一份 doc**。
- 只增不改：新增字段可以，但已有字段的名字与单位不要动，否则四个页签、缩略图、检查、导出会一起崩。
- 需要新图层类型（比如贴纸、二维码）时，同一次提交里改完：`types.ts` → `CONTRACT.md` → `lib/renderer.ts` → `CardStage` 的命中测试 → `checks.ts`。
- 坐标一律**毫米**（A5 单页 148.5 × 210，画布内是 panel 空间），安全区 `SAFE = 8`，裁切 `BLEED = 3`；不要在卡片内用 px。

---

## 3. 怎么提交

```bash
git switch main && git pull            # 先同步
git switch -c feat/photo-crop          # 一个功能一条分支
# 只 add 自己改的文件
git add src/lib/photoMath.ts src/components/Inspector.tsx
git commit -m "feat(photo): 取景框按原始比例约束"
git push -u origin feat/photo-crop
```

然后在 GitHub 上开 Pull Request，**合并前先本地跑一遍**：

```bash
npx --yes pnpm@9.15.0 build            # tsc -b && vite build 必须零报错
```

冲突高发文件与处理：

- `src/styles.css`、`src/data/templates.ts`：都是「往后追加」，冲突时**两边的条目都留**，不要整段覆盖。
- `src/App.tsx`、`src/components/Inspector.tsx`：先在自己的 PR 里说明改了什么，由模块一合并。
- 不要提交 `node_modules/`、`dist/`、`.pnpm-store/`、`.shots/`；也不要顺手改 `pnpm-lock.yaml`（除非确实加减了依赖，并在 PR 里说明）。

---

## 4. 交之前自查

1. `npx --yes pnpm@9.15.0 build` 零报错。
2. 首页 → 模板 → 编辑器 → 检查页 来回点一遍，控制台无红字。
3. 手机上（浏览器窗口拉到 560px 以下）你的界面不出横向滚动条。
4. 改动只落在上表「只改这些」里；`git status` 没有意外文件。
5. 中文文案没有乱码（编辑器用 UTF-8 保存，不要用 PowerShell 管道改中文文件）。
