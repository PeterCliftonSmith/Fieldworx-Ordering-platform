import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer/session";
import { formatZar } from "@/lib/format";
import { getOrderForCustomer } from "@/lib/order-store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id}` };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    const { id } = await params;
    redirect(`/login?next=/orders/${id}`);
  }

  const { id } = await params;
  const order = await getOrderForCustomer(id, customer.id);
  if (!order) notFound();

  const bySupplier = new Map<
    string,
    { supplierName: string; lines: typeof order.lines }
  >();
  for (const line of order.lines) {
    const existing = bySupplier.get(line.supplierId);
    if (existing) existing.lines.push(line);
    else {
      bySupplier.set(line.supplierId, {
        supplierName: line.supplierName,
        lines: [line],
      });
    }
  }

  return (
    <div className="page-shell">
      <header className="page-intro">
        <p className="section-kicker">
          <Link href="/orders">Order history</Link>
        </p>
        <h1>{order.id}</h1>
        <p>
          Placed {new Date(order.createdAt).toLocaleString("en-ZA")} ·{" "}
          <span className={`status-pill status-${order.status}`}>
            {order.status}
          </span>
        </p>
      </header>

      <div className="order-draft">
        {[...bySupplier.entries()].map(([supplierId, group]) => (
          <section key={supplierId} className="order-supplier-group">
            <h2>
              <Link href={`/suppliers/${supplierId}`}>
                {group.supplierName}
              </Link>
            </h2>
            <ul className="order-lines">
              {group.lines.map((line) => (
                <li
                  key={`${line.supplierId}-${line.productId}-${line.variationId ?? "base"}`}
                >
                  <div className="order-line-main">
                    <div className="order-line-media">
                      {line.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={line.image}
                          alt={line.imageAlt || line.name}
                        />
                      ) : null}
                      <div>
                        <p className="order-line-name">{line.name}</p>
                        {line.variationName ? (
                          <p className="order-line-variation">
                            {line.variationName}
                          </p>
                        ) : null}
                        <p className="muted">
                          Qty {line.quantity} · {line.unit} ·{" "}
                          {formatZar(line.priceExVat)} excl /{" "}
                          {formatZar(line.priceInclVat)} incl
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="order-line-total">
                    <p>
                      {formatZar(line.priceExVat * line.quantity)} excl
                    </p>
                    <p className="muted small">
                      {formatZar(line.priceInclVat * line.quantity)} incl
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="order-summary">
          <div className="order-summary-row">
            <span>Subtotal excl. VAT</span>
            <strong>{formatZar(order.subtotalExVat)}</strong>
          </div>
          <div className="order-summary-row muted">
            <span>VAT</span>
            <span>{formatZar(order.vatTotal)}</span>
          </div>
          <div className="order-summary-row order-summary-total">
            <span>Total incl. VAT</span>
            <strong>{formatZar(order.totalInclVat)}</strong>
          </div>
          <div className="order-summary-actions">
            <Link href="/orders" className="btn btn-ghost">
              Back to history
            </Link>
            <Link href="/order" className="btn btn-primary">
              Start a new order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
