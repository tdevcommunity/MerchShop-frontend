import { describe, expect, it } from "vitest";
import { formatMoney } from "./format-money";

describe("formatMoney", () => {
  it("formate un montant XOF en français", () => {
    const formatted = formatMoney(8000);
    expect(formatted).toContain("8");
    expect(formatted.replace(/\s/g, "")).toMatch(/8000|8 000|8 000/);
  });
});
