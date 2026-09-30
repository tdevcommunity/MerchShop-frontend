import { describe, expect, it } from "vitest";
import {
  can,
  hashPassword,
  readSessionToken,
  signSession,
  verifyPassword,
} from "./admin-auth";

describe("admin-auth", () => {
  it("vérifie un mot de passe scrypt", () => {
    const stored = hashPassword("TdevAdmin2026!", "salt-test");
    expect(verifyPassword("TdevAdmin2026!", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });

  it("signe et relit une session", () => {
    const token = signSession({
      id: "usr_admin",
      email: "admin@tdev.tg",
      name: "Admin",
      role: "admin",
    });
    expect(readSessionToken(token)?.email).toBe("admin@tdev.tg");
    expect(readSessionToken("tampered.token")).toBeNull();
  });

  it("restreint le catalogue au rôle admin", () => {
    expect(can("admin", "catalog")).toBe(true);
    expect(can("staff", "catalog")).toBe(false);
    expect(can("staff", "pickups")).toBe(true);
    expect(can("staff", "settings")).toBe(false);
    expect(can("admin", "orders")).toBe(true);
  });
});
