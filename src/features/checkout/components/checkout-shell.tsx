import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { CheckoutStepper } from "@/features/checkout/components/checkout-stepper";
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
  const hasSidebar = Boolean(summary || footer);

  return (
    <div className="flex min-h-dvh flex-col bg-tdev-white lg:bg-tdev-surface">
      <header className="border-b border-tdev-anthracite bg-tdev-white">
        <div className="flex h-14 items-center gap-3 px-5 lg:mx-auto lg:h-[72px] lg:max-w-7xl lg:px-12">
          <Link
            href={backHref}
            className="flex size-9 shrink-0 items-center justify-center border border-tdev-anthracite"
            aria-label="Retour"
          >
            <ChevronLeftIcon className="size-[18px]" />
          </Link>
          <Link href="/" className="hidden shrink-0 lg:block">
            <BrandMark />
            <span className="sr-only">Accueil TDEV Shop</span>
          </Link>
          <h1 className="min-w-0 flex-1 font-headline text-[17px] font-extrabold uppercase tracking-[0.425px] lg:text-xl">
            {title}
          </h1>
          <p className="shrink-0 text-[13px] font-bold text-tdev-muted">
            {stepIndex}/4
          </p>
        </div>
      </header>
      <CheckoutStepper current={current} />
      <div className="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-7xl lg:flex-row lg:items-stretch lg:gap-12 lg:px-12 lg:py-12">
        <div className="flex flex-1 flex-col px-5 py-[22px] lg:min-h-[calc(100dvh-11.5rem)] lg:px-0 lg:py-0">
          {children}
        </div>
        {hasSidebar ? (
          <div className="hidden w-[24rem] shrink-0 lg:sticky lg:top-8 lg:flex lg:h-fit lg:flex-col lg:gap-4">
            {summary}
            {footer ? (
              <div className="border border-tdev-anthracite bg-tdev-white p-4">
                {footer}
              </div>
            ) : null}
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
