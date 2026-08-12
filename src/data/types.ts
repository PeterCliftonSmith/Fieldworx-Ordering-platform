export const DEFAULT_VAT_RATE = 0.15;

export type Product = {
  id: string;
  name: string;
  unit: string;
  category: string;
  image: string;
  imageAlt: string;
  priceExVat: number;
  priceInclVat: number;
};

export type Supplier = {
  id: string;
  name: string;
  region: string;
  specialty: string;
  leadTime: string;
  image: string;
  imageAlt: string;
  blurb: string;
  products: Product[];
};

export type Catalog = {
  suppliers: Supplier[];
};

export type SupplierInput = Omit<Supplier, "id" | "products"> & {
  id?: string;
  products?: ProductInput[];
};

export type ProductInput = {
  id?: string;
  name: string;
  unit: string;
  category: string;
  image?: string;
  imageAlt?: string;
  priceExVat?: number;
  priceInclVat?: number;
  /** @deprecated Legacy field treated as price excluding VAT */
  price?: number;
};
