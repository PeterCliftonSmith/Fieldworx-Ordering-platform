import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCatalogueItem } from "@/components/AddToOrder";
import { SupplierImage } from "@/components/SupplierImage";
import { getSupplier } from "@/lib/catalog-store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supplier = await getSupplier(id);
  if (!supplier) return { title: "Supplier" };
  return {
    title: supplier.name,
    description: supplier.blurb,
  };
}

export default async function SupplierDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supplier = await getSupplier(id);
  if (!supplier) notFound();

  return (
    <div className="page-shell">
      <div className="page-intro">
        <p className="section-kicker">
          <Link href="/suppliers">Suppliers</Link> / {supplier.region}
        </p>
      </div>

      <div className="catalog-layout">
        <div className="catalog-hero">
          <SupplierImage
            src={supplier.image}
            alt={supplier.imageAlt}
            priority
          />
        </div>

        <div className="catalog-details">
          <h1>{supplier.name}</h1>
          <p className="muted">
            {supplier.specialty} · {supplier.leadTime}
          </p>
          <p>{supplier.blurb}</p>

          {supplier.products.length === 0 ? (
            <p className="muted" style={{ marginTop: "1.5rem" }}>
              No products listed yet.
            </p>
          ) : (
            <div className="product-list">
              {supplier.products.map((product) => (
                <ProductCatalogueItem
                  key={product.id}
                  supplierId={supplier.id}
                  supplierName={supplier.name}
                  productId={product.id}
                  productName={product.name}
                  category={product.category}
                  unit={product.unit}
                  image={product.image}
                  imageAlt={product.imageAlt || product.name}
                  priceExVat={product.priceExVat}
                  priceInclVat={product.priceInclVat}
                  variations={product.variations ?? []}
                />
              ))}
            </div>
          )}

          <p style={{ marginTop: "1.5rem" }}>
            <Link href="/order" className="btn btn-primary">
              Review order
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
