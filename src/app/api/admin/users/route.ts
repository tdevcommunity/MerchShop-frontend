import { NextResponse } from "next/server";
import { handleAdminError, requireAdmin } from "@/server/admin-http";
import { inviteAdminUser, listAdminUsers } from "@/server/shop-store";
import { ADMIN_ROLES, type AdminRole } from "@/types/admin";

export async function GET() {
  const auth = await requireAdmin("users");
  if (auth.error) {
    return auth.error;
  }
  return NextResponse.json(listAdminUsers());
}

export async function POST(request: Request) {
  const auth = await requireAdmin("users");
  if (auth.error) {
    return auth.error;
  }
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      name?: string;
      role?: AdminRole;
    } | null;
    const role = body?.role ?? "staff";
    if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
      return NextResponse.json(
        { message: "Rôle invalide. Choisis admin ou staff." },
        { status: 400 },
      );
    }
    const result = inviteAdminUser(auth.user, {
      email: body?.email ?? "",
      name: body?.name ?? "",
      role,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleAdminError(error);
  }
}
