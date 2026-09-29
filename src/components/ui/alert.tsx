import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type AlertTone = "info" | "success" | "error";

const toneClass: Record<AlertTone, string> = {
  info: "border-tdev-cyan/40 bg-tdev-cyan/10 text-tdev-white",
  success: "border-tdev-green/40 bg-tdev-green/10 text-tdev-white",
  error: "border-tdev-orange/40 bg-tdev-orange/10 text-tdev-white",
};

type AlertProps = {
  title: string;
  children?: ReactNode;
  tone?: AlertTone;
  className?: string;
};

export function Alert({ title, children, tone = "info", className }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-md border px-4 py-3", toneClass[tone], className)}
    >
      <p className="font-medium">{title}</p>
      {children ? <div className="mt-1 text-sm text-white/80">{children}</div> : null}
    </div>
  );
}
