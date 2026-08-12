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
          You are signed in. Review quantities across suppliers, then submit an
          order. Submitted orders appear in your order history.
        </p>
      </header>
      <OrderDraft />
    </div>
  );
}
