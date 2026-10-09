import { describe, expect, it } from "vitest";
import {
  toAdminCategory,
  toLaravelStatus,
  toStoreCategoryPayload,
  toUpdateCategoryPayload,
} from "./mapper";

describe("toLaravelStatus", () => {
  it("n'invente aucun statut quand le client n'en envoie pas", () => {
    expect(toLaravelStatus({ label: "Textile", slug: "textile" })).toBeUndefined();
  });

  it("traduit les formes active / inactive du back-office", () => {
    expect(toLaravelStatus({ active: true })).toBe(1);
    expect(toLaravelStatus({ active: false })).toBe(0);
    expect(toLaravelStatus({ status: "active" })).toBe(1);
    expect(toLaravelStatus({ status: "inactive" })).toBe(0);
    expect(toLaravelStatus({ status: 1 })).toBe(1);
    expect(toLaravelStatus({ status: "1" })).toBe(1);
    expect(toLaravelStatus({ status: 0 })).toBe(0);
    expect(toLaravelStatus({ status: "0" })).toBe(0);
  });

  it("prefere `active` a `status` quand les deux divergent", () => {
    expect(toLaravelStatus({ active: false, status: "active" })).toBe(0);
  });
});

describe("toStoreCategoryPayload", () => {
  it("cree une categorie active quand le formulaire ne precise rien", () => {
    expect(toStoreCategoryPayload({ label: "Textile", slug: "textile" })).toEqual({
      name: "Textile",
      slug: "textile",
      status: 1,
    });
  });

  it("envoie toujours un statut, jamais de champ absent", () => {
    expect(toStoreCategoryPayload({ label: "Textile" })).toHaveProperty("status", 1);
  });

  it("respecte un statut explicitement inactif", () => {
    expect(toStoreCategoryPayload({ label: "Textile", active: false }).status).toBe(0);
    expect(toStoreCategoryPayload({ label: "Textile", status: 0 }).status).toBe(0);
  });

  it("retire les champs frontend du corps envoye a l'API", () => {
    const payload = toStoreCategoryPayload({ label: "Textile", active: true });

    expect(payload).not.toHaveProperty("label");
    expect(payload).not.toHaveProperty("active");
    expect(payload.name).toBe("Textile");
  });

  it("ne casse pas sur un corps vide ou absent", () => {
    expect(toStoreCategoryPayload({})).toEqual({ status: 1 });
  });
});

describe("toUpdateCategoryPayload", () => {
  it("omet le statut quand la mise a jour n'y touche pas", () => {
    expect(toUpdateCategoryPayload({ label: "Textile" })).not.toHaveProperty("status");
    expect(toUpdateCategoryPayload({ sortOrder: 2 })).not.toHaveProperty("status");
  });

  it("envoie 0 quand on desactive", () => {
    expect(toUpdateCategoryPayload({ active: false }).status).toBe(0);
  });

  it("envoie 1 quand on active", () => {
    expect(toUpdateCategoryPayload({ active: true }).status).toBe(1);
  });

  it("envoie sort_order depuis sortOrder", () => {
    expect(toUpdateCategoryPayload({ sortOrder: 2 })).toEqual({ sort_order: 2 });
    expect(toUpdateCategoryPayload({ sortOrder: 2 })).not.toHaveProperty("sortOrder");
  });
});

describe("toAdminCategory", () => {
  it("lit la ressource Laravel (name / status) et prefere l'uuid", () => {
    expect(
      toAdminCategory({ id: "12", uuid: "abc", name: "Textile", slug: "textile", status: 1 }),
    ).toEqual({
      id: "abc",
      slug: "textile",
      label: "Textile",
      active: true,
      sortOrder: 0,
    });
  });

  it("marque inactive une categorie masquee", () => {
    expect(toAdminCategory({ id: "12", name: "Textile", slug: "textile", status: 0 }).active).toBe(
      false,
    );
  });

  it("lit l'ordre d'affichage en snake_case", () => {
    expect(toAdminCategory({ id: "1", name: "A", status: 1, sort_order: 3 }).sortOrder).toBe(3);
  });
});
