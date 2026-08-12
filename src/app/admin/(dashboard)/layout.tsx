import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
            <Link href="/admin" prefetch={false} className="brand-mark">
              Fieldworx
            </Link>
            <span className="admin-badge">Admin</span>
          </div>
          <nav className="admin-nav">
            <Link href="/admin" prefetch={false}>
              Suppliers
            </Link>
            <Link href="/admin/registrations" prefetch={false}>
              Registrations
            </Link>
            <Link href="/admin/suppliers/new" prefetch={false}>
              Add supplier
            </Link>
            <Link href="/" prefetch={false}>
              View site
            </Link>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <div className="admin-main">{children}</div>
    </div>
  );
}
