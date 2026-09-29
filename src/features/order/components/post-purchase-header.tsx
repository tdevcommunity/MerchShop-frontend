import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";

type PostPurchaseHeaderProps = {
  shopHref?: string;
};

export function PostPurchaseHeader({
  shopHref = "/",
}: PostPurchaseHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[#33383a] bg-tdev-anthracite px-5 lg:h-[72px] lg:px-12">
      <Link href={shopHref}>
        <BrandMark inverted />
        <span className="sr-only">Accueil TDEV Shop</span>
      </Link>
      <p className="hidden items-center gap-3 lg:flex">
        <span className="text-xs uppercase tracking-[1.2px] text-[#8a8f91]">
          Statut :
        </span>
        <span className="bg-tdev-green px-3 py-1 font-headline text-xs font-extrabold uppercase tracking-[0.3px] text-tdev-white">
          Paiement confirmé
        </span>
      </p>
      <Link
        href={shopHref}
        className="border border-[#4a4f51] px-4 py-2 font-headline text-xs font-bold uppercase tracking-[0.6px] text-tdev-white"
      >
        Retour à la boutique
      </Link>
    </header>
  );
}
