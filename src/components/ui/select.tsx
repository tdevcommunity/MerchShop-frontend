import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
};

export function Select({
  id,
  label,
  error,
  options,
  placeholder,
  className,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-tdev-white">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={cn(
          "min-h-11 w-full rounded-md border bg-tdev-anthracite px-3 text-tdev-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tdev-blue",
          error ? "border-tdev-orange" : "border-white/15",
          className,
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" className="text-tdev-black">
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-tdev-black">
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-tdev-orange">
          {error}
        </p>
      ) : null}
    </div>
  );
}
