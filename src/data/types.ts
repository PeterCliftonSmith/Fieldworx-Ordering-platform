export const DEFAULT_VAT_RATE = 0.15;

export type ProductVariation = {
  id: string;
  name: string;
  unit: string;
  priceExVat: number;
  priceInclVat: number;
  image: string;
  imageAlt: string;
};

export type Product = {
  id: string;
  name: string;
  unit: string;
  category: string;
  image: string;
  imageAlt: string;
  priceExVat: number;
  priceInclVat: number;
  variations: ProductVariation[];
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

export type ProductVariationInput = {
  id?: string;
  name: string;
  unit?: string;
  priceExVat?: number;
  priceInclVat?: number;
  image?: string;
  imageAlt?: string;
  /** @deprecated Legacy field treated as price excluding VAT */
  price?: number;
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
  variations?: ProductVariationInput[];
  /** @deprecated Legacy field treated as price excluding VAT */
  price?: number;
};
