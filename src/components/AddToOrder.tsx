"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

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
}: AddToOrderProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem({
      supplierId,
      supplierName,
      productId,
      name: productName,
      unit,
      image,
      imageAlt,
      priceExVat,
      priceInclVat,
      quantity,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  return (
    <div className="add-to-order">
      <label className="qty-label" htmlFor={`qty-${productId}`}>
        Qty
        <input
          id={`qty-${productId}`}
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
      >
        {justAdded ? "Added" : "Add to order"}
      </button>
    </div>
  );
}
