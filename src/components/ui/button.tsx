import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-tdev-yellow text-tdev-black hover:bg-[#ffe84a] focus-visible:ring-tdev-yellow",
  secondary:
    "bg-tdev-white text-tdev-black border border-tdev-black/15 hover:bg-tdev-black/5 focus-visible:ring-tdev-blue",
  ghost:
    "bg-transparent text-tdev-white hover:bg-white/10 focus-visible:ring-tdev-cyan",
  danger:
    "bg-tdev-orange text-tdev-white hover:bg-[#ff7d3a] focus-visible:ring-tdev-orange",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tdev-black",
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
