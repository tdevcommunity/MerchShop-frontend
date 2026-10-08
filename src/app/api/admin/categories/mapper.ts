import type { AdminCategory } from "@/types/admin";

type LaravelCategory = Record<string, unknown>;

/**
 * La representation d'une categorie pour le back-office.
 *
 * `id` est la cle de route : les mises a jour et les suppressions passent par
 * `/api/v1/categories/{uuid}`, qui refuse tout autre format. L'uuid prime sur
 * une eventuelle cle primaire numerique, que l'API ne rend pas d'ailleurs —
 * melanger les deux, comme le faisait `String(category.id ?? category.uuid)`,
 * basculerait silencieusement les routes d'ecriture sur un identifiant que la
 * route ne sait pas lire.
 *
 * `sortOrder` n'expose pas l'API et la table `categories` n'a pas de colonne
 * d'ordre : la valeur retombe sur 0 plutot que d'afficher un `NaN`.
 */
export function toAdminCategory(category: LaravelCategory): AdminCategory {
  const active =
    typeof category.active === "boolean"
      ? category.active
      : category.status === 1 || category.status === "active";

  return {
    id: String(category.uuid ?? category.id ?? ""),
    slug: String(category.slug ?? ""),
    label: String(category.label ?? category.name ?? ""),
    active,
    sortOrder: Number(category.sortOrder ?? 0),
  };
}

/**
 * Le statut d'une creation de categorie, dans le format de l'API (0 ou 1).
 *
 * La regle par defaut est l'inverse de celle de l'API : une categorie creee
 * depuis le back-office est ACTIVE tant que personne n'a dit l'inverse. Le
 * back-office ne rend que les categories actives (`GET /api/v1/categories`), et
 * une categorie creee masquee disparaitrait immediatement de l'ecran — tout en
 * occupant son slug, ce qui donnerait « slug deja utilise » a la reessai.
 */
function toCatalogStatus(value: unknown): 0 | 1 {
  if (value === 0 || value === "0" || value === false || value === "inactive") {
    return 0;
  }

  return 1;
}

/**
 * Le payload d'une creation de categorie, dans la forme attendue par l'API.
 *
 * Le back-office envoie `label` et `active` (langage d'ecran) ; l'API attend
 * `name` et `status` (langage de la base). La traduction se fait ici une seule
 * fois : posée dans la route, elle se retrouverait copiée a l'identique dans
 * la prochaine route qui cree une ressource.
 */
export function toLaravelCategoryCreatePayload(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const { active, label, ...rest } = body;

  return {
    ...rest,
    name: rest.name ?? label,
    status: toCatalogStatus(rest.status ?? active),
  };
}
