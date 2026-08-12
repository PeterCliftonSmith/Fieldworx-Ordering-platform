import { cookies } from "next/headers";
import {
  CUSTOMER_COOKIE,
  parseCustomerSessionToken,
} from "@/lib/customer/auth-token";
import {
  getRegistration,
  toPublicCustomer,
} from "@/lib/registration-store";
import type { PublicCustomer } from "@/data/registration";

export async function getCurrentCustomer(): Promise<PublicCustomer | null> {
  const jar = await cookies();
  const session = await parseCustomerSessionToken(
    jar.get(CUSTOMER_COOKIE)?.value,
  );
  if (!session) return null;

  const registration = await getRegistration(session.id);
  if (!registration || registration.status !== "approved") return null;
  if (registration.username !== session.username) return null;

  return toPublicCustomer(registration);
}

export async function requireCustomer(): Promise<PublicCustomer> {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Unauthorized");
  return customer;
}
