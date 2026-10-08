/**
 * Une valeur d'audit telle qu'elle arrive de l'API, lisible sur une ligne.
 *
 * `oldValue` / `newValue` sont un JSON en base, donc tantôt une chaîne, tantôt
 * un objet (`{"stock":28}`), tantôt `null`. Rendre l'objet directement dans le
 * tableau fait planter React et, par la frontière d'erreur, la page entière :
 * cette fonction est le seul chemin entre l'API et le JSX.
 *
 * `null` devient le tiret d'attente — l'absence de valeur, pas une valeur vide.
 */
export function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value !== "object") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatAuditValue(item)).join(", ");
  }

  return Object.entries(value)
    .map(([key, entry]) => `${key} : ${formatAuditValue(entry)}`)
    .join(", ");
}
