"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminAction } from "@/features/admin/components/admin-action";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { adminRequest } from "@/features/admin/services/admin-client";
import type { AdminUserPublic } from "@/types/admin";

type UsersResponse = {
  data: AdminUserPublic[];
  meta: { currentPage: number; lastPage: number; total: number; perPage: number };
};

type NewUserForm = {
  name: string;
  email: string;
  role: "admin" | "staff";
};

const INITIAL_FORM: NewUserForm = { name: "", email: "", role: "staff" };

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserPublic[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewUserForm>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void adminRequest<UsersResponse>("/api/admin/users")
      .then((response) => setUsers(response.data))
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  async function resetPassword(id: string) {
    try {
      await adminRequest(`/api/admin/users/${id}/reset-password`, { method: "POST" });
      alert("Mot de passe réinitialisé. Le nouvel accès a été envoyé par email.");
    } catch (resetError) {
      alert(resetError instanceof Error ? resetError.message : "Réinitialisation impossible.");
    }
  }

  async function submitNewUser(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const created = await adminRequest<AdminUserPublic>("/api/admin/users", {
        method: "POST",
        body: form,
      });
      setUsers((current) => (current ? [...current, created] : [created]));
      setShowForm(false);
      setForm(INITIAL_FORM);
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : "Création impossible.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description="Comptes administrateurs du back-office."
        actions={
          <AdminAction tone="brand" onClick={() => setShowForm((open) => !open)}>
            {showForm ? "Annuler" : "Nouvel utilisateur"}
          </AdminAction>
        }
      />

      {showForm ? (
        <form
          onSubmit={(event) => void submitNewUser(event)}
          className="mb-6 border border-tdev-anthracite bg-tdev-white p-4"
        >
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em]">
            Nouvel utilisateur
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              required
              placeholder="Nom complet"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="h-11 border border-tdev-anthracite px-3 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="h-11 border border-tdev-anthracite px-3 text-sm"
            />
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as "admin" | "staff" }))
              }
              className="h-11 border border-tdev-anthracite px-2 text-sm"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {formError ? <p className="mt-2 text-sm text-red-600">{formError}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 border border-tdev-anthracite px-4 py-2 text-sm font-bold uppercase disabled:opacity-50"
          >
            {submitting ? "Création…" : "Créer"}
          </button>
        </form>
      ) : null}

      <AdminState
        loading={!users && !error}
        error={error}
        empty={Boolean(users) && users?.length === 0}
        emptyTitle="Aucun utilisateur"
        emptyHint="Créez un premier compte avec le bouton ci-dessus."
      />

      {users && users.length > 0 ? (
        <div className="overflow-x-auto border border-tdev-anthracite bg-tdev-white">
          <table className="min-w-[700px] w-full text-left text-sm">
            <thead className="bg-tdev-surface text-[11px] font-extrabold uppercase tracking-[0.12em]">
              <tr>
                <th className="p-3">Nom complet</th>
                <th className="p-3">Email</th>
                <th className="p-3">Rôle</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-tdev-border">
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-tdev-muted">{user.email}</td>
                  <td className="p-3">
                    <StatusBadge value={user.role} />
                  </td>
                  <td className="p-3">
                    <StatusBadge value={user.active ? "active" : "inactive"} />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <AdminAction
                        tone="brand"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        Détail
                      </AdminAction>
                      <AdminAction
                        tone="default"
                        onClick={() => void resetPassword(user.id)}
                      >
                        Réinitialiser mot de passe
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
