"use client";

import { Button } from "@/components/ui/button";
import { MAX_LINE_QUANTITY } from "@/features/cart/utils";

type QuantityStepperProps = {
  id?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label: string;
};

export function QuantityStepper({
  id,
  value,
  min = 1,
  max = MAX_LINE_QUANTITY,
  onChange,
  label,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center border border-tdev-anthracite">
      <Button
        variant="ghost"
        size="sm"
        className="min-h-11 min-w-11 rounded-none"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Diminuer ${label}`}
      >
        −
      </Button>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 w-12 border-x border-tdev-anthracite bg-tdev-white text-center tabular-nums"
      />
      <Button
        variant="ghost"
        size="sm"
        className="min-h-11 min-w-11 rounded-none"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Augmenter ${label}`}
      >
        +
      </Button>
    </div>
  );
}
