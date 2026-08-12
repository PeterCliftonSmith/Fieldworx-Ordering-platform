import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
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
