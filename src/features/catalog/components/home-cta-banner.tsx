import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { buttonClassName } from "@/components/ui/button";

export function HomeCtaBanner() {
  return (
    <section
      id="festival"
      className="flex flex-col items-center justify-center gap-6 border-b border-tdev-anthracite bg-tdev-blue px-5 py-[72px] text-center"
    >
      <h2 className="font-headline text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-tdev-white lg:text-[56px]">
        Rejoins le mouvement
      </h2>
      <p className="max-w-[520px] text-[17px] text-[#dbe6ff]">
        Chaque achat te donne un QR Code de retrait et te fait vivre le festival
        avant l&apos;heure.
      </p>
      <Link href="/shop" className={buttonClassName("primary", "lg")}>
        Acheter maintenant
        <ArrowRightIcon className="size-[18px]" />
      </Link>
    </section>
  );
}
