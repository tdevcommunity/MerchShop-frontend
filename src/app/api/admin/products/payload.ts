type PayloadMode = "create" | "update";

/**
 * L'uuid d'une variante existante, ou null.
 *
 * Seule une uuid valide sert d'identifiant : un id d'écran (`var_new_0`) n'en
 * est pas un, et serait envoyé à l'API comme s'il désignait une declinaison —
 * qui le refuserait, faute de le trouver.
 */
function validUuid(value: unknown): string | null {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

/**
 * L'identifiant de catégorie, dans la forme où l'API l'accepte : un entier
 * strictement positif.
 *
 * Le point de vigilance est `Number(<uuid>)` : il vaut `NaN`, et
 * `JSON.stringify(NaN)` produit `null` — le payload partait donc sans
 * catégorie valide et la validation répondait 422 sur `category_id`. Une
 * valeur non entière est retirée du payload plutôt que transformée : c'est à
 * l'appelant de fournir un identifiant lisible.
 */
function toCategoryId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number(value);
  }

  return undefined;
}

/**
 * Le statut d'un produit ou d'une variante, dans le format de l'API (0 ou 1).
 *
 * Les formes d'écran (« published », « draft »…) sont traduites ici une seule
 * fois ; toute autre valeur passe telle quelle, comme avant, puisque l'API
 * sait déjà lire un entier. `fallback` porte la différence entre les deux
 * modes : `0` à la création, où un produit sans statut est un brouillon ;
 * `undefined` en mise à jour, où omettre le champ signifie « inchangé » — le
 * remplacer par 0 archiverait silencieusement un produit qu'on renomme.
 */
function toCatalogStatus(value: unknown, fallback: number | undefined): unknown {
  if (value === "published" || value === "active") {
    return 1;
  }

  if (value === "draft" || value === "archived" || value === "inactive") {
    return 0;
  }

  if (value === undefined || value === null) {
    return fallback;
  }

  return value;
}

/**
 * La declinaison telle que l'API l'attend.
 *
 * `name` se deduit de la taille et de la couleur quand le formulaire n'en
 * fournit pas : deux declinaisons « M » et « L » restent distinctes par leur
 * libellé, et le SKU sert de dernier recours.
 */
function toLaravelVariant(variant: unknown): Record<string, unknown> {
  const item = (variant ?? {}) as Record<string, unknown>;

  return {
    uuid: validUuid(item.uuid ?? item.id),
    name: item.name ?? ([item.size, item.color].filter(Boolean).join(" / ") || item.sku),
    sku: item.sku,
    size: item.size ?? null,
    color: item.color ?? null,
    image_url: item.image_url ?? item.imageUrl ?? null,
    color_hex: item.color_hex ?? item.colorHex ?? null,
    price: item.price ?? item.unitPrice,
    stock: item.stock ?? item.stockQuantity,
    status: toCatalogStatus(item.status, 1),
  };
}

/**
 * Le payload d'une écriture produit, dans la forme attendue par l'API.
 *
 * Deux modes plutôt que deux fonctions : le corps du mapping est identique,
 * seul le défaut de statut diffère (voir `toCatalogStatus`). Le module existait
 * en double dans `route.ts` et `[id]/route.ts`, avec justement ce défaut qui
 * divergeait entre les deux — la duplication est le terrain où un tel écart
 * passe inaperçu.
 */
export function toLaravelProductPayload(
  body: Record<string, unknown>,
  mode: PayloadMode,
): Record<string, unknown> {
  const variants = Array.isArray(body.variants)
    ? body.variants.map(toLaravelVariant)
    : undefined;

  return {
    ...body,
    /*
     * `category` est la clé que le formulaire envoie : l'uuid de la catégorie,
     * seule forme exposée par l'API. `category_id` reste acceptée pour un
     * appelant qui connaît la cle primaire, à condition qu'elle soit un
     * entier — sinon elle est retirée, jamais convertie.
     */
    category_id: toCategoryId(body.category_id),
    /*
     * `null` serait envoyé tel quel et casserait la règle `string` côté API :
     * une uuid absente ou invalide retire la clé, elle ne la neutralise pas.
     */
    category_uuid: validUuid(body.category_uuid ?? body.category) ?? undefined,
    status: toCatalogStatus(body.status, mode === "create" ? 0 : undefined),
    variants,
  };
}

/**
 * Un payload en champs de formulaire, pour les écritures qui portent une image.
 *
 * Les objets deviennent des clés imbriquées (`variants[0][sku]`), la forme que
 * Laravel lit comme un tableau. `undefined` est omis : c'est ce qui permet au
 * payload de ne contenir ni `category_id` invalide ni de statut absent, sans
 * branche conditionnelle supplémentaire dans l'appelant.
 */
export function appendFields(form: FormData, value: unknown, key: string): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => appendFields(form, item, `${key}[${index}]`));
  } else if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) =>
      appendFields(form, childValue, `${key}[${childKey}]`),
    );
  } else {
    form.append(key, String(value));
  }
}
