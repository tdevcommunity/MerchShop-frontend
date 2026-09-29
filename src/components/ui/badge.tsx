import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeTone = "neutral" | "success" | "warning" | "accent";

const toneClass: Record<BadgeTone, string> = {
  neutral: "bg-white/10 text-tdev-white",
  success: "bg-tdev-green/20 text-tdev-green",
  warning: "bg-tdev-orange/20 text-tdev-orange",
  accent: "bg-tdev-yellow text-tdev-black",
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
