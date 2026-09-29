import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { ProductBadge } from "@/types/catalog";

type BadgeTone = "neutral" | "success" | "warning" | "accent" | ProductBadge;

const toneClass: Record<BadgeTone, string> = {
  neutral: "bg-tdev-surface text-tdev-anthracite border-tdev-anthracite",
  success: "bg-tdev-green text-tdev-anthracite border-tdev-anthracite",
  warning: "bg-tdev-orange text-tdev-white border-tdev-anthracite",
  accent: "bg-tdev-yellow text-tdev-anthracite border-tdev-anthracite",
  bestseller: "bg-tdev-yellow text-tdev-anthracite border-tdev-anthracite",
  new: "bg-tdev-green text-tdev-anthracite border-tdev-anthracite",
  limited: "bg-tdev-violet text-tdev-white border-tdev-anthracite",
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.275px]",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
