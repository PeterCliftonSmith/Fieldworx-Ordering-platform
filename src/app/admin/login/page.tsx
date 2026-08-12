import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default function AdminLoginPage() {
  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="section-kicker">Fieldworx</p>
        <h1>Admin sign in</h1>
        <p className="muted">
          Manage suppliers and product catalogues shown on the customer site.
        </p>
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
