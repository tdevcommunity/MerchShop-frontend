import { NextResponse } from "next/server";
import wordmarkPink from "@/publics/tdev-wordmark-pink.png";

export function GET(request: Request) {
  return NextResponse.redirect(new URL(wordmarkPink.src, request.url), 308);
}
