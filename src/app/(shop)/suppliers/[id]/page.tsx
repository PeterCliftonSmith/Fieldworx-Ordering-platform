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
            <table className="product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>
                    <span className="sr-only">Add</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {supplier.products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <p className="product-name">{product.name}</p>
                      <p className="muted small">{product.category}</p>
                    </td>
                    <td>{product.unit}</td>
                    <td>{formatZar(product.price)}</td>
                    <td>
                      <AddToOrder
                        supplierId={supplier.id}
                        supplierName={supplier.name}
                        productId={product.id}
                        productName={product.name}
                        unit={product.unit}
                        price={product.price}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
