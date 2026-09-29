import { CHECKOUT_STEPS, type CheckoutStep } from "@/types/checkout";
import { cn } from "@/lib/utils/cn";

const stepLabel: Record<CheckoutStep, string> = {
  fulfillment: "Mode",
  information: "Infos",
  payment: "Paiement",
  confirmation: "Confirmation",
};

type CheckoutStepperProps = {
  current: CheckoutStep;
};

export function CheckoutStepper({ current }: CheckoutStepperProps) {
  const currentIndex = CHECKOUT_STEPS.indexOf(current);

  return (
    <div className="border-b border-tdev-border bg-tdev-surface">
      <ol className="flex items-start gap-1.5 px-5 py-3.5 lg:mx-auto lg:w-full lg:max-w-7xl lg:px-12">
        {CHECKOUT_STEPS.map((step, index) => {
          const reached = index <= currentIndex;
          return (
            <li key={step} className="flex flex-1 flex-col gap-1.5">
              <span
                className={cn("block h-1 w-full", reached ? "bg-tdev-blue" : "bg-[#d5d5d2]")}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.275px]",
                  reached ? "text-tdev-anthracite" : "text-[#9a9a9a]",
                )}
              >
                {stepLabel[step]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
