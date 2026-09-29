import type { CurrencyCode, MoneyAmount } from "@/types/money";

export function formatMoney(
  amount: MoneyAmount,
  currency: CurrencyCode = "XOF",
): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
