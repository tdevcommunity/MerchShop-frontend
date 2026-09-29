import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo/create-metadata";
import { siteConfig } from "@/lib/config/site";

export const metadata = createMetadata({
  title: "Accueil",
  path: "/",
});

export default function HomePage() {
  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <p className="text-sm uppercase tracking-[0.2em] text-tdev-yellow">
        {siteConfig.festival}
      </p>
      <h1 className="font-headline text-4xl leading-tight sm:text-5xl">
        Le merch officiel, prêt pour le Jour J.
      </h1>
      <p className="text-base text-white/75">
        Catalogue, panier, checkout, paiement et QR de retrait. Cette base
        frontend est le socle sur lequel le Shop sera branché à l&apos;API.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/shop" className={buttonClassName("primary", "lg")}>
          Voir le catalogue
        </Link>
        <Link href="/cart" className={buttonClassName("secondary", "lg")}>
          Ouvrir le panier
        </Link>
      </div>
    </section>
  );
}
