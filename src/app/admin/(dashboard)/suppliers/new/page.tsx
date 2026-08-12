import type { Metadata } from "next";
import { SupplierForm } from "@/components/admin/SupplierForm";

export const metadata: Metadata = {
  title: "Add supplier",
};

export default function NewSupplierPage() {
  return (
    <div className="admin-page">
      <SupplierForm mode="create" />
    </div>
  );
}
