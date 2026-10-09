import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import {
  displayProductImageSrc,
  isRemoteProductImage,
} from "@/features/catalog/utils/image-src";

type ProductImageProps = {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Largeur max demandée à Cloudinary (défaut carte catalogue). */
  width?: number;
};

export function ProductImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 400px, 100vw",
  priority = false,
  width = 900,
}: ProductImageProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-tdev-surface text-center",
          className,
        )}
        role="img"
        aria-label={alt ? `${alt} — visuel manquant` : "Visuel manquant"}
      >
        <span className="px-4 text-[11px] font-bold uppercase tracking-[1.8px] text-tdev-muted">
          Visuel manquant
        </span>
      </div>
    );
  }

  const resolved = displayProductImageSrc(src, { width });

  // Cloudinary et autres CDN : livraison déjà optimisée (f_auto → WebP/AVIF).
  // next/image reste pour les assets locaux.
  if (isRemoteProductImage(resolved)) {
    return (
      <div className={cn("relative overflow-hidden bg-tdev-surface", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolved}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-tdev-surface", className)}>
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={resolved.startsWith("/")}
        className="object-cover transition-transform duration-200 ease-out"
      />
    </div>
  );
}
