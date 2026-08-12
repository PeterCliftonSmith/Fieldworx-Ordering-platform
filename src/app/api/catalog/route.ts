import { NextResponse } from "next/server";
import { listSuppliers, getSupplier } from "@/lib/catalog-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const supplier = await getSupplier(id);
    if (!supplier) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ supplier });
  }

  const suppliers = await listSuppliers();
  return NextResponse.json({ suppliers });
}
