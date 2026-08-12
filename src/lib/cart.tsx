"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { roundMoney, vatAmount } from "@/lib/format";

export type CartLine = {
  supplierId: string;
  supplierName: string;
  productId: string;
  name: string;
  variationId?: string;
  variationName?: string;
  unit: string;
  image: string;
  imageAlt: string;
  priceExVat: number;
  priceInclVat: number;
  quantity: number;
};

type AddItemInput = {
  supplierId: string;
  supplierName: string;
  productId: string;
  name: string;
  variationId?: string;
  variationName?: string;
  unit: string;
  image: string;
  imageAlt: string;
  priceExVat: number;
  priceInclVat: number;
  quantity?: number;
};

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotalExVat: number;
  vatTotal: number;
  totalInclVat: number;
  ready: boolean;
  addItem: (input: AddItemInput) => void;
  setQuantity: (
    supplierId: string,
    productId: string,
    quantity: number,
    variationId?: string,
  ) => void;
  removeItem: (
    supplierId: string,
    productId: string,
    variationId?: string,
  ) => void;
  clear: () => void;
};

const STORAGE_KEY = "fieldworx-order-draft-v4";

const CartContext = createContext<CartContextValue | null>(null);

export function lineKey(
  supplierId: string,
  productId: string,
  variationId?: string,
) {
  return variationId
    ? `${supplierId}:${productId}:${variationId}`
    : `${supplierId}:${productId}`;
}

function normalizeLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const lines: CartLine[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const line = item as Partial<CartLine> & { price?: number };
    if (
      typeof line.supplierId !== "string" ||
      typeof line.productId !== "string" ||
      typeof line.name !== "string"
    ) {
      continue;
    }

    const priceExVat =
      typeof line.priceExVat === "number"
        ? line.priceExVat
        : typeof line.price === "number"
          ? line.price
          : null;
    const priceInclVat =
      typeof line.priceInclVat === "number"
        ? line.priceInclVat
        : priceExVat != null
          ? roundMoney(priceExVat * 1.15)
          : null;

    if (priceExVat == null || priceInclVat == null) continue;

    lines.push({
      supplierId: line.supplierId,
      supplierName:
        typeof line.supplierName === "string" ? line.supplierName : "Supplier",
      productId: line.productId,
      name: line.name,
      variationId:
        typeof line.variationId === "string" && line.variationId
          ? line.variationId
          : undefined,
      variationName:
        typeof line.variationName === "string" && line.variationName
          ? line.variationName
          : undefined,
      unit: typeof line.unit === "string" ? line.unit : "",
      image: typeof line.image === "string" ? line.image : "",
      imageAlt: typeof line.imageAlt === "string" ? line.imageAlt : line.name,
      priceExVat,
      priceInclVat,
      quantity:
        typeof line.quantity === "number" && line.quantity > 0
          ? line.quantity
          : 1,
    });
  }
  return lines;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(normalizeLines(JSON.parse(raw)));
    } catch {
      // Ignore corrupt drafts
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const addItem = useCallback((input: AddItemInput) => {
    const quantity = input.quantity ?? 1;
    setLines((current) => {
      const key = lineKey(input.supplierId, input.productId, input.variationId);
      const existing = current.find(
        (line) =>
          lineKey(line.supplierId, line.productId, line.variationId) === key,
      );
      if (existing) {
        return current.map((line) =>
          lineKey(line.supplierId, line.productId, line.variationId) === key
            ? {
                ...line,
                ...input,
                quantity: line.quantity + quantity,
              }
            : line,
        );
      }
      return [
        ...current,
        {
          supplierId: input.supplierId,
          supplierName: input.supplierName,
          productId: input.productId,
          name: input.name,
          variationId: input.variationId,
          variationName: input.variationName,
          unit: input.unit,
          image: input.image,
          imageAlt: input.imageAlt,
          priceExVat: input.priceExVat,
          priceInclVat: input.priceInclVat,
          quantity,
        },
      ];
    });
  }, []);

  const setQuantity = useCallback(
    (
      supplierId: string,
      productId: string,
      quantity: number,
      variationId?: string,
    ) => {
      const key = lineKey(supplierId, productId, variationId);
      setLines((current) => {
        if (quantity <= 0) {
          return current.filter(
            (line) =>
              lineKey(line.supplierId, line.productId, line.variationId) !==
              key,
          );
        }
        return current.map((line) =>
          lineKey(line.supplierId, line.productId, line.variationId) === key
            ? { ...line, quantity }
            : line,
        );
      });
    },
    [],
  );

  const removeItem = useCallback(
    (supplierId: string, productId: string, variationId?: string) => {
      const key = lineKey(supplierId, productId, variationId);
      setLines((current) =>
        current.filter(
          (line) =>
            lineKey(line.supplierId, line.productId, line.variationId) !== key,
        ),
      );
    },
    [],
  );

  const clear = useCallback(() => setLines([]), []);

  const totals = useMemo(() => {
    let count = 0;
    let subtotalExVat = 0;
    let totalInclVat = 0;
    for (const line of lines) {
      count += line.quantity;
      subtotalExVat += line.priceExVat * line.quantity;
      totalInclVat += line.priceInclVat * line.quantity;
    }
    subtotalExVat = roundMoney(subtotalExVat);
    totalInclVat = roundMoney(totalInclVat);
    return {
      itemCount: count,
      subtotalExVat,
      vatTotal: vatAmount(subtotalExVat, totalInclVat),
      totalInclVat,
    };
  }, [lines]);

  const value = useMemo(
    () => ({
      lines,
      ...totals,
      ready,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [lines, totals, ready, addItem, setQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
