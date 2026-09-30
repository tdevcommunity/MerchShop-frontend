import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const TONES = {
  default:
    "border-tdev-anthracite bg-tdev-white text-tdev-anthracite hover:bg-tdev-surface",
  brand: "border-tdev-blue bg-tdev-blue text-tdev-white hover:bg-[#0f4de0]",
  success: "border-tdev-green bg-tdev-green text-tdev-white hover:bg-[#1f8a4a]",
  danger: "border-tdev-orange bg-tdev-white text-tdev-orange hover:bg-[#fff4ed]",
} as const;

type AdminActionTone = keyof typeof TONES;

const actionClassName = (tone: AdminActionTone, className?: string) =>
  cn(
    "inline-flex min-h-8 items-center justify-center border px-2.5 text-[11px] font-extrabold uppercase tracking-[0.08em]",
    "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tdev-blue focus-visible:ring-offset-1",
    TONES[tone],
    className,
  );

type AdminActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: AdminActionTone;
};

export function AdminAction({
  tone = "default",
  className,
  type = "button",
  ...props
}: AdminActionProps) {
  return <button type={type} className={actionClassName(tone, className)} {...props} />;
}

type AdminActionLinkProps = {
  href: string;
  children: ReactNode;
  tone?: AdminActionTone;
  className?: string;
};

export function AdminActionLink({
  href,
  children,
  tone = "default",
  className,
}: AdminActionLinkProps) {
  return (
    <Link href={href} className={actionClassName(tone, className)}>
      {children}
    </Link>
  );
}
