import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({
  id,
  label,
  error,
  hint,
  className,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-tdev-white">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "min-h-11 w-full rounded-md border bg-tdev-anthracite px-3 text-tdev-white",
          "placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tdev-blue",
          error ? "border-tdev-orange" : "border-white/15",
          className,
        )}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-xs text-white/60">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-tdev-orange">
          {error}
        </p>
      ) : null}
    </div>
  );
}
