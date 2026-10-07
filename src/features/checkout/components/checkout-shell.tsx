import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { ChevronLeftIcon, LockIcon } from "@/components/ui/icons";
import { CheckoutStepper } from "@/features/checkout/components/checkout-stepper";
import { DesktopCheckoutNav } from "@/features/checkout/components/desktop-checkout-nav";
import type { CheckoutStep } from "@/types/checkout";

type CheckoutShellProps = {
  title: string;
  stepIndex: 1 | 2 | 3 | 4;
  current: CheckoutStep;
  backHref: string;
  children: ReactNode;
  summary?: ReactNode;
  footer?: ReactNode;
};

export function CheckoutShell({
  title,
  stepIndex,
  current,
  backHref,
  children,
  summary,
  footer,
}: CheckoutShellProps) {
  const hasSidebar = Boolean(summary);

  return (
    <div className="flex min-h-dvh flex-col bg-tdev-white lg:bg-[#fcfcfc]">
      <header className="border-b border-tdev-anthracite bg-tdev-white">
        <div className="flex h-14 items-center gap-3 px-5 lg:mx-auto lg:h-[72px] lg:max-w-[1280px] lg:justify-between lg:px-12">
          <Link
            href={backHref}
            className="flex size-9 shrink-0 items-center justify-center border border-tdev-anthracite lg:hidden"
            aria-label="Retour"
          >
            <ChevronLeftIcon className="size-[18px]" />
          </Link>
          <Link href="/" className="hidden shrink-0 lg:block">
            <BrandMark />
            <span className="sr-only">Accueil TDEV Shop</span>
          </Link>
          <h1 className="min-w-0 flex-1 font-headline text-[17px] font-extrabold uppercase tracking-[0.425px] lg:hidden">
            {title}
          </h1>
          <p className="shrink-0 text-[13px] font-bold text-tdev-muted lg:hidden">
            {stepIndex}/4
          </p>
          <DesktopCheckoutNav current={current} />
          <p className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.6px] text-tdev-muted lg:flex">
            <LockIcon className="size-4 text-tdev-green" />
            Checkout sécurisé
          </p>
        </div>
      </header>
      <div className="lg:hidden">
        <CheckoutStepper current={current} />
      </div>
      <div className="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-[1280px] lg:grid lg:grid-cols-12 lg:gap-10 lg:px-12 lg:py-10">
        <div className="motion-page flex flex-1 flex-col px-5 py-[22px] lg:col-span-7 lg:px-0 lg:py-0">
          {children}
        </div>
        {hasSidebar ? (
          <div className="hidden lg:sticky lg:top-8 lg:col-span-5 lg:flex lg:h-fit lg:flex-col">
            {summary}
          </div>
        ) : null}
      </div>
      {footer ? (
        <div className="sticky bottom-0 border-t border-tdev-anthracite bg-tdev-white px-5 py-4 lg:hidden">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
