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
import { getProduct } from "@/data/catalog";

export type CartLine = {
  supplierId: string;
  productId: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  ready: boolean;
  addItem: (supplierId: string, productId: string, quantity?: number) => void;
  setQuantity: (
    supplierId: string,
    productId: string,
    quantity: number,
  ) => void;
  removeItem: (supplierId: string, productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "fieldworx-order-draft";

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(supplierId: string, productId: string) {
  return `${supplierId}:${productId}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) setLines(parsed);
      }
    } catch {
      // Ignore corrupt drafts
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const addItem = useCallback(
    (supplierId: string, productId: string, quantity = 1) => {
      setLines((current) => {
        const key = lineKey(supplierId, productId);
        const existing = current.find(
          (line) => lineKey(line.supplierId, line.productId) === key,
        );
        if (existing) {
          return current.map((line) =>
            lineKey(line.supplierId, line.productId) === key
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          );
        }
        return [...current, { supplierId, productId, quantity }];
      });
    },
    [],
  );

  const setQuantity = useCallback(
    (supplierId: string, productId: string, quantity: number) => {
      setLines((current) => {
        if (quantity <= 0) {
          return current.filter(
            (line) =>
              lineKey(line.supplierId, line.productId) !==
              lineKey(supplierId, productId),
          );
        }
        return current.map((line) =>
          lineKey(line.supplierId, line.productId) ===
          lineKey(supplierId, productId)
            ? { ...line, quantity }
            : line,
        );
      });
    },
    [],
  );

  const removeItem = useCallback((supplierId: string, productId: string) => {
    setLines((current) =>
      current.filter(
        (line) =>
          lineKey(line.supplierId, line.productId) !==
          lineKey(supplierId, productId),
      ),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { itemCount, subtotal } = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const line of lines) {
      count += line.quantity;
      const match = getProduct(line.supplierId, line.productId);
      if (match) total += match.product.price * line.quantity;
    }
    return { itemCount: count, subtotal: total };
  }, [lines]);

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      subtotal,
      ready,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [
      lines,
      itemCount,
      subtotal,
      ready,
      addItem,
      setQuantity,
      removeItem,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
