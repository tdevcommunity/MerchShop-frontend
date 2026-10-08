import { describe, expect, it } from "vitest";
import { appendFields, toLaravelProductPayload } from "./payload";

// Version 4, variante RFC 4122 : la forme que le regex du mapping retient.
const UUID = "11111111-1111-4111-8111-111111111111";

/** Le payload tel qu'il part sur le réseau : `JSON.stringify` omet `undefined`. */
function onTheWire(payload: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
}

describe("toLaravelProductPayload — catégorie", () => {
  it("envoie l'uuid reçu du formulaire comme category_uuid", () => {
    const wire = onTheWire(
      toLaravelProductPayload({ name: "Sweat", category: UUID }, "create"),
    );

    expect(wire.category_uuid).toBe(UUID);
    expect(wire).not.toHaveProperty("category_id");
  });

  it("garde une cle primaire entière, sous forme de nombre", () => {
    expect(
      onTheWire(toLaravelProductPayload({ category_id: 12 }, "create")).category_id,
    ).toBe(12);
    expect(
      onTheWire(toLaravelProductPayload({ category_id: "12" }, "create")).category_id,
    ).toBe(12);
  });

  it("retire un category_id qui n'est pas un entier au lieu de le convertir", () => {
    // `Number(uuid)` vaut NaN, et `JSON.stringify(NaN)` produit `null` : c'est
    // ce `null` qui partait en 422 sur la règle `required|integer`.
    const wire = onTheWire(toLaravelProductPayload({ category_id: UUID }, "create"));

    expect(wire).not.toHaveProperty("category_id");
    expect(wire).not.toHaveProperty("category_uuid");
  });

  it("ignore une valeur qui n'est pas une uuid", () => {
    const wire = onTheWire(
      toLaravelProductPayload({ category: "textile" }, "create"),
    );

    expect(wire).not.toHaveProperty("category_uuid");
  });
});

describe("toLaravelProductPayload — statut", () => {
  it("cree en brouillon quand aucun statut n'est donné", () => {
    expect(onTheWire(toLaravelProductPayload({}, "create")).status).toBe(0);
  });

  it("ne touche au statut en mise à jour que s'il est fourni", () => {
    expect(onTheWire(toLaravelProductPayload({}, "update"))).not.toHaveProperty("status");
    expect(onTheWire(toLaravelProductPayload({ status: "published" }, "update")).status).toBe(1);
  });

  it("traduit les formes d'écran", () => {
    expect(onTheWire(toLaravelProductPayload({ status: "published" }, "create")).status).toBe(1);
    expect(onTheWire(toLaravelProductPayload({ status: "draft" }, "create")).status).toBe(0);
    expect(onTheWire(toLaravelProductPayload({ status: "archived" }, "create")).status).toBe(0);
  });
});

describe("toLaravelProductPayload — variantes", () => {
  const payload = toLaravelProductPayload(
    {
      variants: [
        { size: "M", color: "Noir", sku: "TEE-M-BLK", stockQuantity: 3, unitPrice: 8000 },
        { uuid: UUID, sku: "TEE-L-BLK", status: "draft" },
        { id: "var_new_0", sku: "CASQUETTE-1", status: "published" },
      ],
    },
    "create",
  );

  it("déduit le nom de la déclinaison de sa taille et de sa couleur", () => {
    const variants = payload.variants as Array<Record<string, unknown>>;

    expect(variants[0]).toMatchObject({
      name: "M / Noir",
      sku: "TEE-M-BLK",
      price: 8000,
      stock: 3,
      status: 1,
    });
  });

  it("ne retient comme uuid qu'une valeur réellement valide", () => {
    const variants = payload.variants as Array<Record<string, unknown>>;

    expect(variants[1]!.uuid).toBe(UUID);
    expect(variants[2]!.uuid).toBeNull();
    expect(variants[2]!.status).toBe(1);
  });

  it("traduit le statut d'une variante comme celui d'un produit", () => {
    const variants = payload.variants as Array<Record<string, unknown>>;

    expect(variants[1]!.status).toBe(0);
  });
});

describe("appendFields", () => {
  it("aplatisit les objets et les tableaux, et omet ce qui est absent", () => {
    const form = new FormData();

    appendFields(form, { variants: [{ sku: "TEE-M" }], status: 0, missing: undefined }, "payload");

    expect(form.get("payload[variants][0][sku]")).toBe("TEE-M");
    expect(form.get("payload[status]")).toBe("0");
    expect(form.has("payload[missing]")).toBe(false);
  });
});
