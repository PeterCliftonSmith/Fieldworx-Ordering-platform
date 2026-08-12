import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SupplierForm } from "@/components/admin/SupplierForm";
import { getSupplier } from "@/lib/catalog-store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supplier = await getSupplier(id);
  return { title: supplier ? `Edit ${supplier.name}` : "Edit supplier" };
}

export default async function EditSupplierPage({ params }: PageProps) {
  const { id } = await params;
  const supplier = await getSupplier(id);
  if (!supplier) notFound();

  return (
    <div className="admin-page">
      <SupplierForm mode="edit" initial={supplier} />
    </div>
  );
}
