import { describe, expect, it } from "vitest";
import { toAdminCategory, toLaravelCategoryCreatePayload } from "./mapper";

const UUID = "11111111-1111-1111-1111-111111111111";

describe("toAdminCategory", () => {
  it("retient l'uuid comme identifiant de route", () => {
    const category = toAdminCategory({ uuid: UUID, name: "Textile", slug: "textile", status: 1 });

    expect(category).toEqual({
      id: UUID,
      slug: "textile",
      label: "Textile",
      active: true,
      sortOrder: 0,
    });
  });

  it("marque une categorie masquee comme inactive", () => {
    expect(toAdminCategory({ uuid: UUID, name: "Textile", status: 0 }).active).toBe(false);
    expect(toAdminCategory({ uuid: UUID, name: "Textile", status: "active" }).active).toBe(true);
  });

  it("n'affiche pas de NaN quand l'API ne renvoie aucun ordre", () => {
    expect(toAdminCategory({ uuid: UUID, name: "Textile" }).sortOrder).toBe(0);
  });
});

describe("toLaravelCategoryCreatePayload", () => {
  it("traduit le libelle d'ecran en nom de base", () => {
    const payload = toLaravelCategoryCreatePayload({ label: "Sweats", slug: "sweats" });

    expect(payload).toMatchObject({ name: "Sweats", slug: "sweats" });
    expect(payload).not.toHaveProperty("label");
  });

  it("cree une categorie visible par defaut", () => {
    expect(toLaravelCategoryCreatePayload({ label: "Sweats" }).status).toBe(1);
    expect(toLaravelCategoryCreatePayload({ label: "Sweats", active: true }).status).toBe(1);
    expect(toLaravelCategoryCreatePayload({ label: "Sweats", status: "active" }).status).toBe(1);
  });

  it("respecte un statut explicitement inactif", () => {
    expect(toLaravelCategoryCreatePayload({ label: "Sweats", active: false }).status).toBe(0);
    expect(toLaravelCategoryCreatePayload({ label: "Sweats", status: "inactive" }).status).toBe(0);
    expect(toLaravelCategoryCreatePayload({ label: "Sweats", status: 0 }).status).toBe(0);
  });

  it("n'envoie pas de statut inconnu a l'API", () => {
    expect(toLaravelCategoryCreatePayload({ label: "Sweats", status: "brouillon" }).status).toBe(1);
  });
});
