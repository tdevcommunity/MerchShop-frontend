export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export class NetworkError extends AppError {
  constructor(message = "Le réseau est indisponible. Réessaie dans un instant.") {
    super("network", message);
    this.name = "NetworkError";
  }
}

export class ApiError extends AppError {
  readonly status: number;

  constructor(status: number, message: string, code = "api") {
    super(code, message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class ValidationError extends AppError {
  readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>, message = "Certaines informations sont invalides.") {
    super("validation", message);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Contenu introuvable.") {
    super("not_found", message);
    this.name = "NotFoundError";
  }
}

const API_ERROR_MESSAGES: Record<string, string> = {
  PAYMENT_PROVIDER_UNAVAILABLE:
    "Le paiement est indisponible pour le moment. Réessaie dans un instant.",
  PAYMENT_PROVIDER_NOT_CONFIGURED:
    "Le paiement n'est pas disponible pour le moment.",
  VELTO_LIVE_HTTPS_CALLBACK_REQUIRED:
    "Paiement live : configure une URL de retour HTTPS (https://ton-shop/...) sur l'API. http://localhost ne fonctionne pas avec les clés live.",
  ORDER_ALREADY_PAID: "Cette commande est déjà payée.",
  ORDER_NOT_PAYABLE: "Cette commande ne peut plus être payée.",
  PICKUP_NOT_CONFIGURED:
    "Le paiement est confirmé côté opérateur, mais le retrait au stand n'est pas configuré sur le serveur. Contacte l'équipe technique.",
  OUT_OF_STOCK: "Un article n'est plus disponible en quantité suffisante.",
  INVALID_CUSTOMER_PHONE:
    "Ce numéro n'est pas valide pour Mobile Money. Utilise un mobile togolais de 8 chiffres commençant par 7 ou 9.",
  VALIDATION_ERROR: "Certaines informations sont invalides.",
  not_found: "Contenu introuvable.",
  api_unconfigured: "Le service est indisponible pour le moment.",
};

/**
 * Message affichable en boutique : jamais de code HTTP, de code technique
 * ni de message brut renvoyé par l'API (sauf erreurs de validation par champ).
 */
export function userMessageForApiError(status: number, code: string): string {
  const trimmed = code.trim();
  const byCode =
    API_ERROR_MESSAGES[trimmed] ??
    API_ERROR_MESSAGES[trimmed.toLowerCase()] ??
    API_ERROR_MESSAGES[trimmed.toUpperCase()];

  if (byCode) {
    return byCode;
  }

  if (status === 401 || status === 403) {
    return "Tu n'as pas accès à cette action.";
  }
  if (status === 404) {
    return "Contenu introuvable.";
  }
  if (status === 409) {
    return "Cette action n'est plus possible pour cette commande.";
  }
  if (status === 422) {
    return "Certaines informations sont invalides.";
  }
  if (status >= 500 || status === 502 || status === 503) {
    return "Service temporairement indisponible. Réessaie dans un instant.";
  }

  return "Une erreur est survenue. Réessaie dans un instant.";
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return "Certaines informations sont invalides.";
  }
  if (error instanceof NetworkError) {
    return error.message;
  }
  if (error instanceof NotFoundError) {
    return "Contenu introuvable.";
  }
  if (error instanceof ApiError) {
    return userMessageForApiError(error.status, error.code);
  }
  if (error instanceof AppError) {
    return error.message;
  }
  return "Une erreur inattendue s'est produite.";
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof NotFoundError || (error instanceof ApiError && error.status === 404);
}
