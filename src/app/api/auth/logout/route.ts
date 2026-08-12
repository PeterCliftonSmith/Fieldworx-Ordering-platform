import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE,
  customerSessionCookieOptions,
} from "@/lib/customer/auth-token";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CUSTOMER_COOKIE, "", {
    ...customerSessionCookieOptions(request),
    maxAge: 0,
  });
  return response;
}
