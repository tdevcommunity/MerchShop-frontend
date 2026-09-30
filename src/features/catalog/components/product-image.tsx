import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type ProductImageProps = {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function isInlineImage(src: string) {
  return src.startsWith("data:") || src.startsWith("blob:");
}

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

  if (isInlineImage(src)) {
    return (
      <div className={cn("relative overflow-hidden bg-tdev-surface", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="absolute inset-0 size-full object-cover" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-tdev-surface", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={src.startsWith("/")}
        className="object-cover transition-transform duration-200 ease-out"
      />
    </div>
  );
}
