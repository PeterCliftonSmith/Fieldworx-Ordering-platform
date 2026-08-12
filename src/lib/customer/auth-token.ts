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

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(value, "utf8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLength);
  if (typeof atob === "function") {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(base64, "base64").toString("utf8");
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
  const payload = toBase64Url(
    JSON.stringify({
      id: input.id,
      username: input.username,
      exp,
    } satisfies CustomerSessionPayload),
  );
  const sig = await sha256Hex(`${payload}:${getCustomerSessionSecret()}`);
  return `${payload}.${sig}`;
}

export async function parseCustomerSessionToken(
  token: string | undefined,
): Promise<CustomerSessionPayload | null> {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const payload = token.slice(0, separator);
  const sig = token.slice(separator + 1);
  if (!payload || !sig) return null;

  const expected = await sha256Hex(`${payload}:${getCustomerSessionSecret()}`);
  if (!timingSafeEqualString(sig, expected)) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as CustomerSessionPayload;
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.username !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    if (parsed.exp * 1000 < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
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
