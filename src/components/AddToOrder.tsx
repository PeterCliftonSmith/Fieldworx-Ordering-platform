"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductVariation } from "@/data/types";
import { useCustomerAuth } from "@/lib/customer/auth-context";
import { useCart } from "@/lib/cart";
import { formatZar } from "@/lib/format";
import { SupplierImage } from "@/components/SupplierImage";

type ProductCatalogueItemProps = {
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  category: string;
  unit: string;
  image: string;
  imageAlt: string;
  priceExVat: number | null;
  priceInclVat: number | null;
  variations: ProductVariation[];
  showPrices: boolean;
};

export function ProductCatalogueItem({
  supplierId,
  supplierName,
  productId,
  productName,
  category,
  unit,
  image,
  imageAlt,
  priceExVat,
  priceInclVat,
  variations,
  showPrices,
}: ProductCatalogueItemProps) {
  const hasVariations = variations.length > 0;
  const [variationId, setVariationId] = useState(
    hasVariations ? variations[0].id : "",
  );
  const selected = useMemo(
    () => variations.find((variation) => variation.id === variationId),
    [variations, variationId],
  );

  const displayUnit = selected?.unit ?? unit;
  const displayImage = selected?.image || image;
  const displayImageAlt = selected?.imageAlt || imageAlt || productName;
  const displayPriceEx = selected?.priceExVat ?? priceExVat;
  const displayPriceIncl = selected?.priceInclVat ?? priceInclVat;

  return (
    <article className="product-row">
      <div className="product-media">
        {displayImage ? (
          <SupplierImage src={displayImage} alt={displayImageAlt} />
        ) : (
          <div className="product-media-empty" aria-hidden="true" />
        )}
      </div>
      <div className="product-copy">
        <p className="product-name">{productName}</p>
        <p className="muted small">
          {category}
          {hasVariations
            ? ` · ${variations.length} varieties`
            : ` · ${unit}`}
        </p>
        {showPrices && displayPriceEx != null && displayPriceIncl != null ? (
          <div className="product-prices">
            <p>
              <strong>{formatZar(displayPriceEx)}</strong>
              <span className="muted"> excl. VAT</span>
            </p>
            <p className="muted small">
              {formatZar(displayPriceIncl)} incl. VAT · {displayUnit}
            </p>
          </div>
        ) : (
          <div className="product-prices">
            <p className="muted small product-price-hidden">
              Sign in to view price
              {hasVariations ? "" : ` · ${displayUnit}`}
            </p>
          </div>
        )}
      </div>
      <AddToOrder
        supplierId={supplierId}
        supplierName={supplierName}
        productId={productId}
        productName={productName}
        unit={displayUnit}
        image={displayImage}
        imageAlt={displayImageAlt}
        priceExVat={displayPriceEx ?? 0}
        priceInclVat={displayPriceIncl ?? 0}
        variations={variations}
        variationId={variationId}
        onVariationChange={setVariationId}
        showPrices={showPrices}
      />
    </article>
  );
}

type AddToOrderProps = {
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  unit: string;
  image: string;
  imageAlt: string;
  priceExVat: number;
  priceInclVat: number;
  variations?: ProductVariation[];
  variationId?: string;
  onVariationChange?: (variationId: string) => void;
  showPrices?: boolean;
};

export function AddToOrder({
  supplierId,
  supplierName,
  productId,
  productName,
  unit,
  image,
  imageAlt,
  priceExVat,
  priceInclVat,
  variations = [],
  variationId = "",
  onVariationChange,
  showPrices = false,
}: AddToOrderProps) {
  const { customer, ready } = useCustomerAuth();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const hasVariations = variations.length > 0;
  const selected = variations.find((variation) => variation.id === variationId);
  const canOrder = Boolean(customer) && showPrices;

  if (ready && !canOrder) {
    return (
      <div className="add-to-order-locked">
        <Link
          href={`/login?next=${encodeURIComponent(`/suppliers/${supplierId}`)}`}
          className="btn btn-primary"
        >
          Sign in to order
        </Link>
      </div>
    );
  }

  function handleAdd() {
    if (hasVariations && !selected) {
      setLocalError("Choose a variety first.");
      return;
    }
    setLocalError(null);
    addItem({
      supplierId,
      supplierName,
      productId,
      name: productName,
      variationId: selected?.id,
      variationName: selected?.name,
      unit: selected?.unit ?? unit,
      image: selected?.image || image,
      imageAlt: selected?.imageAlt || imageAlt,
      priceExVat: selected?.priceExVat ?? priceExVat,
      priceInclVat: selected?.priceInclVat ?? priceInclVat,
      quantity,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  return (
    <div className="add-to-order">
      {hasVariations ? (
        <label className="variation-label" htmlFor={`var-${productId}`}>
          Variety
          <select
            id={`var-${productId}`}
            className="variation-select"
            value={variationId}
            onChange={(e) => onVariationChange?.(e.target.value)}
            aria-label={`Variety for ${productName}`}
          >
            {variations.map((variation) => (
              <option key={variation.id} value={variation.id}>
                {variation.name} · {variation.unit}
                {showPrices
                  ? ` · ${formatZar(variation.priceExVat)} excl`
                  : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label
        className="qty-label"
        htmlFor={`qty-${productId}-${variationId || "base"}`}
      >
        Qty
        <input
          id={`qty-${productId}-${variationId || "base"}`}
          className="qty-input"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, Number(e.target.value) || 1))
          }
          aria-label={`Quantity for ${productName}`}
        />
      </label>
      <button
        type="button"
        className={`btn btn-primary ${justAdded ? "btn-pulse" : ""}`}
        onClick={handleAdd}
        disabled={!ready || !canOrder || (hasVariations && !selected)}
      >
        {justAdded ? "Added" : "Add to order"}
      </button>
      {localError ? <p className="add-to-order-error">{localError}</p> : null}
    </div>
  );
}
