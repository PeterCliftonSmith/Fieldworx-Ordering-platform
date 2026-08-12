import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminPassword } from "@/lib/admin/auth-token";
import {
  adminSessionCookieOptions,
  createSessionCookieValue,
} from "@/lib/admin/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;
  const password = (body?.password ?? "").trim();

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
    adminSessionCookieOptions(request),
  );
  return response;
}
