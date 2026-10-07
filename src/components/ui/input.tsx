import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, error, hint, className, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-tdev-anthracite"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "min-h-[50px] w-full rounded-none border bg-tdev-white px-3 text-tdev-anthracite",
          "transition-[border-color,box-shadow] duration-150",
          "placeholder:text-tdev-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tdev-blue",
          error ? "motion-shake border-tdev-orange" : "border-tdev-anthracite",
          className,
        )}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-xs text-tdev-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="motion-enter text-xs text-tdev-orange">
          {error}
        </p>
      ) : null}
    </div>
  );
});
