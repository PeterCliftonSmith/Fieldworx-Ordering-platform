export type OrderLine = {
  supplierId: string;
  supplierName: string;
  productId: string;
  name: string;
  unit: string;
  image: string;
  imageAlt: string;
  priceExVat: number;
  priceInclVat: number;
  quantity: number;
};

export type OrderStatus = "submitted" | "confirmed" | "fulfilled" | "cancelled";

export type CustomerOrder = {
  id: string;
  createdAt: string;
  customerId: string;
  username: string;
  tradingName: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotalExVat: number;
  vatTotal: number;
  totalInclVat: number;
};

export type CreateOrderInput = {
  lines: OrderLine[];
};

export type OrdersFile = {
  orders: CustomerOrder[];
};
