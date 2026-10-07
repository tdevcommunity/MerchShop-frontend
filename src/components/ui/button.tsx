import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "brand" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-tdev-yellow text-tdev-anthracite hover:bg-[#ffe84a] focus-visible:ring-tdev-yellow",
  brand:
    "bg-tdev-blue text-tdev-white hover:bg-[#0f4de0] focus-visible:ring-tdev-blue",
  secondary:
    "bg-tdev-white text-tdev-anthracite border border-tdev-anthracite hover:bg-tdev-surface focus-visible:ring-tdev-blue",
  ghost:
    "bg-transparent text-tdev-anthracite hover:bg-tdev-surface focus-visible:ring-tdev-cyan",
  danger:
    "bg-tdev-orange text-tdev-white hover:bg-[#ff7d3a] focus-visible:ring-tdev-orange",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-14 px-7 text-[15px] font-bold uppercase tracking-[0.375px]",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "motion-lift motion-press motion-icon-shift inline-flex items-center justify-center gap-2 rounded-none font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tdev-white",
    "disabled:pointer-events-none disabled:opacity-50",
    variantClass[variant],
    sizeClass[size],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, size, className)}
      {...props}
    />
  );
}
