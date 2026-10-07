"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminAction } from "@/features/admin/components/admin-action";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { adminRequest, adminList } from "@/features/admin/services/admin-client";
import type { AdminCategory } from "@/types/admin";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void adminList<AdminCategory>("/api/admin/categories")
      .then(setCategories)
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  async function load() {
    setCategories(await adminList<AdminCategory>("/api/admin/categories"));
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminRequest("/api/admin/categories", {
        method: "POST",
        body: { label, slug },
      });
      setLabel("");
      setSlug("");
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Création impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function patch(id: string, body: Partial<AdminCategory>) {
    try {
      const updated = await adminRequest<AdminCategory>(`/api/admin/categories/${id}`, {
        method: "PATCH",
        body,
      });
      setCategories((current) =>
        [...(current ?? []).map((category) => (category.id === id ? updated : category))].sort(
          (left, right) => left.sortOrder - right.sortOrder,
        ),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Mise à jour impossible.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Catégories"
        description="Textile, Accessoires & Bureau, Bagagerie & Goodies — plus celles que tu ajoutes."
      />
      <form onSubmit={create} className="mb-6 grid max-w-xl gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Input name="label" label="Libellé" value={label} onChange={(event) => setLabel(event.target.value)} />
        <Input name="slug" label="Slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
        <Button type="submit" variant="brand" className="self-end" disabled={saving}>
          Ajouter
        </Button>
      </form>
      <AdminState
        loading={!categories && !error}
        error={error}
        empty={Boolean(categories) && categories?.length === 0}
        emptyTitle="Aucune catégorie"
        emptyHint="Ajoutez Textile, Accessoires ou une nouvelle famille."
      />
      {categories && categories.length > 0 ? (
        <div className="overflow-x-auto border border-tdev-anthracite bg-tdev-white">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-tdev-surface text-[11px] font-extrabold uppercase tracking-[0.12em]">
              <tr>
                <th className="p-3">Ordre</th>
                <th className="p-3">Libellé</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id} className="border-t border-tdev-border">
                  <td className="p-3">{category.sortOrder}</td>
                  <td className="p-3 font-medium">{category.label}</td>
                  <td className="p-3">{category.slug}</td>
                  <td className="p-3">
                    <StatusBadge value={category.active ? "active" : "inactive"} />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <AdminAction
                        disabled={index === 0}
                        onClick={() =>
                          void patch(category.id, { sortOrder: Math.max(1, category.sortOrder - 1) })
                        }
                      >
                        Monter
                      </AdminAction>
                      <AdminAction
                        onClick={() => void patch(category.id, { sortOrder: category.sortOrder + 1 })}
                      >
                        Descendre
                      </AdminAction>
                      <AdminAction
                        tone={category.active ? "danger" : "success"}
                        onClick={() => void patch(category.id, { active: !category.active })}
                      >
                        {category.active ? "Désactiver" : "Activer"}
                      </AdminAction>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
