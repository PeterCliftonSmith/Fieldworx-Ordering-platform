import { NextResponse } from "next/server";
import {
  adminSessionCookieOptions,
  createSessionCookieValue,
} from "@/lib/admin/session";
import { ADMIN_COOKIE, verifyAdminPassword } from "@/lib/admin/auth-token";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;
  const password = body?.password ?? "";

  if (!(await verifyAdminPassword(password))) {
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_COOKIE,
    await createSessionCookieValue(),
    adminSessionCookieOptions(),
  );
  return response;
}
