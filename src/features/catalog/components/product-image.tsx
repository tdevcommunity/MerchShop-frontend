import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import {
  isRemoteProductImage,
  resolveProductImageSrc,
} from "@/features/catalog/utils/image-src";

type ProductImageProps = {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function ProductImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 400px, 100vw",
  priority = false,
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

  const resolved = resolveProductImageSrc(src);

  // URLs admin libres (Drive, data URL, CDN non whitelisté) : <img> natif.
  // next/image reste pour les assets locaux une fois le CDN produit configuré.
  if (isRemoteProductImage(resolved)) {
    return (
      <div className={cn("relative overflow-hidden bg-tdev-surface", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolved}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
          loading={priority ? "eager" : "lazy"}
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
