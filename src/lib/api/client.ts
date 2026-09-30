import { env } from "@/lib/config/env";
import { ApiError, NetworkError } from "@/lib/api/errors";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${env.apiBaseUrl}${env.apiBaseUrl ? "/api/v1/auth/csrf-token" : "/auth/csrf-token"}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = (await res.json()) as { token?: string; data?: { token?: string } };
  return data.token ?? data.data?.token ?? "";
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "message" in data && typeof (data as Record<string, unknown>).message === "string") {
      return (data as { message: string }).message;
    }
    if (data && typeof data === "object" && "data" in data) {
      const inner = (data as Record<string, unknown>).data;
      if (inner && typeof inner === "object" && "message" in inner) {
        return String((inner as Record<string, unknown>).message);
      }
    }
  } catch {
    // non-JSON
  }
  return `La requête a échoué (${response.status}).`;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!env.apiBaseUrl) {
    throw new ApiError(
      503,
      "L'API backend n'est pas configurée.",
      "api_unconfigured"
    );
  }

  const { body, headers, ...rest } = options;
  const url = `${env.apiBaseUrl}${path}`;

  const csrfToken = await fetchCsrfToken();
  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
    ...headers,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new NetworkError();
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const raw: unknown = await response.json();

  // Unwrap Laravel standard `{ data, links?, meta? }` envelope.
  if (raw && typeof raw === "object" && "data" in raw) {
    const envelope = raw as Record<string, unknown>;
    // For paginated collections: return the collection (array) but also preserve meta?
    // The consumer expects the array; meta is ignored for now.
    return envelope.data as T;
  }

  return raw as T;
}
