"use client";

import Link from "next/link";
import { useState } from "react";
import type { CustomerOrder } from "@/data/orders";
import { useCart } from "@/lib/cart";
import { formatZar } from "@/lib/format";

export function OrderDraft() {
  const {
    lines,
    subtotalExVat,
    vatTotal,
    totalInclVat,
    setQuantity,
    removeItem,
    clear,
    ready,
  } = useCart();
  const [submittedOrder, setSubmittedOrder] = useState<CustomerOrder | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return <p className="muted">Loading your draft order…</p>;
  }

  if (submittedOrder) {
    return (
      <div className="order-success">
        <h2>Order submitted</h2>
        <p>
          Your order <strong>{submittedOrder.id}</strong> is saved to your
          account history.
        </p>
        <div className="register-actions">
          <Link
            href={`/orders/${submittedOrder.id}`}
            className="btn btn-primary"
          >
            View this order
          </Link>
          <Link href="/orders" className="btn btn-ghost">
            Order history
          </Link>
          <Link href="/suppliers" className="btn btn-ghost">
            Keep browsing
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="order-empty">
        <h2>Your order is empty</h2>
        <p>Browse suppliers and add the lines your kitchen needs.</p>
        <div className="register-actions">
          <Link href="/suppliers" className="btn btn-primary">
            Browse suppliers
          </Link>
          <Link href="/orders" className="btn btn-ghost">
            View order history
          </Link>
        </div>
      </div>
    );
  }

  const bySupplier = new Map<
    string,
    { supplierName: string; lines: typeof lines }
  >();

  for (const line of lines) {
    const existing = bySupplier.get(line.supplierId);
    if (existing) {
      existing.lines.push(line);
    } else {
      bySupplier.set(line.supplierId, {
        supplierName: line.supplierName,
        lines: [line],
      });
    }
  }

  async function submitOrder() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ lines }),
      });
      const data = (await response.json()) as {
        error?: string;
        order?: CustomerOrder;
      };
      if (!response.ok || !data.order) {
        throw new Error(data.error || "Could not submit order.");
      }
      clear();
      setSubmittedOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="order-draft">
      {[...bySupplier.entries()].map(([supplierId, group]) => (
        <section key={supplierId} className="order-supplier-group">
          <h2>
            <Link href={`/suppliers/${supplierId}`}>{group.supplierName}</Link>
          </h2>
          <ul className="order-lines">
            {group.lines.map((line) => (
              <li key={`${line.supplierId}-${line.productId}`}>
                <div className="order-line-main">
                  <div className="order-line-media">
                    {line.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={line.image} alt={line.imageAlt || line.name} />
                    ) : null}
                    <div>
                      <p className="order-line-name">{line.name}</p>
                      <p className="muted">
                        {formatZar(line.priceExVat)} excl /{" "}
                        {formatZar(line.priceInclVat)} incl · {line.unit}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="order-line-actions">
                  <label className="sr-only" htmlFor={`line-${line.productId}`}>
                    Quantity for {line.name}
                  </label>
                  <input
                    id={`line-${line.productId}`}
                    className="qty-input"
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) =>
                      setQuantity(
                        line.supplierId,
                        line.productId,
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                  />
                  <div className="order-line-total">
                    <p>{formatZar(line.priceExVat * line.quantity)} excl</p>
                    <p className="muted small">
                      {formatZar(line.priceInclVat * line.quantity)} incl
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() =>
                      removeItem(line.supplierId, line.productId)
                    }
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="order-summary">
        <div className="order-summary-row">
          <span>Subtotal excl. VAT</span>
          <strong>{formatZar(subtotalExVat)}</strong>
        </div>
        <div className="order-summary-row muted">
          <span>VAT</span>
          <span>{formatZar(vatTotal)}</span>
        </div>
        <div className="order-summary-row order-summary-total">
          <span>Total incl. VAT</span>
          <strong>{formatZar(totalInclVat)}</strong>
        </div>
        <p className="muted small">
          Submitted orders are saved to your account history.
        </p>
        {error ? <p className="admin-error">{error}</p> : null}
        <div className="order-summary-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={submitOrder}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit order"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={clear}
            disabled={submitting}
          >
            Clear draft
          </button>
          <Link href="/orders" className="btn btn-ghost">
            Order history
          </Link>
        </div>
      </div>
    </div>
  );
}
