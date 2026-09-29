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
  constructor(message = "Ressource introuvable.") {
    super("not_found", message);
    this.name = "NotFoundError";
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return "Une erreur inattendue s'est produite.";
  }
  return "Une erreur inattendue s'est produite.";
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof NotFoundError || (error instanceof ApiError && error.status === 404);
}
