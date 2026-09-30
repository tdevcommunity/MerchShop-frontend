import { cn } from "@/lib/utils/cn";

type BrandMarkProps = {
  className?: string;
  inverted?: boolean;
};

export function BrandMark({ className, inverted = false }: BrandMarkProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-[34px] shrink-0 items-center justify-center bg-tdev-blue font-headline text-xl font-extrabold text-tdev-white">
        T
      </span>
      <span
        data-brand-wordmark
        className={cn(
          "font-headline text-xl font-extrabold tracking-[-0.5px]",
          inverted ? "text-tdev-white" : "text-tdev-anthracite",
        )}
      >
        TDEV
        <span className={inverted ? "text-tdev-cyan" : "text-tdev-blue"}>
          /SHOP
        </span>
      </span>
    </span>
  );
}
