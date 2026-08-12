import { NextResponse } from "next/server";
import type { SupplierInput } from "@/data/types";
import { requireAdmin } from "@/lib/admin/session";
import {
  deleteSupplier,
  getSupplier,
  updateSupplier,
} from "@/lib/catalog-store";

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
  const supplier = await getSupplier(id);
  if (!supplier) {
    return NextResponse.json({ error: "Supplier not found." }, { status: 404 });
  }
  return NextResponse.json({ supplier });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const body = (await request.json()) as SupplierInput;
    const supplier = await updateSupplier(id, body);
    return NextResponse.json({ supplier });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update supplier.";
    const status = message === "Supplier not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    await deleteSupplier(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete supplier.";
    const status = message === "Supplier not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
