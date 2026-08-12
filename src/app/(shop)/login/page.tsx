import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerLoginForm } from "@/components/CustomerLoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Fieldworx to place supplier orders.",
};

export default function LoginPage() {
  return (
    <div className="page-shell">
      <header className="page-intro">
        <h1>Sign in</h1>
        <p>
          Use the username and password from your restaurant registration.
          Ordering is available once Fieldworx has approved your account.
        </p>
      </header>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
