/**
 * Pass de retrait affiché par le Shop.
 * Le hash de sécurité et la validation cryptographique restent côté backend / Chantier 3B.
 */
export const QR_STATUSES = ["pending", "ready", "unavailable"] as const;

export type QrStatus = (typeof QR_STATUSES)[number];

export type PickupQr = {
  orderUuid: string;
  status: QrStatus;
  imageUrl: string | null;
  alt: string;
};
