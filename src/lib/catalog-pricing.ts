import type { Product, ProductVariation, Supplier } from "@/data/types";

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
