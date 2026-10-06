import type { OrderStatus } from "@/types/order";
import type { PaymentStatus } from "@/types/payment";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Brouillon",
  awaiting_payment: "En attente de paiement",
  paid: "Payée",
  processing: "En préparation",
  ready_for_pickup: "Prête au retrait",
  shipped: "Expédiée",
  picked_up: "Retirée",
  completed: "Terminée",
  cancelled: "Annulée",
  expired: "Expirée",
  payment_failed: "Paiement échoué",
  refund_pending: "Remboursement demandé",
  refunded: "Remboursée",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente",
  processing: "En cours",
  success: "Réussi",
  failed: "Échoué",
  cancelled: "Annulé",
  refunded: "Remboursé",
  unknown: "Inconnu",
};

const EXTRA_STATUS_LABELS: Record<string, string> = {
  published: "Publié",
  archived: "Archivé",
  available: "Disponible",
  low: "Stock bas",
  out: "Rupture",
  disabled: "Désactivé",
  active: "Actif",
  inactive: "Inactif",
  admin: "Admin",
  staff: "Staff",
  valid: "Valide",
  used: "Utilisé",
  invalid: "Invalide",
};

export function statusLabel(value: string): string {
  return (
    ORDER_STATUS_LABELS[value as OrderStatus] ??
    PAYMENT_STATUS_LABELS[value as PaymentStatus] ??
    EXTRA_STATUS_LABELS[value] ??
    value.replaceAll("_", " ")
  );
}
