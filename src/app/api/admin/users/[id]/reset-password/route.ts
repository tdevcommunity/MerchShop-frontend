import { NextResponse } from "next/server";
import { handleAdminError, requireAdmin } from "@/server/admin-http";
import { resetAdminUserPassword } from "@/server/shop-store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("users");
  if (auth.error) {
    return auth.error;
  }
  try {
    const { id } = await params;
    return NextResponse.json(resetAdminUserPassword(auth.user, id));
  } catch (error) {
    return handleAdminError(error);
  }
}
