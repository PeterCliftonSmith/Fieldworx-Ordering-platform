import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer/session";
import { formatZar } from "@/lib/format";
import { listOrdersForCustomer } from "@/lib/order-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order history",
  description: "View your Fieldworx orders and past submissions.",
};

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function OrdersPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/login?next=/orders");
  }

  const orders = await listOrdersForCustomer(customer.id);

  return (
    <div className="page-shell">
      <header className="page-intro">
        <h1>Order history</h1>
        <p>
          Orders placed for <strong>{customer.tradingName}</strong>. Open any
          order for the full line list and totals.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="order-empty">
          <h2>No orders yet</h2>
          <p>When you submit an order, it will show up here.</p>
          <Link href="/suppliers" className="btn btn-primary">
            Browse suppliers
          </Link>
        </div>
      ) : (
        <div className="orders-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total incl. VAT</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const itemCount = order.lines.reduce(
                  (sum, line) => sum + line.quantity,
                  0,
                );
                return (
                  <tr key={order.id}>
                    <td>
                      <p className="admin-table-title">{order.id}</p>
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleString("en-ZA")}
                    </td>
                    <td>
                      <span className={`status-pill status-${order.status}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td>{itemCount}</td>
                    <td>{formatZar(order.totalInclVat)}</td>
                    <td className="admin-table-actions">
                      <Link href={`/orders/${order.id}`}>View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
