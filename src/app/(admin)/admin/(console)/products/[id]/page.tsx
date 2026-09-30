"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { ProductForm } from "@/features/admin/components/product-form";
import { adminRequest } from "@/features/admin/services/admin-client";
import type { AdminCategory, AdminProduct } from "@/types/admin";

export default function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      adminRequest<AdminProduct>(`/api/admin/products/${id}`),
      adminRequest<AdminCategory[]>("/api/admin/categories"),
    ])
      .then(([nextProduct, nextCategories]) => {
        setProduct(nextProduct);
        setCategories(nextCategories);
      })
      .catch((loadError: Error) => setError(loadError.message));
  }, [id]);

  return (
    <div>
      <PageHeader
        title={product?.name ?? "Produit"}
        description="Modification du catalogue partagé avec le Shop."
      />
      <AdminState loading={(!product || !categories) && !error} error={error} />
      {product && categories ? <ProductForm categories={categories} product={product} /> : null}
    </div>
  );
}
