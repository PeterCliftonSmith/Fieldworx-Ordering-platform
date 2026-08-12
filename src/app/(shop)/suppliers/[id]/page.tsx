import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToOrder } from "@/components/AddToOrder";
import { SupplierImage } from "@/components/SupplierImage";
import { getSupplier } from "@/lib/catalog-store";
import { formatZar } from "@/lib/format";

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
                <article key={product.id} className="product-row">
                  <div className="product-media">
                    {product.image ? (
                      <SupplierImage
                        src={product.image}
                        alt={product.imageAlt || product.name}
                      />
                    ) : (
                      <div className="product-media-empty" aria-hidden="true" />
                    )}
                  </div>
                  <div className="product-copy">
                    <p className="product-name">{product.name}</p>
                    <p className="muted small">
                      {product.category} · {product.unit}
                    </p>
                    <div className="product-prices">
                      <p>
                        <strong>{formatZar(product.priceExVat)}</strong>
                        <span className="muted"> excl. VAT</span>
                      </p>
                      <p className="muted small">
                        {formatZar(product.priceInclVat)} incl. VAT
                      </p>
                    </div>
                  </div>
                  <AddToOrder
                    supplierId={supplier.id}
                    supplierName={supplier.name}
                    productId={product.id}
                    productName={product.name}
                    unit={product.unit}
                    image={product.image}
                    imageAlt={product.imageAlt || product.name}
                    priceExVat={product.priceExVat}
                    priceInclVat={product.priceInclVat}
                  />
                </article>
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
