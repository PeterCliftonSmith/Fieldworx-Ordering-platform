import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  isValidAdminSessionToken,
} from "@/lib/admin/auth-token";

export async function isAdminAuthenticatedFromCookie(
  token: string | undefined,
): Promise<boolean> {
  return isValidAdminSessionToken(token);
}

export function adminSessionCookieOptions(request?: Request) {
  const forwarded = request?.headers.get("x-forwarded-proto");
  const urlSecure = request ? new URL(request.url).protocol === "https:" : false;
  const isSecure =
    forwarded === "https" ||
    urlSecure ||
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecure,
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}

export async function createSessionCookieValue(): Promise<string> {
  return createAdminSessionToken();
}

export { ADMIN_COOKIE };
