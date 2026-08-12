import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/customer/session";
import { getOrderForCustomer } from "@/lib/order-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const customer = await requireCustomer();
    const { id } = await context.params;
    const order = await getOrderForCustomer(id, customer.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
