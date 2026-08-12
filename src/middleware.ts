import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin/auth-token";
import {
  CUSTOMER_COOKIE,
  parseCustomerSessionToken,
} from "@/lib/customer/auth-token";

const NO_STORE =
  "private, no-store, no-cache, must-revalidate, max-age=0";

function withNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", NO_STORE);
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      const token = request.cookies.get(ADMIN_COOKIE)?.value;
      if (await isValidAdminSessionToken(token)) {
        return withNoStore(
          NextResponse.redirect(new URL("/admin", request.url)),
        );
      }
      return withNoStore(NextResponse.next());
    }

    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!(await isValidAdminSessionToken(token))) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return withNoStore(NextResponse.redirect(loginUrl));
    }
    return withNoStore(NextResponse.next());
  }

  if (
    pathname === "/order" ||
    pathname.startsWith("/order/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/")
  ) {
    const session = await parseCustomerSessionToken(
      request.cookies.get(CUSTOMER_COOKIE)?.value,
    );
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return withNoStore(NextResponse.redirect(loginUrl));
    }
  }

  return withNoStore(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Apply auth + no-store headers to app routes.
     * Skip Next internals and common static file extensions.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
