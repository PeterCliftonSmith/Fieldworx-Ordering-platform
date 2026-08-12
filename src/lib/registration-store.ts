import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  WEEK_DAYS,
  type CustomerRegistration,
  type CustomerRegistrationInput,
  type DayTradingHours,
  type PersonContact,
  type PublicCustomer,
  type RegistrationStatus,
  type RegistrationsFile,
} from "@/data/registration";

const DATA_DIR = path.join(process.cwd(), "data");
const REGISTRATIONS_PATH = path.join(DATA_DIR, "registrations.json");

async function ensureRegistrationsFile(): Promise<void> {
  try {
    await fs.access(REGISTRATIONS_PATH);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      REGISTRATIONS_PATH,
      JSON.stringify({ registrations: [] }, null, 2) + "\n",
      "utf8",
    );
  }
}

function migrateRegistration(
  raw: Partial<CustomerRegistration> & {
    password?: string;
  },
): CustomerRegistration | null {
  if (!raw.id || !raw.createdAt || !raw.tradingName) return null;
  return {
    id: raw.id,
    createdAt: raw.createdAt,
    status: raw.status ?? "pending",
    reviewedAt: raw.reviewedAt ?? null,
    username: (raw.username ?? "").toLowerCase(),
    passwordHash: raw.passwordHash ?? "",
    registeredBusinessName: raw.registeredBusinessName ?? "",
    tradingName: raw.tradingName,
    vatNumber: raw.vatNumber ?? "",
    registrationNumber: raw.registrationNumber ?? "",
    landlineNumber: raw.landlineNumber ?? "",
    buyer: raw.buyer ?? { name: "", phone: "", email: "" },
    accounts: raw.accounts ?? { name: "", phone: "", email: "" },
    deliveryAddress: raw.deliveryAddress ?? {
      line1: "",
      line2: "",
      city: "",
      province: "",
      postalCode: "",
    },
    tradingTimes: Array.isArray(raw.tradingTimes) ? raw.tradingTimes : [],
    tradingTimesNotes: raw.tradingTimesNotes ?? "",
  };
}

export async function readRegistrations(): Promise<CustomerRegistration[]> {
  await ensureRegistrationsFile();
  const raw = await fs.readFile(REGISTRATIONS_PATH, "utf8");
  const parsed = JSON.parse(raw) as RegistrationsFile;
  if (!parsed || !Array.isArray(parsed.registrations)) return [];
  return parsed.registrations
    .map((item) => migrateRegistration(item))
    .filter((item): item is CustomerRegistration => Boolean(item));
}

async function writeRegistrations(
  registrations: CustomerRegistration[],
): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${REGISTRATIONS_PATH}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(
    tmp,
    JSON.stringify({ registrations }, null, 2) + "\n",
    "utf8",
  );
  await fs.rename(tmp, REGISTRATIONS_PATH);
}

function requireText(value: unknown, label: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${label} is required.`);
  return text;
}

function optionalText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUsername(value: unknown): string {
  const username = requireText(value, "Username").toLowerCase();
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    throw new Error(
      "Username must be 3–32 characters using letters, numbers, dots, underscores, or hyphens.",
    );
  }
  return username;
}

function normalizePassword(value: unknown): string {
  const password = typeof value === "string" ? value : "";
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  return password;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function normalizePerson(
  input: Partial<PersonContact>,
  label: string,
): PersonContact {
  const name = requireText(input.name, `${label} name`);
  const phone = requireText(input.phone, `${label} number`);
  const email = requireText(input.email, `${label} email`).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`${label} email looks invalid.`);
  }
  return { name, phone, email };
}

function normalizeTradingTimes(
  input: DayTradingHours[] | undefined,
): DayTradingHours[] {
  const byDay = new Map(
    (Array.isArray(input) ? input : []).map((item) => [item.day, item]),
  );

  return WEEK_DAYS.map((day) => {
    const item = byDay.get(day);
    const closed = Boolean(item?.closed);
    const open = optionalText(item?.open);
    const close = optionalText(item?.close);
    if (!closed && (!open || !close)) {
      throw new Error(
        `Trading times for ${day} need open and close times, or mark the day closed.`,
      );
    }
    return {
      day,
      closed,
      open: closed ? "" : open,
      close: closed ? "" : close,
    };
  });
}

export function toPublicCustomer(
  registration: CustomerRegistration,
): PublicCustomer {
  return {
    id: registration.id,
    username: registration.username,
    tradingName: registration.tradingName,
    registeredBusinessName: registration.registeredBusinessName,
    status: registration.status,
  };
}

export function sanitizeRegistrationForAdmin(
  registration: CustomerRegistration,
) {
  const { passwordHash: _passwordHash, ...rest } = registration;
  return rest;
}

export async function createRegistration(
  input: CustomerRegistrationInput,
): Promise<CustomerRegistration> {
  const username = normalizeUsername(input.username);
  const password = normalizePassword(input.password);
  const address = input.deliveryAddress ?? {
    line1: "",
    line2: "",
    city: "",
    province: "",
    postalCode: "",
  };

  const registrations = await readRegistrations();
  if (
    registrations.some(
      (item) => item.username && item.username === username,
    )
  ) {
    throw new Error("That username is already taken.");
  }

  const registration: CustomerRegistration = {
    id: `reg-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    reviewedAt: null,
    username,
    passwordHash: hashPassword(password),
    registeredBusinessName: requireText(
      input.registeredBusinessName,
      "Registered business name",
    ),
    tradingName: requireText(input.tradingName, "Trading name"),
    vatNumber: requireText(input.vatNumber, "VAT number"),
    registrationNumber: requireText(
      input.registrationNumber,
      "Registration number",
    ),
    landlineNumber: requireText(input.landlineNumber, "Landline number"),
    buyer: normalizePerson(input.buyer ?? {}, "Buyer contact"),
    accounts: normalizePerson(input.accounts ?? {}, "Accounts contact"),
    deliveryAddress: {
      line1: requireText(address.line1, "Delivery address line 1"),
      line2: optionalText(address.line2),
      city: requireText(address.city, "Delivery city"),
      province: requireText(address.province, "Delivery province"),
      postalCode: requireText(address.postalCode, "Delivery postal code"),
    },
    tradingTimes: normalizeTradingTimes(input.tradingTimes),
    tradingTimesNotes: optionalText(input.tradingTimesNotes),
  };

  registrations.unshift(registration);
  await writeRegistrations(registrations);
  return registration;
}

export async function getRegistration(
  id: string,
): Promise<CustomerRegistration | undefined> {
  const registrations = await readRegistrations();
  return registrations.find((item) => item.id === id);
}

export async function findRegistrationByUsername(
  username: string,
): Promise<CustomerRegistration | undefined> {
  const normalized = username.trim().toLowerCase();
  const registrations = await readRegistrations();
  return registrations.find((item) => item.username === normalized);
}

export async function setRegistrationStatus(
  id: string,
  status: Exclude<RegistrationStatus, "pending">,
): Promise<CustomerRegistration> {
  const registrations = await readRegistrations();
  const index = registrations.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Registration not found.");

  const current = registrations[index];
  if (!current.username || !current.passwordHash) {
    throw new Error(
      "This registration has no login credentials. Ask the customer to register again.",
    );
  }

  const updated: CustomerRegistration = {
    ...current,
    status,
    reviewedAt: new Date().toISOString(),
  };
  registrations[index] = updated;
  await writeRegistrations(registrations);
  return updated;
}

export async function authenticateCustomer(
  username: string,
  password: string,
): Promise<CustomerRegistration> {
  const registration = await findRegistrationByUsername(username);
  if (!registration || !registration.passwordHash) {
    throw new Error("Incorrect username or password.");
  }
  if (!verifyPassword(password, registration.passwordHash)) {
    throw new Error("Incorrect username or password.");
  }
  if (registration.status === "pending") {
    throw new Error(
      "Your registration is still awaiting Fieldworx approval.",
    );
  }
  if (registration.status === "rejected") {
    throw new Error(
      "This registration was not approved. Please contact Fieldworx.",
    );
  }
  return registration;
}
