# 数据格式与协作约定

给六个人对接口用。任何一方改动下面这些东西，先在群里说一声。

---

## 1. 页面结构

没有用 react-router，页面是 `App.tsx` 里的一个状态：

```ts
type View = "home" | "templates" | "editor" | "export";
```

| 页面 | 组件 | 谁负责 |
|---|---|---|
| 首页 | `components/Home.tsx` | 分工 2（界面） |
| 模板选择 | `components/Gallery.tsx` | 分工 2 + 3（界面 + 模板） |
| 编辑 | `components/CardStage.tsx` + `components/Inspector.tsx` | 分工 4（文字）、5（照片） |
| 预览与检查（导出页占位） | `components/ExportView.tsx` | 分工 1 + 6 |

跳转关系：

```
Home ──开始制作──▶ Gallery ──选模板──▶ Editor ──预览与检查──▶ Export
  ▲                   ▲                   │                    │
  └──← 首页 ──────────┘                   └──← 继续编辑 ───────┘
```

**注意**：`editor` 和 `export` 都要求 `doc !== null`，否则自动回首页。新增页面时改 `View` 联合类型 + `App.tsx` 里一个 `if` 分支即可。

---

## 2. 核心数据结构

一张卡就是一份 JSON（`src/types.ts`）。**所有尺寸单位是毫米，不是像素。**

```ts
interface CardDoc {
  templateId: string;
  templateName: string;
  occasion: "birthday" | "graduation" | "teacher" | "society";
  theme: { bg: string; ink: string; accent: string; muted: string };
  panels: Record<"front" | "insideLeft" | "insideRight" | "back", Layer[]>;
  qr: { url: string; enabled: boolean };   // 本阶段未接线
  meta: { recipient: string; sender: string };
}
```

版面常量（`types.ts` 底部）：

| 常量 | 值 | 含义 |
|---|---|---|
| `PANEL_W` / `PANEL_H` | 148.5 × 210 | 单页尺寸（A5） |
| `SHEET_W` / `SHEET_H` | 297 × 210 | 展开后一张纸（A4 横向） |
| `SAFE` | 8 | 安全区，距裁切线的距离 |
| `BLEED` | 3 | 出血，下一阶段导出用 |

**坐标系**：每个 panel 自己的左上角是 `(0, 0)`，x 向右、y 向下，单位毫米。文字层的 `x, y` 是文本框左上角，`w` 是换行宽度。

### 四种图层

```ts
// 文字
{ id, type: "text", name, x, y, text, w,
  size /* mm */, font, weight, color, align, lineHeight, letterSpacing }

// 照片
{ id, type: "image", name, x, y, w, h, src?, naturalW?, naturalH?,
  crop?: { x, y, w, h } /* 原图像素坐标 */, radius }

// 图形（不参与交互）
{ id, type: "shape", shape: "rect" | "circle" | "line" | "polygon",
  x, y, w, h, fill?, stroke?, strokeWidth?, radius?, points? }

// 二维码（本阶段不生成，结构保留）
{ id, type: "qr", name, x, y, size, url, pad }
```

`font` 只能是 `src/data/templates.ts` 里 `FONT_STACKS` 的 key：`sans-cn` / `serif-cn` / `kai` / `latin-serif` / `latin-sans`。

---

## 3. 加一张模板

只改 `src/data/templates.ts`，不要碰组件。

```ts
{
  id: "graduation-03",
  name: "毕业 · 手写",
  occasion: "graduation",
  blurb: "一句话介绍，展示在模板卡片下面",
  build: () => doc("graduation-03", "毕业 · 手写", "graduation", theme, {
    front: [ /* 图层，按数组顺序叠放，后面的在上面 */ ],
    insideLeft: [],
    insideRight: [],
    back: [],
  }),
}
```

约定：

- 图层 `id` 在**一张卡内**唯一（`verify-templates` 会查）。
- 照片框用 `{ id, type: "image", ... }`，先不放 `src`，编辑器会画成虚线占位。
- 所有内容留在 `SAFE`（8mm）以内，否则一进编辑器就报错。
- 新增后跑一遍 `scripts/verify-templates.mjs`。

---

## 4. 组件接口

```ts
<Home templateCount={6} onStart={() => void} />

<Gallery assets={Assets} onPick={(doc: CardDoc) => void} onHome={() => void} />

<CardStage
  doc={CardDoc} panel={PanelKey} assets={Assets} pxPerMm={number}
  selectedId={string | null}
  onSelect={(id: string | null) => void}
  onMove={(id: string, xMm: number, yMm: number) => void}
/>

<Inspector doc panel selected issues cropMode cropZoom
  onToggleCrop onLayer(id, patch) onDelete(id) onUpload(file) onPickIssue(issue)
  onInsertGreeting(text) onZoomCrop(z) />

<ExportView doc assets issues onEdit onPickIssue onRestart />
```

**约定**：组件不直接改 `doc`，一律通过 `onLayer(id, patch)` / `onMove(...)` 往上抛，由 `App.tsx` 统一走 `update()`。这样撤销/重做只需要维护一处。

---

## 5. 检查规则（`lib/checks.ts`）

| 级别 | 触发条件 |
|---|---|
| error | 文字为空 / 超过 200 字 / 超出画布 / 照片超出画布 / 照片低于 150 DPI |
| warn | 文字进入 8mm 安全区 / 文字压折线 / 文字与底色对比度 < 3:1 / 照片未上传 / 照片低于 300 DPI |

新增规则：往 `runChecks()` 里 `out.push({...})`，页面会自动显示。**error 会拦住流程，warn 只是提醒**——不要把提醒标成 error，否则用户永远走不到预览页。

---

## 6. 样式约定

- 颜色、圆角、断点都在 `src/styles.css` 顶部的 `:root` 变量里，不要在组件里写死颜色。
- 断点：`980px`（编辑器从两栏变一栏）、`560px`（手机，模板两列、导航收窄）。
- 类名：页面级用 `-page` 后缀（`templates-page`、`export-page`），组件级用 `-body` / `-head`，避免和别人的类名撞车。

---

## 7. 文件归属（减少合并冲突）

| 分工 | 主要改这里的文件 |
|---|---|
| 1 框架与整合 | `App.tsx`、`types.ts`、`state.ts` |
| 2 界面 | `styles.css`、`Home.tsx`、`Gallery.tsx`、`ExportView.tsx` |
| 3 模板 | `data/templates.ts`、`data/greetings.ts`、`docs/` |
| 4 文字 | `Inspector.tsx`（文字部分）、`renderer.ts`（文字绘制） |
| 5 照片 | `Inspector.tsx`（照片部分）、`renderer.ts`（图片绘制）、`state.ts`（`readImageFile`） |
| 6 预览与测试 | `lib/checks.ts`、`scripts/` |

`Inspector.tsx` 和 `renderer.ts` 有两个人会碰，**先改的人先合并**，后改的人拉一次最新再动。

---

## 8. 已经写好、但这一版没接线的

- `lib/export.ts`：PDF / PNG 导出（jsPDF + 300 DPI 渲染 + 裁切与折线标记）
- `lib/qr.ts`：二维码生成
- `CardDoc.qr` 字段与 `qr` 图层类型

下一阶段要开的时候，`ExportView` 里那两个按钮直接接上即可，数据格式不用改。

---

## 9. 照片模块接口（分工 5）

### 9.1 数据不变式

`ImageLayer` 里只有三样东西跟照片有关：

```ts
{ src, naturalW, naturalH, crop?: { x, y, w, h } }
```

| 不变式 | 含义 |
|---|---|
| `crop` 的宽高比 == 照片框 `w/h` 的宽高比 | 照片**不可能**被拉伸 |
| `crop` 永远在 `[0, naturalW] × [0, naturalH]` 内 | 不会露出空白边 |
| `crop` 用**原图像素**坐标，不是 0–1 | 换分辨率不用迁移 |

**照片框的 `w/h` 永远由模板决定，任何交互都不修改它。** 缩放和移动只改 `crop`。

### 9.2 别人可以直接用的函数

```ts
// src/lib/photoMath.ts —— 纯计算，无 DOM，可在 Node 里测
coverCrop(imgW, imgH, frameW, frameH): Crop
clampCrop(crop, imgW, imgH): Crop
zoomCrop(current, imgW, imgH, frameW, frameH, zoom): Crop
panCrop(crop, frameW, frameH, dxMm, dyMm, imgW, imgH): Crop
photoDpi(layer): number            // 给分工 6 的检查用
frameOutsidePanel(layer): boolean
frameOutsideSafe(layer): boolean

// src/lib/photo.ts —— 只在这里碰 DOM
loadPhoto(file): Promise<{ src, width, height, original }>
```

`loadPhoto` 负责：类型白名单（JPG/PNG/WebP）→ 体积上限 8MB → 解码（顺带修正 EXIF 方向）
→ 降采样到最长边 3000px → 输出 dataURL（PNG 保留透明，JPEG 质量 0.92）。

失败时抛 `PhotoError`，`message` 是可以直接显示给用户的中文句子。

### 9.3 给分工 6 的

- 分辨率：`photoDpi(layer)`，建议 `< 150` 报错、`150–300` 提醒
- 边界：`frameOutsidePanel(layer)` 报错，`frameOutsideSafe(layer)` 提醒
- 测试素材建议：50×50 小图、6000×4000 大图、带 EXIF 旋转的竖拍 JPG、透明 PNG、改后缀的损坏文件

### 9.4 还没做的（等确认）

- 画布上的拖动语义（拖照片 = 改取景，还是移动照片框）
- 手机上上传入口的位置
- 选中照片时是否响应 Delete 键

这三条不依赖代码，依赖分工 1 / 2 / 4 的答复。
