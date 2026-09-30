import { NextResponse } from "next/server";
import {
  can,
  getAdminSession,
  type AdminPermission,
} from "@/server/admin-auth";
import type { AdminSessionUser } from "@/types/admin";

export async function requireAdmin(permission?: AdminPermission): Promise<
  | { user: AdminSessionUser; error?: never }
  | { user?: never; error: NextResponse }
> {
  const user = await getAdminSession();
  if (!user) {
    return {
      error: NextResponse.json(
        { message: "Authentification requise." },
        { status: 401 },
      ),
    };
  }
  if (permission && !can(user.role, permission)) {
    return {
      error: NextResponse.json(
        { message: "Tu n'as pas les droits pour cette action." },
        { status: 403 },
      ),
    };
  }
  return { user };
}

export function handleAdminError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Impossible de traiter la demande.";
  const status = message.toLowerCase().includes("introuvable") ? 404 : 400;
  return NextResponse.json({ message }, { status });
}
