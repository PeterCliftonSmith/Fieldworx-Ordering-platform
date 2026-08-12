import type { Metadata } from "next";
import Link from "next/link";
import { readRegistrations } from "@/lib/registration-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer registrations",
};

export default async function AdminRegistrationsPage() {
  const registrations = await readRegistrations();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="section-kicker">Customers</p>
          <h1>Registrations</h1>
          <p className="muted">
            Restaurant applications submitted from the public registration page.
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
                <th>Buyer</th>
                <th>City</th>
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
                  <td>
                    <p className="admin-table-title">{registration.buyer.name}</p>
                    <p className="muted small">{registration.buyer.email}</p>
                  </td>
                  <td>{registration.deliveryAddress.city}</td>
                  <td>
                    {new Date(registration.createdAt).toLocaleString("en-ZA")}
                  </td>
                  <td className="admin-table-actions">
                    <Link href={`/admin/registrations/${registration.id}`}>
                      View
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
