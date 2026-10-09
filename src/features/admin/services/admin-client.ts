export class AdminClientError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function firstValidationMessage(
  fields: Record<string, string[] | string> | undefined,
): string | null {
  if (!fields || typeof fields !== "object") {
    return null;
  }
  for (const value of Object.values(fields)) {
    if (Array.isArray(value) && typeof value[0] === "string" && value[0]) {
      return value[0];
    }
    if (typeof value === "string" && value) {
      return value;
    }
  }
  return null;
}

export async function adminRequest<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: unknown } = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const response = await fetch(path, {
    ...rest,
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && !(body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    let message = "Impossible de traiter la demande.";
    try {
      const data = (await response.json()) as {
        message?: string;
        error?: {
          message?: string;
          details?: { fields?: Record<string, string[] | string> };
        };
        details?: { fields?: Record<string, string[] | string> };
        errors?: Record<string, string[] | string>;
      };
      const fields =
        data.details?.fields ?? data.error?.details?.fields ?? data.errors;
      const firstFieldMessage = firstValidationMessage(fields);
      message =
        firstFieldMessage ||
        data.error?.message ||
        data.message ||
        message;
    } catch {
      // ignore
    }
    throw new AdminClientError(response.status, message);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

/**
 * Une liste, quelle que soit la forme renvoyee par la route BFF.
 *
 * Les routes paginees (laravelList) renvoient `{ data, meta }`, les autres un
 * tableau nu. Les ecrans qui n'ont besoin que des lignes passent par ici, ce
 * qui evite qu'un changement de forme cote API fasse planter tout le
 * back-office (`.filter is not a function` dans le shell).
 */
export async function adminList<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: unknown } = {},
): Promise<T[]> {
  const result = await adminRequest<T[] | { data?: T[] } | null>(path, options);
  if (Array.isArray(result)) {
    return result;
  }
  return Array.isArray(result?.data) ? result.data : [];
}
