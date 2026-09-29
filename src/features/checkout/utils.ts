import { formatMoney } from "@/lib/utils/format-money";
import { DELIVERY_METHODS } from "@/types/delivery";
import type { DeliveryMethod } from "@/types/delivery";
import type { MobileOperator } from "@/types/checkout";
import type { PaymentMethod } from "@/types/payment";

export const PICKUP_STAND_NOTE = "Stand Merch - Village TDEV • 12-14 juin 2026";

export function deliveryLabel(method: DeliveryMethod | null): string {
  if (method === DELIVERY_METHODS.PICKUP_EVENT) {
    return "Retrait jour J";
  }
  if (method === DELIVERY_METHODS.DELIVERY) {
    return "Livraison";
  }
  return "Non choisi";
}

export function paymentLabel(method: PaymentMethod | null): string {
  if (method === "mobile_money") {
    return "Mobile Money";
  }
  if (method === "card") {
    return "Carte bancaire";
  }
  return "Non choisi";
}

export function operatorLabel(operator: MobileOperator | null): string {
  if (operator === "mixx") {
    return "Mixx By Yas (Togo)";
  }
  if (operator === "moov") {
    return "Moov Money (Togo)";
  }
  return "Mobile Money";
}

export function customerFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function formatShippingAddress(address: {
  line1: string;
  line2?: string;
  city: string;
  country: string;
}): string {
  if (address.line2?.trim()) {
    return address.line2.trim();
  }
  return [address.line1, address.city, address.country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export function indicativeTotal(amount: number): string {
  return formatMoney(amount);
}
