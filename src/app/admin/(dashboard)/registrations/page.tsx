import type { Metadata } from "next";
import Link from "next/link";
import { readRegistrations } from "@/lib/registration-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer registrations",
};

function statusLabel(status: string) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

export default async function AdminRegistrationsPage() {
  const registrations = await readRegistrations();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="section-kicker">Customers</p>
          <h1>Registrations</h1>
          <p className="muted">
            Review restaurant applications, then approve accounts so they can
            sign in and place orders.
          </p>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="admin-empty">
          <h2>No registrations yet</h2>
          <p className="muted">
            When a restaurant submits{" "}
            <Link href="/register">/register</Link>, it will appear here.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Username</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td>
                    <p className="admin-table-title">
                      {registration.tradingName}
                    </p>
                    <p className="muted small">
                      {registration.registeredBusinessName}
                    </p>
                  </td>
                  <td>{registration.username || "—"}</td>
                  <td>
                    <span className={`status-pill status-${registration.status}`}>
                      {statusLabel(registration.status)}
                    </span>
                  </td>
                  <td>
                    {new Date(registration.createdAt).toLocaleString("en-ZA")}
                  </td>
                  <td className="admin-table-actions">
                    <Link href={`/admin/registrations/${registration.id}`}>
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
