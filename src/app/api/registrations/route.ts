import { NextResponse } from "next/server";
import type { CustomerRegistrationInput } from "@/data/registration";
import { requireAdmin } from "@/lib/admin/auth";
import {
  createRegistration,
  readRegistrations,
  sanitizeRegistrationForAdmin,
  toPublicCustomer,
} from "@/lib/registration-store";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registrations = await readRegistrations();
  return NextResponse.json({
    registrations: registrations.map(sanitizeRegistrationForAdmin),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CustomerRegistrationInput;
    const registration = await createRegistration(body);
    return NextResponse.json(
      {
        registration: {
          id: registration.id,
          status: registration.status,
          username: registration.username,
          tradingName: registration.tradingName,
        },
        customer: toPublicCustomer(registration),
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not submit registration.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
