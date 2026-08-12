export type Product = {
  id: string;
  name: string;
  unit: string;
  price: number;
  category: string;
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
  products?: Product[];
};

export type ProductInput = Omit<Product, "id"> & {
  id?: string;
};
