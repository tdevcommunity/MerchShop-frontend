import type { ReactNode } from "react";

type CheckoutStepIntroProps = {
  eyebrow: string;
  title: string;
  index?: string;
  children: ReactNode;
};

export function CheckoutStepIntro({
  eyebrow,
  title,
  index,
  children,
}: CheckoutStepIntroProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="sr-only">{eyebrow}</p>
      <div className="flex items-center gap-3">
        {index ? (
          <span className="hidden size-7 shrink-0 items-center justify-center bg-tdev-anthracite font-headline text-xs font-extrabold text-tdev-yellow lg:flex">
            {index}
          </span>
        ) : null}
        <h2 className="font-headline text-3xl font-extrabold uppercase leading-[0.95] tracking-tight lg:text-2xl lg:leading-tight lg:tracking-[-0.6px]">
          {title}
        </h2>
      </div>
      <p className="text-sm text-tdev-muted lg:max-w-xl">{children}</p>
    </div>
  );
}
