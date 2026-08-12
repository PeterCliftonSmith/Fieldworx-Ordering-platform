import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE,
  createCustomerSessionToken,
  customerSessionCookieOptions,
} from "@/lib/customer/auth-token";
import {
  authenticateCustomer,
  toPublicCustomer,
} from "@/lib/registration-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: string;
    password?: string;
  } | null;

  try {
    const registration = await authenticateCustomer(
      body?.username ?? "",
      body?.password ?? "",
    );
    const token = await createCustomerSessionToken({
      id: registration.id,
      username: registration.username,
    });
    const response = NextResponse.json({
      customer: toPublicCustomer(registration),
    });
    response.cookies.set(
      CUSTOMER_COOKIE,
      token,
      customerSessionCookieOptions(request),
    );
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not sign in.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
