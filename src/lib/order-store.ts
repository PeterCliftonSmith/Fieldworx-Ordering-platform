import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  CreateOrderInput,
  CustomerOrder,
  OrderLine,
  OrdersFile,
} from "@/data/orders";
import type { PublicCustomer } from "@/data/registration";
import { roundMoney, vatAmount } from "@/lib/format";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_PATH = path.join(DATA_DIR, "orders.json");

async function ensureOrdersFile(): Promise<void> {
  try {
    await fs.access(ORDERS_PATH);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      ORDERS_PATH,
      JSON.stringify({ orders: [] }, null, 2) + "\n",
      "utf8",
    );
  }
}

export async function readOrders(): Promise<CustomerOrder[]> {
  await ensureOrdersFile();
  const raw = await fs.readFile(ORDERS_PATH, "utf8");
  const parsed = JSON.parse(raw) as OrdersFile;
  if (!parsed || !Array.isArray(parsed.orders)) return [];
  return parsed.orders;
}

async function writeOrders(orders: CustomerOrder[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${ORDERS_PATH}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify({ orders }, null, 2) + "\n", "utf8");
  await fs.rename(tmp, ORDERS_PATH);
}

function normalizeLine(input: Partial<OrderLine>): OrderLine {
  const quantity = Number(input.quantity);
  const priceExVat = Number(input.priceExVat);
  const priceInclVat = Number(input.priceInclVat);

  if (!input.supplierId || !input.productId || !input.name) {
    throw new Error("Each order line needs a supplier, product, and name.");
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Each order line needs a valid quantity.");
  }
  if (!Number.isFinite(priceExVat) || priceExVat < 0) {
    throw new Error("Each order line needs a valid excluding-VAT price.");
  }
  if (!Number.isFinite(priceInclVat) || priceInclVat < 0) {
    throw new Error("Each order line needs a valid including-VAT price.");
  }

  const variationId =
    typeof input.variationId === "string" && input.variationId.trim()
      ? input.variationId.trim()
      : undefined;
  const variationName =
    typeof input.variationName === "string" && input.variationName.trim()
      ? input.variationName.trim()
      : undefined;

  return {
    supplierId: String(input.supplierId),
    supplierName: String(input.supplierName ?? "Supplier"),
    productId: String(input.productId),
    name: String(input.name),
    variationId,
    variationName,
    unit: String(input.unit ?? ""),
    image: String(input.image ?? ""),
    imageAlt: String(input.imageAlt ?? input.name),
    priceExVat: roundMoney(priceExVat),
    priceInclVat: roundMoney(priceInclVat),
    quantity: Math.floor(quantity),
  };
}

export async function createOrderForCustomer(
  customer: PublicCustomer,
  input: CreateOrderInput,
): Promise<CustomerOrder> {
  const lines = (input.lines ?? []).map((line) => normalizeLine(line));
  if (lines.length === 0) {
    throw new Error("Add at least one product before submitting an order.");
  }

  let subtotalExVat = 0;
  let totalInclVat = 0;
  for (const line of lines) {
    subtotalExVat += line.priceExVat * line.quantity;
    totalInclVat += line.priceInclVat * line.quantity;
  }
  subtotalExVat = roundMoney(subtotalExVat);
  totalInclVat = roundMoney(totalInclVat);

  const order: CustomerOrder = {
    id: `ord-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`,
    createdAt: new Date().toISOString(),
    customerId: customer.id,
    username: customer.username,
    tradingName: customer.tradingName,
    status: "submitted",
    lines,
    subtotalExVat,
    vatTotal: vatAmount(subtotalExVat, totalInclVat),
    totalInclVat,
  };

  const orders = await readOrders();
  orders.unshift(order);
  await writeOrders(orders);
  return order;
}

export async function listOrdersForCustomer(
  customerId: string,
): Promise<CustomerOrder[]> {
  const orders = await readOrders();
  return orders.filter((order) => order.customerId === customerId);
}

export async function getOrderForCustomer(
  orderId: string,
  customerId: string,
): Promise<CustomerOrder | undefined> {
  const orders = await readOrders();
  return orders.find(
    (order) => order.id === orderId && order.customerId === customerId,
  );
}
