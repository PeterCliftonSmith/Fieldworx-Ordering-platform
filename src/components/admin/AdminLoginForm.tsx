"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(data?.error || "Could not sign in.");
      }

      // Full navigation so the session cookie is included on the next request.
      // Client-side router transitions can race the Set-Cookie behind previews.
      const next = searchParams.get("next") || "/admin";
      const destination = next.startsWith("/admin") ? next : "/admin";
      window.location.assign(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setLoading(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={onSubmit}>
      <label>
        Admin password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error ? <p className="admin-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="muted small">
        Default demo password is <code>fieldworx-admin</code> (no spaces). Set{" "}
        <code>ADMIN_PASSWORD</code> in <code>.env.local</code> to change it.
      </p>
    </form>
  );
}
