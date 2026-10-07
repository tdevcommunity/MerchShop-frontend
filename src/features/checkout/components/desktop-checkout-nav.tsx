import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import type { CheckoutStep } from "@/types/checkout";

export type DesktopCheckoutPhase =
  | CheckoutStep
  | "processing";

type DesktopCheckoutNavProps = {
  current: DesktopCheckoutPhase;
  inverted?: boolean;
};

const STEPS = [
  {
    id: 1,
    light: "Récupération & infos",
    dark: "1. Récupération",
  },
  {
    id: 2,
    light: "Paiement",
    dark: "2. Paiement en cours",
  },
  {
    id: 3,
    light: "Confirmation",
    dark: "3. Confirmation",
  },
] as const;

function visualIndex(current: DesktopCheckoutPhase): number {
  if (current === "fulfillment" || current === "information") {
    return 0;
  }
  if (current === "payment" || current === "processing") {
    return 1;
  }
  return 2;
}

export function DesktopCheckoutNav({
  current,
  inverted = false,
}: DesktopCheckoutNavProps) {
  const active = visualIndex(current);

  return (
    <ol className="hidden items-center gap-8 lg:flex">
      {STEPS.map((step, index) => {
        const completed = index < active;
        const currentStep = index === active;
        const label = inverted ? step.dark : step.light;

        return (
          <li key={step.id} className="flex items-center gap-8">
            {index > 0 ? (
              <span
                className={cn(
                  "block h-px w-8",
                  inverted
                    ? "h-0.5 w-6 bg-[#33383a]"
                    : currentStep || completed
                      ? "bg-tdev-anthracite"
                      : "bg-[#c5c5c5]",
                )}
                aria-hidden="true"
              />
            ) : null}
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center font-headline text-xs font-bold",
                  inverted && "size-5 text-[11px]",
                  completed
                    ? inverted
                      ? "bg-tdev-green text-tdev-white"
                      : "bg-tdev-blue text-tdev-white"
                    : currentStep
                      ? inverted
                        ? "bg-tdev-yellow text-tdev-anthracite"
                        : "bg-tdev-blue text-tdev-white"
                      : inverted
                        ? "border border-[#444a4d] text-[#696f72]"
                        : "border border-[#c5c5c5] text-[#8a8f91]",
                )}
              >
                {completed ? (
                  <CheckIcon className="size-3" />
                ) : (
                  step.id
                )}
              </span>
              <span
                className={cn(
                  "font-headline text-xs font-bold uppercase tracking-[0.6px]",
                  inverted && "font-sans",
                  completed
                    ? inverted
                      ? "text-tdev-green"
                      : "text-tdev-blue"
                    : currentStep
                      ? inverted
                        ? "text-tdev-yellow"
                        : "text-tdev-blue"
                      : inverted
                        ? "text-[#696f72]"
                        : "text-[#8a8f91]",
                )}
              >
                {label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
