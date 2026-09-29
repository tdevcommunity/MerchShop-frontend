export type AppEnv = "development" | "test" | "production";

function parseAppEnv(value: string | undefined): AppEnv {
  if (value === "production" || value === "test" || value === "development") {
    return value;
  }
  return "development";
}

/**
 * Variables publiques uniquement.
 * Aucun secret de paiement / JWT / clé privée ne doit transiter ici.
 */
export const env = {
  appEnv: parseAppEnv(
    process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
  ),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "",
};

export const useMockApi = env.apiBaseUrl.length === 0;
