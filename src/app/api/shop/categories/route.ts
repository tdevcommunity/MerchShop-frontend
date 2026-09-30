import { NextResponse } from "next/server";
import { listPublicCategories } from "@/server/shop-store";

export async function GET() {
  return NextResponse.json(listPublicCategories());
}
