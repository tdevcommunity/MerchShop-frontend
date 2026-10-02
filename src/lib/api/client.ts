import { env } from "@/lib/config/env";
import {
  ApiError,
  NetworkError,
  NotFoundError,
  ValidationError,
} from "@/lib/api/errors";
import { apiEndpoints } from "@/lib/api/endpoints";
import { getOrderGuestToken } from "@/lib/api/order-token";
import type { LaravelErrorResponse } from "@/lib/api/types";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  orderToken?: string | null;
  skipCsrf?: boolean;
};

let cachedCsrfToken: string | null = null;
let csrfPromise: Promise<string | null> | null = null;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match && typeof match[3] === "string" ? decodeURIComponent(match[3]) : null;
}

export async function fetchCsrfToken(): Promise<string | null> {
  if (!env.apiBaseUrl) {
    return null;
  }
  if (csrfPromise) {
    return csrfPromise;
  }

  csrfPromise = (async () => {
    try {
      const response = await fetch(`${env.apiBaseUrl}${apiEndpoints.csrfToken}`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        const data = (await response.json()) as {
          data?: { csrfToken?: string };
          csrfToken?: string;
        };
        const token = data.data?.csrfToken || data.csrfToken || null;
        if (token) {
          cachedCsrfToken = token;
        }
        return cachedCsrfToken;
      }
    } catch {
      // ignore network errors on CSRF prefetch
    } finally {
      csrfPromise = null;
    }
    return cachedCsrfToken;
  })();

  return csrfPromise;
}

export function setCachedCsrfToken(token: string | null): void {
  cachedCsrfToken = token;
}

function resolveOrderToken(path: string, explicitToken?: string | null): string | null {
  if (explicitToken) {
    return explicitToken;
  }
  // Try to match order UUID in path: e.g. /orders/uuid or /orders/uuid/qr
  const match = path.match(/\/orders\/([0-9a-fA-F-]{36})/);
  if (match?.[1]) {
    return getOrderGuestToken(match[1]);
  }
  return null;
}

async function handleResponseError(response: Response): Promise<never> {
  let errorData: LaravelErrorResponse | null = null;
  try {
    errorData = (await response.json()) as LaravelErrorResponse;
  } catch {
    // not JSON
  }

  const message =
    errorData?.error?.message ||
    errorData?.message ||
    `La requête a échoué (${response.status}).`;

  const code = errorData?.error?.code || (response.status === 404 ? "not_found" : "api");

  // Handle Laravel 422 Validation Error
  if (response.status === 422) {
    const rawFields = errorData?.error?.details?.fields || errorData?.errors;
    const flatFields: Record<string, string> = {};
    if (rawFields && typeof rawFields === "object") {
      for (const [key, val] of Object.entries(rawFields)) {
        flatFields[key] = Array.isArray(val) ? val.join(" ") : String(val);
      }
    }
    throw new ValidationError(flatFields, message);
  }

  if (response.status === 404) {
    throw new NotFoundError(message);
  }

  throw new ApiError(response.status, message, code);
}

export async function apiRequestRaw(
  path: string,
  options: ApiRequestOptions = {},
  isRetry = false,
): Promise<Response> {
  if (!env.apiBaseUrl) {
    throw new ApiError(
      503,
      "L'API backend n'est pas configurée.",
      "api_unconfigured",
    );
  }

  const { body, headers, orderToken, skipCsrf, method = "GET", ...rest } = options;
  const upperMethod = method.toUpperCase();
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(upperMethod);

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
  };

  // Attach Order Token if available
  const activeOrderToken = resolveOrderToken(path, orderToken);
  if (activeOrderToken) {
    requestHeaders["X-Order-Token"] = activeOrderToken;
  }

  // Handle CSRF for mutating requests
  if (isMutating && !skipCsrf) {
    const xsrfCookie = getCookie("XSRF-TOKEN");
    if (!cachedCsrfToken && !xsrfCookie) {
      await fetchCsrfToken();
    }
    const tokenToSend = cachedCsrfToken || xsrfCookie;
    if (tokenToSend) {
      requestHeaders["X-CSRF-TOKEN"] = tokenToSend;
      requestHeaders["X-XSRF-TOKEN"] = tokenToSend;
    }
  }

  const url = `${env.apiBaseUrl}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      ...rest,
      method: upperMethod,
      credentials: "include",
      headers: {
        ...requestHeaders,
        ...(headers as Record<string, string>),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new NetworkError();
  }

  // Handle 419 CSRF mismatch retry once
  if (response.status === 419 && isMutating && !isRetry) {
    cachedCsrfToken = null;
    await fetchCsrfToken();
    return apiRequestRaw(path, options, true);
  }

  return response;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await apiRequestRaw(path, options);

  if (!response.ok) {
    await handleResponseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
