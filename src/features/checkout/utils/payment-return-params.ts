export type OperatorReturnStatus =
  | "approved"
  | "declined"
  | "cancelled"
  | "pending"
  | "unknown";

export function operatorReturnStatus(
  params: URLSearchParams,
): OperatorReturnStatus {
  const raw = (params.get("status") ?? params.get("payment_status") ?? "")
    .trim()
    .toLowerCase();
  if (raw === "approved" || raw === "success" || raw === "successful") {
    return "approved";
  }
  if (raw === "declined" || raw === "failed") {
    return "declined";
  }
  if (raw === "cancelled" || raw === "canceled" || raw === "cancel") {
    return "cancelled";
  }
  if (raw === "pending" || raw === "processing") {
    return "pending";
  }
  return "unknown";
}

/**
 * Velto renvoie souvent status=pending avec close=true quand l'acheteur ferme
 * ou annule le checkout, sans passer par cancelled cote URL.
 */
export function isOperatorPaymentAbandoned(params: URLSearchParams): boolean {
  const close = (params.get("close") ?? "").trim().toLowerCase();
  if (close === "true" || close === "1" || close === "yes") {
    return true;
  }

  const status = operatorReturnStatus(params);
  return status === "cancelled" || status === "declined";
}

export const PAYMENT_ABANDONED_MESSAGE =
  "Tu as annulé le paiement. Aucun montant n'a été débité et tu peux réessayer.";

export const PAYMENT_NOT_COMPLETED_MESSAGE =
  "Tu n'as pas finalisé le paiement. Aucun montant n'a été débité et tu peux réessayer.";

/** Retour Velto sans succes explicite (annulation, fermeture, ou pending). */
export function isOperatorReturnWithoutSuccess(
  params: URLSearchParams,
): boolean {
  if (isOperatorPaymentAbandoned(params)) {
    return true;
  }
  return operatorReturnStatus(params) === "pending";
}

export function shouldFastPaymentFollowUp(
  returnStatus: OperatorReturnStatus,
  abandoned: boolean,
): boolean {
  return (
    returnStatus === "approved" ||
    returnStatus === "declined" ||
    returnStatus === "cancelled" ||
    returnStatus === "pending" ||
    abandoned
  );
}

export function failureMessageForReturn(
  params: URLSearchParams,
  genericFailureMessage: string,
): string {
  if (isOperatorPaymentAbandoned(params)) {
    return PAYMENT_ABANDONED_MESSAGE;
  }
  if (operatorReturnStatus(params) === "pending") {
    return PAYMENT_NOT_COMPLETED_MESSAGE;
  }
  return genericFailureMessage;
}
