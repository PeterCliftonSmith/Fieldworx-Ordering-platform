export const CUSTOMER_COOKIE = "fieldworx_customer_session";

function getCustomerSessionSecret(): string {
  return (
    process.env.CUSTOMER_SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    "fieldworx-customer-dev-secret"
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

export type CustomerSessionPayload = {
  id: string;
  username: string;
  exp: number;
};

export async function createCustomerSessionToken(input: {
  id: string;
  username: string;
  maxAgeSeconds?: number;
}): Promise<string> {
  const maxAgeSeconds = input.maxAgeSeconds ?? 60 * 60 * 12;
  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const body = `${input.id}.${input.username}.${exp}`;
  const sig = await sha256Hex(
    `${body}:${getCustomerSessionSecret()}`,
  );
  return `${body}.${sig}`;
}

export async function parseCustomerSessionToken(
  token: string | undefined,
): Promise<CustomerSessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [id, username, expRaw, sig] = parts;
  if (!id || !username || !expRaw || !sig) return null;

  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null;

  const body = `${id}.${username}.${expRaw}`;
  const expected = await sha256Hex(`${body}:${getCustomerSessionSecret()}`);
  if (!timingSafeEqualString(sig, expected)) return null;

  return { id, username, exp };
}

export function customerSessionCookieOptions(request?: Request) {
  const forwarded = request?.headers.get("x-forwarded-proto");
  const urlSecure = request
    ? new URL(request.url).protocol === "https:"
    : false;
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
