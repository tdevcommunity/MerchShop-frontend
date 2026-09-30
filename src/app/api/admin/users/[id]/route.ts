import { NextResponse } from "next/server";
import { handleAdminError, requireAdmin } from "@/server/admin-http";
import { updateAdminUser } from "@/server/shop-store";
import { ADMIN_ROLES, type AdminRole } from "@/types/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("users");
  if (auth.error) {
    return auth.error;
  }
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as {
      role?: AdminRole;
      active?: boolean;
      name?: string;
    } | null;
    if (
      body?.role !== undefined &&
      !(ADMIN_ROLES as readonly string[]).includes(body.role)
    ) {
      return NextResponse.json(
        { message: "Rôle invalide. Choisis admin ou staff." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      updateAdminUser(auth.user, id, {
        role: body?.role,
        active: body?.active,
        name: body?.name,
      }),
    );
  } catch (error) {
    return handleAdminError(error);
  }
}
