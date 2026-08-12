import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/session";

export async function GET() {
  const customer = await getCurrentCustomer();
  return NextResponse.json({ customer });
}
