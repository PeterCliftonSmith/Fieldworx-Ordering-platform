import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin/auth-token";
import {
  CUSTOMER_COOKIE,
  parseCustomerSessionToken,
} from "@/lib/customer/auth-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      const token = request.cookies.get(ADMIN_COOKIE)?.value;
      if (await isValidAdminSessionToken(token)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!(await isValidAdminSessionToken(token))) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === "/order" || pathname.startsWith("/order/")) {
    const session = await parseCustomerSessionToken(
      request.cookies.get(CUSTOMER_COOKIE)?.value,
    );
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/order", "/order/:path*"],
};
