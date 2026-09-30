import { NextResponse } from "next/server";
import { setAdminSession, verifyPassword } from "@/server/admin-auth";
import { findUserByEmail } from "@/server/shop-store";

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
