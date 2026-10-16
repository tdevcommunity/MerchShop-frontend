import { afterEach, describe, expect, it } from "vitest";
import { cartNoticeStore } from "@/features/cart/notices";

afterEach(() => {
  cartNoticeStore.reset();
});

describe("cartNoticeStore", () => {
  it("affiche une confirmation et la retire", () => {
    const id = cartNoticeStore.push({
      key: "add",
      title: "Ajout au panier effectué avec succès.",
    });

    expect(cartNoticeStore.getSnapshot()).toEqual([
      {
        id,
        key: "add",
        title: "Ajout au panier effectué avec succès.",
      },
    ]);

    cartNoticeStore.dismiss(id);
    expect(cartNoticeStore.getSnapshot()).toEqual([]);
  });

  it("remplace une confirmation de même action au lieu de les empiler", () => {
    cartNoticeStore.push({ key: "qty:tee", title: "Quantité mise à jour.", detail: "2" });
    cartNoticeStore.push({ key: "qty:tee", title: "Quantité mise à jour.", detail: "3" });

    const snapshot = cartNoticeStore.getSnapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]?.detail).toBe("3");
  });
});
