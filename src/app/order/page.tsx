import type { Metadata } from "next";
import { OrderDraft } from "@/components/OrderDraft";

export const metadata: Metadata = {
  title: "Order",
  description: "Review and submit your Fieldworx draft order.",
};

export default function OrderPage() {
  return (
    <div className="page-shell">
      <header className="page-intro">
        <h1>Your order</h1>
        <p>
          Review quantities across suppliers, then submit a draft. This first
          version stores your draft in this browser only.
        </p>
      </header>
      <OrderDraft />
    </div>
  );
}
