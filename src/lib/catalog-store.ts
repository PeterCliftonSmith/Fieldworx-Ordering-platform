import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  Catalog,
  Product,
  ProductInput,
  ProductVariation,
  ProductVariationInput,
  Supplier,
  SupplierInput,
} from "@/data/types";
import { priceExFromIncl, priceInclFromEx, roundMoney } from "@/lib/format";

const DATA_DIR = path.join(process.cwd(), "data");
const CATALOG_PATH = path.join(DATA_DIR, "catalog.json");

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function uniqueId(base: string, existing: Set<string>): string {
  const slug = slugify(base) || `item-${randomBytes(3).toString("hex")}`;
  if (!existing.has(slug)) return slug;
  let n = 2;
  while (existing.has(`${slug}-${n}`)) n += 1;
  return `${slug}-${n}`;
}

async function ensureCatalogFile(): Promise<void> {
  try {
    await fs.access(CATALOG_PATH);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      CATALOG_PATH,
      JSON.stringify({ suppliers: [] }, null, 2),
      "utf8",
    );
  }
}

export async function readCatalog(): Promise<Catalog> {
  await ensureCatalogFile();
  const raw = await fs.readFile(CATALOG_PATH, "utf8");
  const parsed = JSON.parse(raw) as {
    suppliers?: Array<
      Omit<Supplier, "products"> & {
        products?: Array<ProductInput & { id?: string }>;
      }
    >;
  };
  if (!parsed || !Array.isArray(parsed.suppliers)) {
    return { suppliers: [] };
  }

  return {
    suppliers: parsed.suppliers.map((supplier) => ({
      ...supplier,
      products: (supplier.products ?? []).map((product, index) =>
        normalizeProduct(
          product,
          product.id?.trim() || `product-${index + 1}`,
        ),
      ),
    })),
  };
}

async function writeCatalog(catalog: Catalog): Promise<Catalog> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${CATALOG_PATH}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(catalog, null, 2) + "\n", "utf8");
  await fs.rename(tmp, CATALOG_PATH);
  return catalog;
}

export async function listSuppliers(): Promise<Supplier[]> {
  const catalog = await readCatalog();
  return catalog.suppliers;
}

export async function getSupplier(id: string): Promise<Supplier | undefined> {
  const catalog = await readCatalog();
  return catalog.suppliers.find((supplier) => supplier.id === id);
}

export async function getProduct(
  supplierId: string,
  productId: string,
): Promise<{ supplier: Supplier; product: Product } | undefined> {
  const supplier = await getSupplier(supplierId);
  if (!supplier) return undefined;
  const product = supplier.products.find((item) => item.id === productId);
  if (!product) return undefined;
  return { supplier, product };
}

function normalizeSupplierFields(input: SupplierInput) {
  return {
    name: input.name.trim(),
    region: input.region.trim(),
    specialty: input.specialty.trim(),
    leadTime: input.leadTime.trim(),
    image: input.image.trim(),
    imageAlt: input.imageAlt.trim(),
    blurb: input.blurb.trim(),
  };
}

function assertMoney(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a valid non-negative number.`);
  }
  return roundMoney(value);
}

function normalizeMoneyPair(
  input: {
    priceExVat?: number;
    priceInclVat?: number;
    price?: number;
  },
  label: string,
): { priceExVat: number; priceInclVat: number } {
  const legacyPrice =
    input.priceExVat == null && input.priceInclVat == null && input.price != null
      ? Number(input.price)
      : null;

  let priceExVat: number;
  let priceInclVat: number;

  if (input.priceExVat != null && input.priceInclVat != null) {
    priceExVat = assertMoney(Number(input.priceExVat), `${label} excluding VAT`);
    priceInclVat = assertMoney(
      Number(input.priceInclVat),
      `${label} including VAT`,
    );
  } else if (input.priceExVat != null) {
    priceExVat = assertMoney(Number(input.priceExVat), `${label} excluding VAT`);
    priceInclVat = priceInclFromEx(priceExVat);
  } else if (input.priceInclVat != null) {
    priceInclVat = assertMoney(
      Number(input.priceInclVat),
      `${label} including VAT`,
    );
    priceExVat = priceExFromIncl(priceInclVat);
  } else if (legacyPrice != null) {
    priceExVat = assertMoney(legacyPrice, label);
    priceInclVat = priceInclFromEx(priceExVat);
  } else {
    throw new Error(`${label} excluding or including VAT is required.`);
  }

  if (priceInclVat < priceExVat) {
    throw new Error(
      `${label} including VAT cannot be lower than price excluding VAT.`,
    );
  }

  return { priceExVat, priceInclVat };
}

function normalizeVariation(
  input: ProductVariationInput,
  id: string,
): ProductVariation {
  const name = input.name.trim();
  if (!name) throw new Error("Variation name is required.");

  const unit = (input.unit ?? "").trim();
  if (!unit) throw new Error(`Unit is required for variation "${name}".`);

  const { priceExVat, priceInclVat } = normalizeMoneyPair(
    input,
    `Variation "${name}" price`,
  );

  const image = (input.image ?? "").trim();
  const imageAlt = (input.imageAlt ?? "").trim() || name;

  return {
    id,
    name,
    unit,
    priceExVat,
    priceInclVat,
    image,
    imageAlt,
  };
}

function normalizeProduct(input: ProductInput, id: string): Product {
  const name = input.name.trim();
  if (!name) throw new Error("Product name is required.");

  const unit = input.unit.trim();
  if (!unit) throw new Error(`Unit is required for product "${name}".`);

  const { priceExVat, priceInclVat } = normalizeMoneyPair(
    input,
    `Product "${name}" price`,
  );

  const image = (input.image ?? "").trim();
  const imageAlt = (input.imageAlt ?? "").trim() || name;

  const variationIds = new Set<string>();
  const variations = (input.variations ?? [])
    .filter((variation) => variation.name?.trim())
    .map((variation) => {
      const preferred = variation.id?.trim();
      const variationId =
        preferred && !variationIds.has(preferred)
          ? preferred
          : uniqueId(variation.name, variationIds);
      variationIds.add(variationId);
      return normalizeVariation(variation, variationId);
    });

  return {
    id,
    name,
    unit,
    category: input.category.trim(),
    image,
    imageAlt,
    priceExVat,
    priceInclVat,
    variations,
  };
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const catalog = await readCatalog();
  const ids = new Set(catalog.suppliers.map((s) => s.id));
  const fields = normalizeSupplierFields(input);
  if (!fields.name) throw new Error("Supplier name is required.");

  const id = uniqueId(input.id?.trim() || fields.name, ids);
  const productIds = new Set<string>();
  const products = (input.products ?? []).map((product) => {
    const productId = uniqueId(product.id?.trim() || product.name, productIds);
    productIds.add(productId);
    return normalizeProduct(product, productId);
  });

  const supplier: Supplier = { id, ...fields, products };
  catalog.suppliers.push(supplier);
  await writeCatalog(catalog);
  return supplier;
}

export async function updateSupplier(
  id: string,
  input: SupplierInput,
): Promise<Supplier> {
  const catalog = await readCatalog();
  const index = catalog.suppliers.findIndex((s) => s.id === id);
  if (index < 0) throw new Error("Supplier not found.");

  const fields = normalizeSupplierFields(input);
  if (!fields.name) throw new Error("Supplier name is required.");

  const existing = catalog.suppliers[index];
  const productIds = new Set<string>();
  const products = (input.products ?? existing.products).map((product) => {
    const preferred = product.id?.trim();
    const productId =
      preferred && !productIds.has(preferred)
        ? preferred
        : uniqueId(product.name, productIds);
    productIds.add(productId);
    return normalizeProduct(product, productId);
  });

  const supplier: Supplier = { id, ...fields, products };
  catalog.suppliers[index] = supplier;
  await writeCatalog(catalog);
  return supplier;
}

export async function deleteSupplier(id: string): Promise<void> {
  const catalog = await readCatalog();
  const next = catalog.suppliers.filter((s) => s.id !== id);
  if (next.length === catalog.suppliers.length) {
    throw new Error("Supplier not found.");
  }
  await writeCatalog({ suppliers: next });
}

export async function upsertProduct(
  supplierId: string,
  input: ProductInput,
): Promise<Product> {
  const catalog = await readCatalog();
  const supplier = catalog.suppliers.find((s) => s.id === supplierId);
  if (!supplier) throw new Error("Supplier not found.");

  const existingIndex = input.id
    ? supplier.products.findIndex((p) => p.id === input.id)
    : -1;

  if (existingIndex >= 0) {
    const product = normalizeProduct(input, input.id!);
    supplier.products[existingIndex] = product;
    await writeCatalog(catalog);
    return product;
  }

  const ids = new Set(supplier.products.map((p) => p.id));
  const id = uniqueId(input.id?.trim() || input.name, ids);
  const product = normalizeProduct(input, id);
  supplier.products.push(product);
  await writeCatalog(catalog);
  return product;
}

export async function deleteProduct(
  supplierId: string,
  productId: string,
): Promise<void> {
  const catalog = await readCatalog();
  const supplier = catalog.suppliers.find((s) => s.id === supplierId);
  if (!supplier) throw new Error("Supplier not found.");
  const next = supplier.products.filter((p) => p.id !== productId);
  if (next.length === supplier.products.length) {
    throw new Error("Product not found.");
  }
  supplier.products = next;
  await writeCatalog(catalog);
}
