import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/auth-token";
import { adminSessionCookieOptions } from "@/lib/admin/session";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    ...adminSessionCookieOptions(request),
    maxAge: 0,
  });
  return response;
}
