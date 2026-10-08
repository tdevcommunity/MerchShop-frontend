import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import wordmark from "@/publics/tdev-wordmark-BAcPmZ98.png";
import wordmarkNegative from "@/publics/tdev-wordmark-negative.png";

type BrandMarkProps = {
  className?: string;
  /** Le logo est pose sur un fond sombre (texte blanc apres filtre). */
  inverted?: boolean;
};

/*
 * Le logo officiel, affiche partout (header, footer, checkout, tunnel, admin).
 *
 * Il est systematiquement filtre avec .tdev-logo-pink (invert 100%) : le mark
 * vert vire au rose. Comme ce filtre transforme aussi le texte noir en blanc,
 * la source depend du fond :
 * - fond sombre  -> PNG d'origine  : texte blanc + mark rose ;
 * - fond clair   -> PNG negatif    : texte anthracite + mark rose (lisible).
 */
export function BrandMark({ className, inverted = false }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        data-brand-wordmark
        src={inverted ? wordmark : wordmarkNegative}
        alt="TDEV"
        width={wordmark.width}
        height={wordmark.height}
        className="tdev-logo-pink h-10 w-auto sm:h-11"
      />
    </span>
  );
}
