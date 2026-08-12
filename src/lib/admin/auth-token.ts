export const ADMIN_COOKIE = "fieldworx_admin_session";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "fieldworx-admin";
}

export function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    `fieldworx-dev-secret:${getAdminPassword()}`
  );
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createAdminSessionToken(): Promise<string> {
  return sha256Hex(
    `fieldworx-admin:${getAdminPassword()}:${getSessionSecret()}`,
  );
}

export async function isValidAdminSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const expected = await createAdminSessionToken();
  return timingSafeEqualString(token, expected);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return timingSafeEqualString(password, getAdminPassword());
}
