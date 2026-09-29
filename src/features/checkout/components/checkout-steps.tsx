import { CHECKOUT_STEPS, type CheckoutStep } from "@/types/checkout";

const stepLabel: Record<CheckoutStep, string> = {
  customer: "Coordonnées",
  delivery: "Réception",
  review: "Récapitulatif",
  payment: "Paiement",
};

type CheckoutStepsProps = {
  current: CheckoutStep;
};

export function CheckoutSteps({ current }: CheckoutStepsProps) {
  const currentIndex = CHECKOUT_STEPS.indexOf(current);

  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {CHECKOUT_STEPS.map((step, index) => {
        const isCurrent = step === current;
        const isDone = index < currentIndex;
        return (
          <li
            key={step}
            className={
              isCurrent
                ? "rounded-md bg-tdev-yellow px-3 py-2 text-sm font-medium text-tdev-black"
                : isDone
                  ? "rounded-md bg-tdev-green/20 px-3 py-2 text-sm text-tdev-white"
                  : "rounded-md bg-white/5 px-3 py-2 text-sm text-white/50"
            }
          >
            <span className="block text-[11px] uppercase tracking-wide">
              {index + 1}
            </span>
            {stepLabel[step]}
          </li>
        );
      })}
    </ol>
  );
}
