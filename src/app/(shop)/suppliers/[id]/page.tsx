import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCatalogueItem } from "@/components/AddToOrder";
import { SupplierImage } from "@/components/SupplierImage";
import { getSupplier } from "@/lib/catalog-store";
import { getCurrentCustomer } from "@/lib/customer/session";

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
  const [supplier, customer] = await Promise.all([
    getSupplier(id),
    getCurrentCustomer(),
  ]);
  if (!supplier) notFound();

  const showPrices = Boolean(customer);

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

          {!showPrices && supplier.products.length > 0 ? (
            <p className="price-gate-note">
              <Link
                href={`/login?next=${encodeURIComponent(`/suppliers/${supplier.id}`)}`}
              >
                Sign in
              </Link>{" "}
              to view trade prices and place an order.
            </p>
          ) : null}

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
                  priceExVat={showPrices ? product.priceExVat : null}
                  priceInclVat={showPrices ? product.priceInclVat : null}
                  variations={
                    showPrices
                      ? (product.variations ?? [])
                      : (product.variations ?? []).map((variation) => ({
                          ...variation,
                          priceExVat: 0,
                          priceInclVat: 0,
                        }))
                  }
                  showPrices={showPrices}
                />
              ))}
            </div>
          )}

          <p style={{ marginTop: "1.5rem" }}>
            {showPrices ? (
              <Link href="/order" className="btn btn-primary">
                Review order
              </Link>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(`/suppliers/${supplier.id}`)}`}
                className="btn btn-primary"
              >
                Sign in to view prices
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
