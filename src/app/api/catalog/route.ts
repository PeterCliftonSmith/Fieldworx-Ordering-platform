import { NextResponse } from "next/server";
import { listSuppliers, getSupplier } from "@/lib/catalog-store";
import {
  redactCatalogPrices,
  redactSupplierPrices,
} from "@/lib/catalog-pricing";
import { getCurrentCustomer } from "@/lib/customer/session";
import { jsonNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const customer = await getCurrentCustomer();
  const canSeePrices = Boolean(customer);

  if (id) {
    const supplier = await getSupplier(id);
    if (!supplier) {
      return jsonNoStore({ error: "Not found" }, { status: 404 });
    }
    return jsonNoStore({
      supplier: canSeePrices ? supplier : redactSupplierPrices(supplier),
      pricesVisible: canSeePrices,
    });
  }

  const suppliers = await listSuppliers();
  return jsonNoStore({
    suppliers: canSeePrices ? suppliers : redactCatalogPrices(suppliers),
    pricesVisible: canSeePrices,
  });
}
