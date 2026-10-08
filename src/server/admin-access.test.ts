import { NextResponse } from "next/server";
import { describe, expect, it } from "vitest";
import {
  ADMIN_ACCESS_COOKIE,
  grantAdminAccess,
  revokeAdminAccess,
} from "@/server/admin-access";

/*
 * Le marqueur d'acces est ajoute aux cookies de session recopies depuis l'API.
 * Le piege, quand on le pose avec l'API `response.cookies`, est qu'elle repart
 * des cookies deja poses et les remplace par les siens : le navigateur ne
 * recevrait alors que le marqueur, et plus aucune session. Ces tests tiennent
 * cet invariant — le marqueur s'ajoute, il n'efface pas.
 */

function withLaravelCookie(): NextResponse {
  const response = NextResponse.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    "merchshop-session=abc; Path=/; HttpOnly; SameSite=lax",
  );
  return response;
}

function setCookies(response: NextResponse): string[] {
  return response.headers.getSetCookie();
}

describe("admin-access", () => {
  it("ajoute le marqueur sans toucher aux cookies de session deja poses", () => {
    const response = withLaravelCookie();

    grantAdminAccess(response);

    const cookies = setCookies(response);
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toContain("merchshop-session=abc");
    expect(cookies.some((cookie) => cookie.startsWith(`${ADMIN_ACCESS_COOKIE}=1`))).toBe(true);
  });

  it("pose un marqueur lisible seulement par le serveur, limite a 12 heures", () => {
    const response = NextResponse.json({ ok: true });

    grantAdminAccess(response);

    const [cookie] = setCookies(response);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Max-Age=43200");
  });

  it("expire le marqueur a la deconnexion", () => {
    const response = NextResponse.json({ ok: true });

    revokeAdminAccess(response);

    const [cookie] = setCookies(response);
    expect(cookie).toContain(`${ADMIN_ACCESS_COOKIE}=;`);
    expect(cookie).toContain("Max-Age=0");
  });
});
