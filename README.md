# Campus Greeting Card Maker

校园贺卡编辑器。当前阶段范围：**首页 → 选模板 → 编辑 → 预览检查**。

## 运行

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

```bash
pnpm build        # 产出 dist/
pnpm preview      # 预览构建结果
```

> 若 `pnpm dev` 报 `Cannot find package 'esbuild'`，是包管理器跳过了平台二进制：
> `pnpm add -D @esbuild/win32-x64@0.21.5`（Windows）。`.npmrc` 已把 `@esbuild` / `@rollup` 指向官方源。

## 这一版有什么

| 功能 | 状态 |
|---|---|
| 首页（介绍 + 三步流程 + 开始按钮） | ✅ |
| 导航栏、页脚 | ✅ |
| 模板选择页（3 类 · 6 张，可筛选） | ✅ |
| 贺卡编辑页（4 个页签：正 / 内左 / 内右 / 背） | ✅ |
| 预览与检查页（导出页占位） | ✅ 页面已通，导出按钮留到下阶段 |
| 文字：收件人、标题、祝福语、签名 | ✅ 点选即改，实时刷新 |
| 字体 / 字号 / 颜色 / 对齐 / 粗体 / 行高 | ✅ |
| 字数上限与空内容提示 | ✅ 200 字 |
| 照片：上传 / 更换 / 删除 | ✅ JPG·PNG·WebP，8MB 以内 |
| 照片：移动 / 缩放 / 保持比例 | ✅ 拖动改取景，滑块缩放，永不拉伸 |
| 安全区与裁切线提示 | ✅ 蓝虚线安全区、红框裁切线，越界报错 |
| 撤销 / 重做 | ✅ |
| 中英祝福语推荐 | ✅ 23 条，按场合 × 关系 × 语气 |
| 手机适配 | ✅ 980 / 560 两个断点 |
| 二维码 / 草稿保存 / PDF 导出 | ⛔ 本阶段不做 |

## 目录

```
src/
  types.ts              卡片文档模型（毫米坐标、图层）
  App.tsx               页面切换（home / templates / editor / export）
  state.ts              文档状态、撤销重做、图片加载与校验
  data/templates.ts     6 张模板 + 字体栈
  data/greetings.ts     中英祝福语库
  lib/renderer.ts       Konva 绘制（预览与缩略图共用）
  lib/photo.ts          照片上传：校验、解码、降采样
  lib/photoMath.ts      取景框 / 分辨率 / 边界的纯计算
  lib/checks.ts         输入检查（空、超长、越界、DPI、对比度）
  lib/thumb.ts          单页渲染成图片（模板缩略图、预览页）
  components/           Home / Gallery / CardStage / Inspector / ExportView
```

数据格式与协作约定见 [CONTRACT.md](./CONTRACT.md)。

## 分工

| 模块 | 负责 | 主要文件 |
|---|---|---|
| ① 框架与整合 | 页面状态机、数据契约、依赖与构建、合并 PR | `src/App.tsx`、`src/types.ts`、`src/state.ts`、`CONTRACT.md` |
| ② 首页与界面 | 视觉、响应式、文案 | `src/components/Home.tsx`、`src/styles.css` |
| ③ 模板与内容 | 模板、祝福语、素材 | `src/data/templates.ts`、`src/data/greetings.ts`、`public/assets/templates/` |
| ④ 文字编辑 | 字体字号颜色对齐、越界提示 | `src/components/Inspector.tsx`（文字区）、`src/lib/renderer.ts` |
| ⑤ 照片上传与调整 | 上传校验、移动、缩放、不变形 | `src/lib/photo*.ts`、`src/components/Inspector.tsx`（照片区） |
| ⑥ 预览 / 检查 / 导出 | 检查项、PDF 与图片导出、二维码 | `src/lib/checks.ts`、`src/lib/export.ts`、`src/lib/qr.ts`、`src/components/ExportView.tsx` |

改哪个文件、怎么提交、冲突怎么处理，见 [INTEGRATION.md](./INTEGRATION.md)。

## 验证

模块一的 15 项验收记录（含截图与修复说明）见 [docs/VERIFY.md](./docs/VERIFY.md)。

```bash
pnpm exec esbuild scripts/verify-templates.mjs --bundle --platform=node --format=cjs --outfile=.tmp/v.cjs
node .tmp/v.cjs
```

检查：6 张模板、每类 2 张、图层 id 唯一、元素不越界、语库中英齐全。
