import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

type TunnelHeaderProps = {
  backHref: string;
  backLabel: string;
  title: string;
  titleAs?: ElementType;
  inverted?: boolean;
  trailing?: ReactNode;
};

export function TunnelHeader({
  backHref,
  backLabel,
  title,
  titleAs: Title = "h1",
  inverted = false,
  trailing,
}: TunnelHeaderProps) {
  return (
    <header
      className={cn(
        "relative border-b",
        inverted
          ? "border-white/10 bg-tdev-anthracite text-tdev-white"
          : "border-tdev-anthracite bg-tdev-white",
      )}
    >
      <div className="flex h-14 items-center px-5 lg:mx-auto lg:h-[72px] lg:max-w-7xl lg:px-12">
        <Link
          href={backHref}
          className={cn(
            "relative z-10 flex size-9 shrink-0 items-center justify-center border",
            inverted ? "border-white/30" : "border-tdev-anthracite",
          )}
          aria-label={backLabel}
        >
          <ChevronLeftIcon className="size-[18px]" />
        </Link>
        <Link href="/" className="relative z-10 ml-3 hidden shrink-0 lg:block">
          <BrandMark inverted={inverted} />
          <span className="sr-only">Accueil TDEV Shop</span>
        </Link>
        <Title
          className={cn(
            "pointer-events-none absolute inset-x-0 text-center font-headline text-sm font-extrabold uppercase tracking-[0.4px]",
            "lg:pointer-events-auto lg:static lg:flex-1 lg:px-4 lg:text-left lg:text-base",
          )}
        >
          {title}
        </Title>
        <span className="ml-auto flex size-9 items-center justify-center lg:w-auto">
          {trailing ?? <span className="size-9" />}
        </span>
      </div>
    </header>
  );
}
