import type { Metadata } from "next";
import Link from "next/link";
import { listSuppliers } from "@/lib/catalog-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin suppliers",
};

export default async function AdminHomePage() {
  const suppliers = await listSuppliers();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="section-kicker">Catalogue</p>
          <h1>Suppliers</h1>
          <p className="muted">
            Add, edit, or remove suppliers and the products restaurants can
            order.
          </p>
        </div>
        <Link href="/admin/suppliers/new" className="btn btn-primary">
          Add supplier
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="admin-empty">
          <h2>No suppliers yet</h2>
          <p className="muted">
            Create the first supplier to populate the customer-facing catalogue.
          </p>
          <Link href="/admin/suppliers/new" className="btn btn-primary">
            Add supplier
          </Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Region</th>
                <th>Specialty</th>
                <th>Products</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <p className="admin-table-title">{supplier.name}</p>
                    <p className="muted small">{supplier.leadTime}</p>
                  </td>
                  <td>{supplier.region}</td>
                  <td>{supplier.specialty}</td>
                  <td>{supplier.products.length}</td>
                  <td className="admin-table-actions">
                    <Link href={`/admin/suppliers/${supplier.id}`}>Edit</Link>
                    <Link href={`/suppliers/${supplier.id}`}>View</Link>
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
