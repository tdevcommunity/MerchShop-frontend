import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type AlertTone = "info" | "success" | "error";

const toneClass: Record<AlertTone, string> = {
  info: "border-tdev-blue/40 bg-[#eef4ff] text-tdev-anthracite",
  success: "border-tdev-green/40 bg-[#e6ffe0] text-tdev-anthracite",
  error: "border-tdev-orange/40 bg-[#fff4ec] text-tdev-anthracite",
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
      className={cn(
        "motion-enter rounded-none border px-4 py-3",
        tone === "error" && "motion-shake",
        toneClass[tone],
        className,
      )}
    >
      <p className="font-medium">{title}</p>
      {children ? (
        <div className="mt-1 text-sm text-tdev-subtle">{children}</div>
      ) : null}
    </div>
  );
}
