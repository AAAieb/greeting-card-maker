/**
 * 照片上传：格式与体积校验 → 解码（顺带修正 EXIF 方向）→ 降采样 → dataURL。
 * 只有这个文件碰 DOM。
 */
import { MAX_EDGE_PX, MIN_EDGE_PX } from "./photoMath";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPTED_LABEL = "JPG / PNG / WebP";
export const MAX_MB = 8;

export interface PhotoAsset {
  /** 归一化后的 dataURL，可直接喂给 Konva.Image */
  src: string;
  width: number;
  height: number;
  /** 原始文件信息，给检查面板和调试用 */
  original: { name: string; bytes: number; width: number; height: number };
}

export class PhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoError";
  }
}

function checkFile(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    const ext = file.name.split(".").pop() ?? "";
    throw new PhotoError(`不支持 ${ext ? "." + ext : "这个"} 格式，请用 ${ACCEPTED_LABEL}`);
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new PhotoError(
      `图片有 ${(file.size / 1024 / 1024).toFixed(1)}MB，超过 ${MAX_MB}MB。先压缩一下，或者换一张`
    );
  }
  if (file.size === 0) {
    throw new PhotoError("这个文件是空的，换个文件试试");
  }
}

/** 解码：优先 createImageBitmap（会按 EXIF 摆正方向），失败再退回 <img> */
async function decode(file: File): Promise<{ bitmap: ImageBitmap | HTMLImageElement; w: number; h: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { bitmap, w: bitmap.width, h: bitmap.height };
    } catch {
      /* 落到下面的 <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new PhotoError("这张图片解不开，可能已经损坏"));
      el.src = url;
    });
    return { bitmap: img, w: img.naturalWidth, h: img.naturalHeight };
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export async function loadPhoto(file: File): Promise<PhotoAsset> {
  checkFile(file);

  const { bitmap, w, h } = await decode(file);
  if (w < MIN_EDGE_PX || h < MIN_EDGE_PX) {
    throw new PhotoError(
      `图片只有 ${w}×${h}，太小了（至少 ${MIN_EDGE_PX}×${MIN_EDGE_PX}），打出来会糊`
    );
  }

  const scale = Math.min(1, MAX_EDGE_PX / Math.max(w, h));
  const outW = Math.round(w * scale);
  const outH = Math.round(h * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new PhotoError("浏览器不支持画布，换一个浏览器试试");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, outW, outH);

  // PNG / WebP 保留透明通道，JPEG 用高质量重编码减小体积
  const keepAlpha = file.type !== "image/jpeg";
  const src = keepAlpha ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.92);

  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

  return {
    src,
    width: outW,
    height: outH,
    original: { name: file.name, bytes: file.size, width: w, height: h },
  };
}
