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

export type CartLine = {
  supplierId: string;
  supplierName: string;
  productId: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
};

type AddItemInput = {
  supplierId: string;
  supplierName: string;
  productId: string;
  name: string;
  unit: string;
  price: number;
  quantity?: number;
};

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  ready: boolean;
  addItem: (input: AddItemInput) => void;
  setQuantity: (
    supplierId: string,
    productId: string,
    quantity: number,
  ) => void;
  removeItem: (supplierId: string, productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "fieldworx-order-draft-v2";

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(supplierId: string, productId: string) {
  return `${supplierId}:${productId}`;
}

function normalizeLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const line = item as Partial<CartLine>;
      if (
        typeof line.supplierId !== "string" ||
        typeof line.productId !== "string" ||
        typeof line.name !== "string" ||
        typeof line.price !== "number"
      ) {
        return null;
      }
      return {
        supplierId: line.supplierId,
        supplierName:
          typeof line.supplierName === "string" ? line.supplierName : "Supplier",
        productId: line.productId,
        name: line.name,
        unit: typeof line.unit === "string" ? line.unit : "",
        price: line.price,
        quantity:
          typeof line.quantity === "number" && line.quantity > 0
            ? line.quantity
            : 1,
      } satisfies CartLine;
    })
    .filter((line): line is CartLine => Boolean(line));
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
      const key = lineKey(input.supplierId, input.productId);
      const existing = current.find(
        (line) => lineKey(line.supplierId, line.productId) === key,
      );
      if (existing) {
        return current.map((line) =>
          lineKey(line.supplierId, line.productId) === key
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
          unit: input.unit,
          price: input.price,
          quantity,
        },
      ];
    });
  }, []);

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
      total += line.price * line.quantity;
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
