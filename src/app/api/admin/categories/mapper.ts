/**
 * Les traductions entre l'ecran des categories et le contrat de l'API.
 *
 * L'API parle `CatalogStatus` — un entier 0 (masquee) ou 1 (active) — et
 * `name` ; l'ecran, lui, parle `active` et `label`. Les deux routes
 * d'ecriture passent par ici : c'est le seul endroit ou se decide la valeur
 * du statut envoyee a Laravel, pour que creer et modifier ne divergent pas.
 */

type CategoryPayload = Record<string, unknown>;

/** `CatalogStatus::ACTIVE` — categorie visible et achetable. */
const ACTIVE = 1;

/**
 * Le statut 0/1 attendu par l'API, ou `undefined` quand le client n'en a pas
 * donne.
 *
 * `undefined` se serialise en cle absente (JSON.stringify retire les valeurs
 * `undefined`), donc le champ n'est jamais envoye par hasard : c'est le cas
 * d'une mise a jour qui ne touche pas au statut.
 *
 * Avant, la valeur inconnue retombait sur `0` — `... ?? 0` — et une categorie
 * creee depuis le formulaire (qui n'envoie ni `status` ni `active`) partait
 * desactivee : invisible dans le menu, dans les filtres et dans les liens.
 */
export function toLaravelStatus(body: CategoryPayload): 0 | 1 | undefined {
  if (body.active === false) return 0;
  if (body.active === true) return 1;
  if (body.status === "inactive" || body.status === 0 || body.status === "0") return 0;
  if (body.status === "active" || body.status === 1 || body.status === "1") return 1;
  return undefined;
}

/**
 * Les champs que l'API accepte, dans son vocabulaire.
 *
 * `label` devient `name` ; `active` et `status` sont lus par
 * `toLaravelStatus` puis retires : un champ inconnu ne fait pas erreur cote
 * Laravel (il est ignore par la validation), mais il pollue le corps de la
 * requete affiche dans l'onglet Reseau et laisse croire a un envoi reussi.
 */
function toApiFields(body: CategoryPayload): CategoryPayload {
  const payload: CategoryPayload = { ...body };
  const name = body.name ?? body.label;
  const sortOrder = body.sort_order ?? body.sortOrder;

  delete payload.label;
  delete payload.active;
  delete payload.status;
  delete payload.sortOrder;

  if (typeof name === "string" && name !== "") {
    payload.name = name;
  }

  if (sortOrder !== undefined && sortOrder !== null && sortOrder !== "") {
    payload.sort_order = Number(sortOrder);
  }

  return payload;
}

/**
 * Payload d'une creation : le statut y figure toujours.
 *
 * Le formulaire n'a pas de curseur de publication — il n'envoie que le libelle
 * et le slug — et une categorie ajoutee au guichet doit paraitre au catalogue
 * tout de suite. Le defaut est donc `1`, et non le champ omis : le
 * comportement reste le meme si le defaut cote backend changeait un jour.
 */
export function toStoreCategoryPayload(body: CategoryPayload): CategoryPayload {
  return { ...toApiFields(body), status: toLaravelStatus(body) ?? ACTIVE };
}

/**
 * Payload d'une mise a jour partielle : le statut n'y figure que si le client
 * l'a exprime.
 *
 * C'est ce qui rend « Desactiver » possible : `active: false` devient
 * `status: 0`, la ou l'ancienne traduction laissait le champ a `undefined` et
 * la requete partait sans statut — donc sans effet.
 */
export function toUpdateCategoryPayload(body: CategoryPayload): CategoryPayload {
  const payload = toApiFields(body);
  const status = toLaravelStatus(body);

  if (status !== undefined) {
    payload.status = status;
  }

  return payload;
}

/**
 * La forme `AdminCategory` que les ecrans consomment.
 *
 * Les reponses d'ecriture sont ramenees ici aussi : l'API renvoie `name` et
 * `status`, et substituer cette forme brute a une ligne de la liste vidait son
 * libelle et son badge de statut au moment meme ou on changeait ce statut.
 */
export function toAdminCategory(category: CategoryPayload) {
  return {
    id: String(category.uuid ?? category.id ?? ""),
    slug: String(category.slug ?? ""),
    label: String(category.label ?? category.name ?? ""),
    active: category.active ?? (category.status === 1 || category.status === "active"),
    sortOrder: Number(category.sortOrder ?? category.sort_order ?? 0),
  };
}
