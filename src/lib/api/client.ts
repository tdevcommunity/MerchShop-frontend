import { env } from "@/lib/config/env";
import { ApiError, NetworkError } from "@/lib/api/errors";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  } catch {
    // réponse non JSON
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
      "api_unconfigured",
    );
  }

  const { body, headers, ...rest } = options;
  const url = `${env.apiBaseUrl}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
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

  return (await response.json()) as T;
}
