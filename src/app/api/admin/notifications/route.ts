import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const notifications = await laravelFetch<Array<{
      id: string;
      tone: "warning" | "info";
      message: string;
      createdAt: string;
    }>>(request, "/api/v1/admin/notifications");

    return NextResponse.json({
      data: notifications.map((notification) => ({
        ...notification,
        read: false,
      })),
    });
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
