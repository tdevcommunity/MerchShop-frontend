import { ArrowRightIcon } from "@/components/ui/icons";
import { buttonClassName } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils/format-money";

type CheckoutFooterBarProps = {
  total: number;
  actionLabel: string;
  disabled?: boolean;
  loading?: boolean;
  formId?: string;
  onClick?: () => void;
};

export function CheckoutFooterBar({
  total,
  actionLabel,
  disabled,
  loading,
  formId,
  onClick,
}: CheckoutFooterBarProps) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="shrink-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.275px] text-[#9a9a9a]">
          Total estimé
        </p>
        <p className="font-headline text-xl font-extrabold leading-none">
          {formatMoney(total)}
        </p>
      </div>
      <button
        type={formId ? "submit" : "button"}
        form={formId}
        onClick={onClick}
        disabled={disabled || loading}
        className={buttonClassName("brand", "lg", "flex-1")}
      >
        {loading ? "…" : actionLabel}
        <ArrowRightIcon className="size-[18px] text-tdev-yellow" />
      </button>
    </div>
  );
}
