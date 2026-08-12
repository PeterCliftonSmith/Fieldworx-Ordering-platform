import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/session";
import { createSupplier, listSuppliers } from "@/lib/catalog-store";
import type { SupplierInput } from "@/data/types";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const suppliers = await listSuppliers();
  return NextResponse.json({ suppliers });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as SupplierInput;
    const supplier = await createSupplier(body);
    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create supplier.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
