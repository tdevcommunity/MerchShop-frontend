import { NextResponse } from "next/server";
import wordmark from "@/publics/tdev-wordmark-BAcPmZ98.png";

export function GET(request: Request) {
  return NextResponse.redirect(new URL(wordmark.src, request.url), 308);
}
