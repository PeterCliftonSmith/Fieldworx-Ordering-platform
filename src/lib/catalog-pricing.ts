import type { Product, ProductVariation, Supplier } from "@/data/types";
import { cookies } from "next/headers";
import {
  CUSTOMER_COOKIE,
  parseCustomerSessionToken,
} from "@/lib/customer/auth-token";

function redactVariation(variation: ProductVariation): ProductVariation {
  return {
    ...variation,
    priceExVat: 0,
    priceInclVat: 0,
  };
}

function redactProduct(product: Product): Product {
  return {
    ...product,
    priceExVat: 0,
    priceInclVat: 0,
    variations: (product.variations ?? []).map(redactVariation),
  };
}

export function redactSupplierPrices(supplier: Supplier): Supplier {
  return {
    ...supplier,
    products: supplier.products.map(redactProduct),
  };
}

export function redactCatalogPrices(suppliers: Supplier[]): Supplier[] {
  return suppliers.map(redactSupplierPrices);
}

/** Lightweight cookie check for API/route handlers (does not hit registration store). */
export async function hasCustomerSessionCookie(): Promise<boolean> {
  const jar = await cookies();
  const session = await parseCustomerSessionToken(
    jar.get(CUSTOMER_COOKIE)?.value,
  );
  return Boolean(session);
}
