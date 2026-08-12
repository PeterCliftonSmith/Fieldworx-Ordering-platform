"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [submitted, setSubmitted] = useState(false);

  if (!ready) {
    return <p className="muted">Loading your draft order…</p>;
  }

  if (submitted) {
    return (
      <div className="order-success">
        <h2>Order draft sent</h2>
        <p>
          This demo confirms the flow. In the live product, suppliers would
          receive the order and your kitchen would get a confirmation.
        </p>
        <Link href="/suppliers" className="btn btn-primary">
          Keep browsing
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="order-empty">
        <h2>Your order is empty</h2>
        <p>Browse suppliers and add the lines your kitchen needs.</p>
        <Link href="/suppliers" className="btn btn-primary">
          Browse suppliers
        </Link>
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
          Delivery fees and supplier cut-offs would be confirmed before placing
          a live order.
        </p>
        <div className="order-summary-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              clear();
              setSubmitted(true);
            }}
          >
            Submit draft order
          </button>
          <button type="button" className="btn btn-ghost" onClick={clear}>
            Clear draft
          </button>
        </div>
      </div>
    </div>
  );
}
