"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MAX_LINE_QUANTITY } from "@/features/cart/utils";
import { cn } from "@/lib/utils/cn";

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
  const [pulse, setPulse] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 180);
    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex w-fit max-w-full shrink-0 items-center border border-tdev-anthracite">
      <Button
        variant="ghost"
        size="sm"
        className="min-h-11 min-w-11 shrink-0 rounded-none"
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
        className={cn(
          "h-11 w-12 shrink-0 border-x border-tdev-anthracite bg-tdev-white text-center tabular-nums",
          pulse && "motion-pop",
        )}
      />
      <Button
        variant="ghost"
        size="sm"
        className="min-h-11 min-w-11 shrink-0 rounded-none"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Augmenter ${label}`}
      >
        +
      </Button>
    </div>
  );
}
