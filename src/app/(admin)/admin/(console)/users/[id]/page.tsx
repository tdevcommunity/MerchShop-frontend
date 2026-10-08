"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminAction } from "@/features/admin/components/admin-action";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { adminRequest } from "@/features/admin/services/admin-client";
import type { AdminInviteResult, AdminUserCreated, AdminUserPublic } from "@/types/admin";
import { AccessCredentials } from "@/features/admin/components/access-credentials";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AdminUserPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  /*
   * Le mot de passe a transmettre une fois, exactement comme après une
   * invitation : la reponse est le seul endroit ou il existe en clair, et
   * une boîte `alert()` ne dit ni pour qui il est ni qu'il ne reviendra pas.
   */
  const [access, setAccess] = useState<AdminInviteResult | null>(null);

  useEffect(() => {
    void adminRequest<AdminUserPublic>(`/api/admin/users/${id}`)
      .then((loaded) => {
        setUser(loaded);
        setName(loaded.fullName);
        setEmail(loaded.email);
        setRole(loaded.role);
        setActive(loaded.status === 1);
      })
      .catch((loadError: Error) => setError(loadError.message));
  }, [id]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    setSaving(true);
    try {
      const updated = await adminRequest<AdminUserPublic>(`/api/admin/users/${id}`, {
        method: "PATCH",
        /*
         * Le nom part en un champ : l'API le coupe elle-meme, et `status`
         * part en entier, la nomenclature qu'elle attend. L'adresse email,
         * affichee en lecture seule, ne part pas — un patch n'envoie que ce
         * qu'il change.
         */
        body: { name, role, status: active ? 1 : 0 },
      });
      setUser(updated);
      setSaveSuccess(true);
    } catch (patchError) {
      setSaveError(
        patchError instanceof Error ? patchError.message : "Mise à jour impossible.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword() {
    try {
      const reset = await adminRequest<AdminUserCreated>(
        `/api/admin/users/${id}/reset-password`,
        { method: "POST" },
      );
      setAccess({
        user: reset.data,
        temporaryPassword: reset.temporaryPassword,
      });
    } catch (resetError) {
      alert(resetError instanceof Error ? resetError.message : "Réinitialisation impossible.");
    }
  }

  return (
    <div>
      <PageHeader
        title={user?.fullName ?? "Utilisateur"}
        description="Modifier les informations du compte."
        actions={
          <AdminAction tone="default" onClick={() => router.back()}>
            Retour
          </AdminAction>
        }
      />

      <AdminState loading={!user && !error} error={error} />

      {access ? (
        <AccessCredentials access={access} className="mb-6 max-w-lg" />
      ) : null}

      {user ? (
        <form
          onSubmit={(event) => void save(event)}
          className="max-w-lg border border-tdev-anthracite bg-tdev-white p-6"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="user-name"
                className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.08em]"
              >
                Nom complet
              </label>
              <input
                id="user-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full border border-tdev-anthracite px-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="user-email"
                className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.08em]"
              >
                Email
              </label>
              <input
                id="user-email"
                type="email"
                readOnly
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full border border-tdev-anthracite bg-tdev-surface px-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="user-role"
                className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.08em]"
              >
                Rôle
              </label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "staff")}
                className="h-11 w-full border border-tdev-anthracite px-2 text-sm"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="user-active"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4"
              />
              <label
                htmlFor="user-active"
                className="text-[11px] font-extrabold uppercase tracking-[0.08em]"
              >
                Compte actif
              </label>
            </div>

            {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
            {saveSuccess ? (
              <p className="text-sm text-tdev-green">Modifications enregistrées.</p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <AdminAction tone="brand" type="submit" disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </AdminAction>
              <AdminAction
                tone="danger"
                type="button"
                onClick={() => void resetPassword()}
              >
                Réinitialiser le mot de passe
              </AdminAction>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
