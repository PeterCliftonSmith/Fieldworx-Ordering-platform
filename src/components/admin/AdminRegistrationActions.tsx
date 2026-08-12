"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RegistrationStatus } from "@/data/registration";

type AdminRegistrationActionsProps = {
  registrationId: string;
  status: RegistrationStatus;
};

export function AdminRegistrationActions({
  registrationId,
  status,
}: AdminRegistrationActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function updateStatus(action: "approve" | "reject") {
    setLoading(action);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/registrations/${registrationId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not update registration.");
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update registration.",
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="admin-registration-actions">
      {status === "pending" ? (
        <>
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading !== null}
            onClick={() => updateStatus("approve")}
          >
            {loading === "approve" ? "Approving…" : "Approve account"}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={loading !== null}
            onClick={() => updateStatus("reject")}
          >
            {loading === "reject" ? "Rejecting…" : "Reject"}
          </button>
        </>
      ) : (
        <p className="muted">
          This registration is already <strong>{status}</strong>.
          {status === "rejected" ? (
            <>
              {" "}
              You can still approve it later if needed.
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginLeft: "0.75rem" }}
                disabled={loading !== null}
                onClick={() => updateStatus("approve")}
              >
                {loading === "approve" ? "Approving…" : "Approve now"}
              </button>
            </>
          ) : (
            <>
              {" "}
              You can reject access if required.
              <button
                type="button"
                className="btn btn-danger"
                style={{ marginLeft: "0.75rem" }}
                disabled={loading !== null}
                onClick={() => updateStatus("reject")}
              >
                {loading === "reject" ? "Rejecting…" : "Reject access"}
              </button>
            </>
          )}
        </p>
      )}
      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}
