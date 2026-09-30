import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { listShopCategories } from "@/features/catalog/services/catalog-service";
import { siteConfig } from "@/lib/config/site";

const aideLinks = [
  { href: "/checkout", label: "Livraison" },
  { href: "/cart", label: "Retrait jour J" },
  { href: "/shop", label: "Guide des tailles" },
];

export async function SiteFooter() {
  const categories = await listShopCategories();
  const boutiqueLinks = [
    ...categories.map((category) => ({
      href: `/shop?category=${category.slug}`,
      label: category.label,
    })),
    { href: "/shop", label: "Tout le catalogue" },
  ];

  return (
    <footer className="mt-auto bg-tdev-anthracite px-5 py-14 text-tdev-white lg:px-12">
      <div className="flex flex-col gap-12 lg:flex-row">
        <div className="flex max-w-xs flex-col gap-4">
          <BrandMark inverted />
          <p className="text-sm leading-relaxed text-[#9a9a9a]">
            La boutique officielle du {siteConfig.festival}. Merch en édition
            limitée.
          </p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-3">
          <FooterColumn title="Boutique" links={boutiqueLinks} />
          <FooterColumn title="Aide" links={aideLinks} />
          <div className="flex flex-col gap-3">
            <p className="font-headline text-[13px] font-extrabold uppercase tracking-[1.95px] text-tdev-yellow">
              Festival
            </p>
            <p className="text-sm font-medium text-[#c5c5c5]">
              {siteConfig.festival}
            </p>
            <p className="text-xs text-[#9a9a9a]">
              Les montants et QR affichés restent indicatifs tant que le backend
              n&apos;est pas branché.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-headline text-[13px] font-extrabold uppercase tracking-[1.95px] text-tdev-yellow">
        {title}
      </p>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-[#c5c5c5] hover:text-tdev-white"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
