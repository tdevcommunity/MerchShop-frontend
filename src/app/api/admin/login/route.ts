import { NextResponse } from "next/server";
import { setAdminSession, verifyPassword } from "@/server/admin-auth";
import { findUserByEmail } from "@/server/shop-store";
import { env, useMockApi } from "@/lib/config/env";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { AdminRole, AdminSessionUser } from "@/types/admin";
import type { LaravelUser } from "@/lib/api/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";
  if (!email || !password) {
    return NextResponse.json(
      { message: "Email et mot de passe requis." },
      { status: 400 },
    );
  }

  // 1. If backend API is configured, attempt authentication against Laravel
  if (!useMockApi && env.apiBaseUrl) {
    try {
      const csrfRes = await fetch(`${env.apiBaseUrl}${apiEndpoints.csrfToken}`, {
        headers: { Accept: "application/json" },
      });
      const csrfCookie = csrfRes.headers.get("set-cookie") || "";
      const csrfJson = (await csrfRes.json()) as {
        data?: { csrfToken?: string };
        csrfToken?: string;
      };
      const csrfToken = csrfJson.data?.csrfToken || csrfJson.csrfToken || "";

      const loginRes = await fetch(`${env.apiBaseUrl}${apiEndpoints.login}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken,
          ...(csrfCookie ? { Cookie: csrfCookie } : {}),
        },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        const loginData = (await loginRes.json()) as {
          data?: LaravelUser;
        };
        const laravelUser = loginData.data;
        if (laravelUser) {
          const sessionUser: AdminSessionUser = {
            id: laravelUser.uuid,
            email: laravelUser.email,
            name: `${laravelUser.firstname} ${laravelUser.lastname}`.trim(),
            role: (laravelUser.role as AdminRole) || "admin",
          };
          await setAdminSession(sessionUser);
          return NextResponse.json(sessionUser);
        }
      }
    } catch {
      // fallback to local seed accounts if Laravel backend is not reachable
    }
  }

  // 2. Fallback to local accounts
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { message: "Identifiants incorrects." },
      { status: 401 },
    );
  }
  await setAdminSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
