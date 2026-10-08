import { cn } from "@/lib/utils/cn";
import { statusLabel } from "@/features/admin/labels";

const TONES: Record<string, string> = {
  published: "bg-tdev-green text-tdev-white",
  draft: "bg-[#f0f0ee] text-tdev-anthracite",
  archived: "bg-tdev-anthracite text-tdev-white",
  paid: "bg-tdev-green text-tdev-white",
  success: "bg-tdev-green text-tdev-white",
  ready_for_pickup: "bg-tdev-blue text-tdev-white",
  picked_up: "bg-tdev-green text-tdev-white",
  completed: "bg-tdev-green text-tdev-white",
  pending: "bg-tdev-yellow text-tdev-anthracite",
  awaiting_payment: "bg-tdev-yellow text-tdev-anthracite",
  processing: "bg-tdev-yellow text-tdev-anthracite",
  failed: "bg-tdev-orange text-tdev-white",
  payment_failed: "bg-tdev-orange text-tdev-white",
  cancelled: "bg-[#f0f0ee] text-tdev-muted",
  refunded: "bg-tdev-orange text-tdev-white",
  expired: "bg-[#f0f0ee] text-tdev-muted",
  shipped: "bg-tdev-blue text-tdev-white",
  unknown: "bg-[#f0f0ee] text-tdev-muted",
  available: "bg-tdev-green text-tdev-white",
  low: "bg-tdev-yellow text-tdev-anthracite",
  out: "bg-tdev-orange text-tdev-white",
  disabled: "bg-[#f0f0ee] text-tdev-muted",
  active: "bg-tdev-green text-tdev-white",
  inactive: "bg-[#f0f0ee] text-tdev-muted",
  admin: "bg-tdev-blue text-tdev-white",
  staff: "bg-tdev-anthracite text-tdev-white",
};

type StatusBadgeProps = {
  value: unknown;
};

export function StatusBadge({ value }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex px-2 py-0.5 text-[11px] font-extrabold uppercase",
        typeof value === "string"
          ? TONES[value] ?? "bg-[#f0f0ee] text-tdev-anthracite"
          : "bg-[#f0f0ee] text-tdev-anthracite",
      )}
    >
      {statusLabel(value)}
    </span>
  );
}
