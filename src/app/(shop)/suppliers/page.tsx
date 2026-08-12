import type { Metadata } from "next";
import Link from "next/link";
import { MotionReveal } from "@/components/MotionReveal";
import { SupplierImage } from "@/components/SupplierImage";
import { listSuppliers } from "@/lib/catalog-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suppliers",
  description:
    "Browse Fieldworx suppliers for produce, seafood, meat, and pantry staples.",
};

export default async function SuppliersPage() {
  const suppliers = await listSuppliers();

  return (
    <div className="page-shell">
      <header className="page-intro">
        <MotionReveal>
          <h1>Suppliers</h1>
          <p>
            Choose a supplier, add lines for your service week, and send one
            clear order through Fieldworx.
          </p>
        </MotionReveal>
      </header>

      <div className="supplier-list section" style={{ paddingTop: 0 }}>
        {suppliers.length === 0 ? (
          <p className="muted">No suppliers published yet.</p>
        ) : (
          suppliers.map((supplier, index) => (
            <MotionReveal key={supplier.id} delayMs={index * 70}>
              <article className="supplier-row">
                <div className="supplier-image">
                  <SupplierImage
                    src={supplier.image}
                    alt={supplier.imageAlt}
                  />
                </div>
                <div className="supplier-copy">
                  <p className="supplier-meta">
                    {supplier.specialty} · {supplier.region}
                  </p>
                  <h2 className="supplier-name">{supplier.name}</h2>
                  <p className="supplier-blurb">{supplier.blurb}</p>
                  <p className="muted small">{supplier.leadTime}</p>
                  <div>
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className="btn btn-primary"
                    >
                      Open catalogue
                    </Link>
                  </div>
                </div>
              </article>
            </MotionReveal>
          ))
        )}
      </div>
    </div>
  );
}
