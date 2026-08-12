import Image from "next/image";
import Link from "next/link";
import { MotionReveal } from "@/components/MotionReveal";
import { SupplierImage } from "@/components/SupplierImage";
import { listSuppliers } from "@/lib/catalog-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const suppliers = await listSuppliers();

  return (
    <>
      <section className="hero" aria-label="Fieldworx introduction">
        <div className="hero-media" aria-hidden="true">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-scrim" />
        </div>
        <div className="hero-content">
          <p className="hero-brand">Fieldworx</p>
          <h1 className="hero-headline">
            Order from suppliers. Keep the kitchen moving.
          </h1>
          <p className="hero-support">
            One place for restaurateurs to buy direct from trusted suppliers —
            Fieldworx sits in the middle and keeps the order clear.
          </p>
          <div className="hero-actions">
            <Link href="/suppliers" className="btn btn-primary">
              Browse suppliers
            </Link>
            <Link href="/how-it-works" className="btn btn-ghost">
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-shell">
          <MotionReveal>
            <p className="section-kicker">Suppliers on Fieldworx</p>
            <h2 className="section-title">Built for trade kitchens</h2>
            <p className="section-support">
              Start with produce, seafood, meat, and dry goods — then build your
              draft order as you go.
            </p>
          </MotionReveal>

          <div className="supplier-list">
            {suppliers.slice(0, 3).map((supplier, index) => (
              <MotionReveal key={supplier.id} delayMs={index * 90}>
                <article className="supplier-row">
                  <div className="supplier-image">
                    <SupplierImage
                      src={supplier.image}
                      alt={supplier.imageAlt}
                    />
                  </div>
                  <div className="supplier-copy">
                    <p className="supplier-meta">
                      {supplier.region} · {supplier.leadTime}
                    </p>
                    <h3 className="supplier-name">{supplier.name}</h3>
                    <p className="supplier-blurb">{supplier.blurb}</p>
                    <div>
                      <Link
                        href={`/suppliers/${supplier.id}`}
                        className="btn btn-primary"
                      >
                        View catalogue
                      </Link>
                    </div>
                  </div>
                </article>
              </MotionReveal>
            ))}
          </div>

          <MotionReveal className="section" delayMs={80}>
            <Link href="/suppliers" className="btn btn-ghost">
              See all suppliers
            </Link>
          </MotionReveal>
        </div>
      </section>
    </>
  );
}
