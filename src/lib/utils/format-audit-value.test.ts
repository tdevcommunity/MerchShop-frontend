import { describe, expect, it } from "vitest";
import { formatAuditValue } from "./format-audit-value";

describe("formatAuditValue", () => {
  it("affiche le tiret quand il n'y a rien a afficher", () => {
    expect(formatAuditValue(null)).toBe("—");
    expect(formatAuditValue(undefined)).toBe("—");
  });

  it("affiche une chaine ou un nombre tels quels", () => {
    expect(formatAuditValue("active")).toBe("active");
    expect(formatAuditValue(28)).toBe("28");
  });

  it("developpe l'objet de stock sans planter le rendu", () => {
    expect(formatAuditValue({ stock: 28 })).toBe("stock : 28");
    expect(formatAuditValue({ from: 25, to: 28 })).toBe("from : 25, to : 28");
  });

  it("developpe les tableaux et les objets imbriques", () => {
    expect(formatAuditValue([1, 2])).toBe("1, 2");
    expect(formatAuditValue({ variant: { stock: 3 } })).toBe(
      "variant : stock : 3",
    );
  });
});
