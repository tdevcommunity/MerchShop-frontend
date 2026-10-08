"use client";

import { useEffect, useState } from "react";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { ProductForm } from "@/features/admin/components/product-form";
import { adminList } from "@/features/admin/services/admin-client";
import type { AdminCategory } from "@/types/admin";

export default function AdminNewProductPage() {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void adminList<AdminCategory>("/api/admin/categories")
      .then(setCategories)
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  return (
    <div>
      <PageHeader
        title="Nouveau produit"
        description="Publié, il apparaît automatiquement dans le Shop public."
      />
      <AdminState loading={!categories && !error} error={error} />
      {categories ? <ProductForm categories={categories} /> : null}
    </div>
  );
}
