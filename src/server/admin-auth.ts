import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { AdminRole, AdminSessionUser } from "@/types/admin";
import { hashPassword, verifyPassword } from "@/server/password";

export { hashPassword, verifyPassword };

const COOKIE_NAME = "tdev_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

type SessionPayload = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  exp: number;
};

function sessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "tdev-dev-admin-session")
  );
}

export function signSession(user: AdminSessionUser): string {
  const secret = sessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET manquant.");
  }
  const payload: SessionPayload = {
    ...user,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function readSessionToken(token: string): AdminSessionUser | null {
  const secret = sessionSecret();
  if (!secret) {
    return null;
  }
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.exp < Date.now()) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return readSessionToken(token);
}

export async function setAdminSession(user: AdminSessionUser) {
  const store = await cookies();
  store.set(COOKIE_NAME, signSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const ADMIN_PERMISSIONS = {
  catalog: ["admin"],
  inventory: ["admin", "staff"],
  inventoryAdjust: ["admin", "staff"],
  orders: ["admin", "staff"],
  orderStatus: ["admin", "staff"],
  payments: ["admin", "staff"],
  pickups: ["admin", "staff"],
  settings: ["admin"],
  users: ["admin"],
  audit: ["admin"],
} as const;

export type AdminPermission = keyof typeof ADMIN_PERMISSIONS;

export function can(role: AdminRole, permission: AdminPermission): boolean {
  return (ADMIN_PERMISSIONS[permission] as readonly AdminRole[]).includes(role);
}
