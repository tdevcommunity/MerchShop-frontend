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
