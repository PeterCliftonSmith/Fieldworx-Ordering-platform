import { NextResponse } from "next/server";
import type { CreateOrderInput } from "@/data/orders";
import { requireCustomer } from "@/lib/customer/session";
import {
  createOrderForCustomer,
  listOrdersForCustomer,
} from "@/lib/order-store";

export async function GET() {
  try {
    const customer = await requireCustomer();
    const orders = await listOrdersForCustomer(customer.id);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const customer = await requireCustomer();
    const body = (await request.json()) as CreateOrderInput;
    const order = await createOrderForCustomer(customer, body);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not submit order.";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
