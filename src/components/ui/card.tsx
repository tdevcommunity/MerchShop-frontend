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
        "rounded-none border border-tdev-anthracite bg-tdev-white p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
