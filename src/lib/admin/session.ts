import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  isValidAdminSessionToken,
} from "@/lib/admin/auth-token";

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return isValidAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

export function adminSessionCookieOptions(maxAgeSeconds = 60 * 60 * 12) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function createSessionCookieValue(): Promise<string> {
  return createAdminSessionToken();
}
