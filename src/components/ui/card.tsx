import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-tdev-anthracite p-4 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
