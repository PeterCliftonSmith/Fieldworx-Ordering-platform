import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getRegistration,
  sanitizeRegistrationForAdmin,
  setRegistrationStatus,
} from "@/lib/registration-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const registration = await getRegistration(id);
  if (!registration) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    registration: sanitizeRegistrationForAdmin(registration),
  });
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    action?: string;
  } | null;
  const action = body?.action;

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: "Action must be approve or reject." },
      { status: 400 },
    );
  }

  try {
    const registration = await setRegistrationStatus(
      id,
      action === "approve" ? "approved" : "rejected",
    );
    return NextResponse.json({
      registration: sanitizeRegistrationForAdmin(registration),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update registration.";
    const status = message === "Registration not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
