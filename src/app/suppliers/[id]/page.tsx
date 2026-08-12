import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToOrder } from "@/components/AddToOrder";
import { getSupplier, suppliers } from "@/data/catalog";
import { formatZar } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return suppliers.map((supplier) => ({ id: supplier.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supplier = getSupplier(id);
  if (!supplier) return { title: "Supplier" };
  return {
    title: supplier.name,
    description: supplier.blurb,
  };
}

export default async function SupplierDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supplier = getSupplier(id);
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
          <Image
            src={supplier.image}
            alt={supplier.imageAlt}
            fill
            priority
            sizes="(max-width: 860px) 100vw, 45vw"
          />
        </div>

        <div className="catalog-details">
          <h1>{supplier.name}</h1>
          <p className="muted">
            {supplier.specialty} · {supplier.leadTime}
          </p>
          <p>{supplier.blurb}</p>

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
                      productId={product.id}
                      productName={product.name}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
