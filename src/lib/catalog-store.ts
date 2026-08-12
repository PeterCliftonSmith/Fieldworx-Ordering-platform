import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  Catalog,
  Product,
  ProductInput,
  Supplier,
  SupplierInput,
} from "@/data/types";

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
  const parsed = JSON.parse(raw) as Catalog;
  if (!parsed || !Array.isArray(parsed.suppliers)) {
    return { suppliers: [] };
  }
  return parsed;
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

function normalizeProduct(input: ProductInput, id: string): Product {
  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Product price must be a valid non-negative number.");
  }
  return {
    id,
    name: input.name.trim(),
    unit: input.unit.trim(),
    price,
    category: input.category.trim(),
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
