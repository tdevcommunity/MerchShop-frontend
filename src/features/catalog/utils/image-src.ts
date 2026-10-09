/**
 * Normalise les URLs collées depuis l'admin (Drive "view", etc.)
 * vers une source affichable, sans dépendre d'un CDN figé.
 */
export function resolveProductImageSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname === "drive.google.com" || url.hostname === "www.drive.google.com") {
      const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
      if (fileMatch?.[1]) {
        return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
      }
      const id = url.searchParams.get("id");
      if (id) {
        return `https://drive.google.com/uc?export=view&id=${id}`;
      }
      if (url.pathname === "/uc" || url.pathname === "/thumbnail") {
        return trimmed;
      }
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

export function isRemoteProductImage(src: string): boolean {
  return /^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:");
}

export function isCloudinaryProductImage(src: string): boolean {
  try {
    const url = new URL(src);
    return (
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/image/upload/")
    );
  } catch {
    return false;
  }
}

export type CloudinaryDeliveryOptions = {
  /** Largeur max côté CDN (c_limit) — réduit le poids sans cropper. */
  width?: number;
};

/**
 * Livraison Cloudinary optimisée à l'affichage.
 *
 * On ne convertit pas à l'upload : l'original reste en archive. À la lecture,
 * `f_auto` sert WebP/AVIF selon le navigateur, `q_auto` ajuste la qualité.
 * Les URLs hors Cloudinary (Drive, data URL) sont renvoyées telles quelles.
 */
export function withCloudinaryDelivery(
  src: string,
  options: CloudinaryDeliveryOptions = {},
): string {
  if (!isCloudinaryProductImage(src)) {
    return src;
  }

  if (src.includes("/f_auto") || src.includes("f_auto,") || src.includes(",f_auto")) {
    return src;
  }

  const transforms = ["f_auto", "q_auto"];
  if (options.width && options.width > 0) {
    transforms.push("c_limit", `w_${Math.round(options.width)}`);
  }

  return src.replace(
    "/image/upload/",
    `/image/upload/${transforms.join(",")}/`,
  );
}

/**
 * Pipeline d'affichage catalogue : normalisation puis livraison CDN.
 */
export function displayProductImageSrc(
  src: string,
  options: CloudinaryDeliveryOptions = {},
): string {
  return withCloudinaryDelivery(resolveProductImageSrc(src), options);
}
