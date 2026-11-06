import QRCode from "qrcode";

const cache = new Map<string, string>();

export async function qrDataUrl(url: string, sizePx = 720): Promise<string> {
  const hit = cache.get(url + sizePx);
  if (hit) return hit;
  const data = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 0,
    width: sizePx,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
  cache.set(url + sizePx, data);
  return data;
}

export function isValidUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
