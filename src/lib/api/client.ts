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
  if (!env.apiBaseUrl || csrfPromise) {
    return csrfPromise;
  }

  csrfPromise = (async () => {
    try {
      const response = await fetch(`${env.apiBaseUrl}${apiEndpoints.csrfToken}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        return cachedCsrfToken;
      }
      const data = (await response.json()) as {
        token?: string;
        csrfToken?: string;
        data?: { token?: string; csrfToken?: string };
      };
      cachedCsrfToken =
        data.csrfToken ??
        data.token ??
        data.data?.csrfToken ??
        data.data?.token ??
        cachedCsrfToken;
      return cachedCsrfToken;
    } catch {
      return cachedCsrfToken;
    } finally {
      csrfPromise = null;
    }
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
  const match = path.match(/\/orders\/([0-9a-fA-F-]{36})/);
  return match?.[1] ? getOrderGuestToken(match[1]) : null;
}

async function handleResponseError(response: Response): Promise<never> {
  let errorData: LaravelErrorResponse | null = null;
  try {
    errorData = (await response.json()) as LaravelErrorResponse;
  } catch {
    // The API may return an empty or non-JSON error response.
  }

  const message =
    errorData?.error?.message ||
    errorData?.message ||
    `La requête a échoué (${response.status}).`;
  const code =
    errorData?.error?.code ||
    (response.status === 404 ? "not_found" : "api");

  if (response.status === 422) {
    const rawFields = errorData?.error?.details?.fields || errorData?.errors;
    const fields: Record<string, string> = {};
    if (rawFields) {
      for (const [key, value] of Object.entries(rawFields)) {
        fields[key] = Array.isArray(value) ? value.join(" ") : String(value);
      }
    }
    throw new ValidationError(fields, message);
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
    throw new ApiError(503, "L'API backend n'est pas configurée.", "api_unconfigured");
  }

  const { body, headers, orderToken, skipCsrf, method = "GET", ...rest } = options;
  const upperMethod = method.toUpperCase();
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(upperMethod);
  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string>),
  };

  const activeOrderToken = resolveOrderToken(path, orderToken);
  if (activeOrderToken) {
    requestHeaders["X-Order-Token"] = activeOrderToken;
  }

  if (isMutating && !skipCsrf) {
    const xsrfCookie = getCookie("XSRF-TOKEN");
    if (!cachedCsrfToken && !xsrfCookie) {
      await fetchCsrfToken();
    }
    const token = cachedCsrfToken || xsrfCookie;
    if (token) {
      requestHeaders["X-CSRF-TOKEN"] = token;
      requestHeaders["X-XSRF-TOKEN"] = token;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...rest,
      cache: "no-store",
      method: upperMethod,
      credentials: "include",
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new NetworkError();
  }

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

  const raw: unknown = await response.json();
  if (raw && typeof raw === "object" && "data" in raw) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}
