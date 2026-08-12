import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  WEEK_DAYS,
  type CustomerRegistration,
  type CustomerRegistrationInput,
  type DayTradingHours,
  type PersonContact,
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

export async function readRegistrations(): Promise<CustomerRegistration[]> {
  await ensureRegistrationsFile();
  const raw = await fs.readFile(REGISTRATIONS_PATH, "utf8");
  const parsed = JSON.parse(raw) as RegistrationsFile;
  if (!parsed || !Array.isArray(parsed.registrations)) return [];
  return parsed.registrations;
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

function normalizePerson(input: Partial<PersonContact>, label: string): PersonContact {
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
    return { day, closed, open: closed ? "" : open, close: closed ? "" : close };
  });
}

export function normalizeRegistrationInput(
  input: CustomerRegistrationInput,
): CustomerRegistrationInput {
  const address = input.deliveryAddress ?? {
    line1: "",
    line2: "",
    city: "",
    province: "",
    postalCode: "",
  };

  return {
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
}

export async function createRegistration(
  input: CustomerRegistrationInput,
): Promise<CustomerRegistration> {
  const normalized = normalizeRegistrationInput(input);
  const registrations = await readRegistrations();
  const registration: CustomerRegistration = {
    id: `reg-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`,
    createdAt: new Date().toISOString(),
    ...normalized,
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
