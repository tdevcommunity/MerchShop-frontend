import type { ReactNode } from "react";

type CheckoutStepIntroProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export function CheckoutStepIntro({
  eyebrow,
  title,
  children,
}: CheckoutStepIntroProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-tdev-muted lg:block">
        {eyebrow}
      </p>
      <h2 className="font-headline text-3xl font-extrabold uppercase leading-[0.95] tracking-tight lg:text-5xl lg:leading-[0.95]">
        {title}
      </h2>
      <p className="text-sm text-tdev-muted lg:max-w-xl lg:text-base">{children}</p>
    </div>
  );
}
