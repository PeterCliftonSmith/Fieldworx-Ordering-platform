import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand-block">
            <Link href="/admin" className="brand-mark">
              Fieldworx
            </Link>
            <span className="admin-badge">Admin</span>
          </div>
          <nav className="admin-nav">
            <Link href="/admin">Suppliers</Link>
            <Link href="/admin/suppliers/new">Add supplier</Link>
            <Link href="/">View site</Link>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <div className="admin-main">{children}</div>
    </div>
  );
}
