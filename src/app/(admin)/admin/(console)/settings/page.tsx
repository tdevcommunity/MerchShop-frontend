"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AdminAction } from "@/features/admin/components/admin-action";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { adminRequest, adminList } from "@/features/admin/services/admin-client";
import type {
  AdminInviteResult,
  AdminNotification,
  AdminRole,
  AdminUserPublic,
  AuditLog,
} from "@/types/admin";
import { ADMIN_ROLE_LABELS, ADMIN_ROLES } from "@/types/admin";

const ROLE_OPTIONS = ADMIN_ROLES.map((role) => ({
  value: role,
  label: ADMIN_ROLE_LABELS[role],
}));

export default function AdminSettingsPage() {
  const [users, setUsers] = useState<AdminUserPublic[] | null>(null);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [notes, setNotes] = useState<AdminNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("staff");
  const [saving, setSaving] = useState(false);
  const [inviteResult, setInviteResult] = useState<AdminInviteResult | null>(null);

  useEffect(() => {
    void Promise.all([
      adminList<AdminUserPublic>("/api/admin/users"),
      adminList<AuditLog>("/api/admin/audit"),
      adminList<AdminNotification>("/api/admin/notifications"),
    ])
      .then(([nextUsers, nextAudit, nextNotes]) => {
        setUsers(nextUsers);
        setAudit(nextAudit);
        setNotes(nextNotes);
      })
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  async function loadUsers() {
    setUsers(await adminList<AdminUserPublic>("/api/admin/users"));
  }

  async function markRead() {
    const next = await adminList<AdminNotification>("/api/admin/notifications", {
      method: "PATCH",
    });
    setNotes(next);
  }

  async function invite(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setInviteResult(null);
    try {
      const result = await adminRequest<AdminInviteResult>("/api/admin/users", {
        method: "POST",
        body: {
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
        },
      });
      setInviteResult(result);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("staff");
      await loadUsers();
      setAudit(await adminList<AuditLog>("/api/admin/audit"));
      setNotes(await adminList<AdminNotification>("/api/admin/notifications"));
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Invitation impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function patchUser(
    id: string,
    body: Partial<Pick<AdminUserPublic, "role" | "active">>,
  ) {
    setError(null);
    try {
      const updated = await adminRequest<AdminUserPublic>(`/api/admin/users/${id}`, {
        method: "PATCH",
        body,
      });
      setUsers((current) =>
        (current ?? []).map((user) => (user.id === id ? updated : user)),
      );
      setAudit(await adminList<AuditLog>("/api/admin/audit"));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Mise à jour impossible.");
    }
  }

  async function resetPassword(id: string) {
    setError(null);
    setInviteResult(null);
    try {
      const result = await adminRequest<AdminInviteResult>(
        `/api/admin/users/${id}/reset-password`,
        { method: "POST" },
      );
      setInviteResult(result);
      setAudit(await adminList<AuditLog>("/api/admin/audit"));
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Réinitialisation impossible.",
      );
    }
  }

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Inviter l'équipe, attribuer les rôles, notifications internes et journal d'audit. Pas d'email depuis le frontend : le mot de passe temporaire s'affiche une fois."
      />
      <AdminState loading={!users && !error} error={error} />
      {users ? (
        <div className="grid gap-6">
          <section className="border border-tdev-anthracite bg-tdev-white p-4 sm:p-5">
            <h2 className="font-headline text-base font-extrabold uppercase sm:text-lg">
              Inviter un membre
            </h2>
            <form
              onSubmit={invite}
              className="mt-4 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]"
            >
              <Input
                name="invite-name"
                label="Nom"
                value={inviteName}
                onChange={(event) => setInviteName(event.target.value)}
                required
              />
              <Input
                name="invite-email"
                label="Email"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                required
              />
              <Select
                name="invite-role"
                label="Rôle"
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as AdminRole)}
                options={ROLE_OPTIONS}
              />
              <Button type="submit" variant="brand" className="w-full self-end sm:w-auto" disabled={saving}>
                {saving ? "Invitation…" : "Inviter"}
              </Button>
            </form>
            {inviteResult ? (
              <div
                role="status"
                className="mt-4 border border-tdev-blue bg-[#edf3ff] p-4 text-sm"
              >
                <p className="font-extrabold uppercase tracking-[0.08em] text-tdev-blue">
                  Identifiants à transmettre
                </p>
                <p className="mt-2">
                  {inviteResult.user.name} ({inviteResult.user.email}) ·{" "}
                  {ADMIN_ROLE_LABELS[inviteResult.user.role]}
                </p>
                <p className="mt-2 font-mono text-base tracking-wide text-tdev-anthracite">
                  {inviteResult.temporaryPassword}
                </p>
                <p className="mt-2 text-xs text-tdev-muted">
                  Affiché une seule fois. Transmets-le hors de cette app (chat / SMS / main
                  propre).
                </p>
              </div>
            ) : null}
          </section>

          <section className="border border-tdev-anthracite bg-tdev-white p-5">
            <h2 className="font-headline text-lg font-extrabold uppercase">Utilisateurs</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-tdev-muted">
                  <tr>
                    <th className="py-2">Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Accès</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-tdev-border">
                      <td className="py-2">{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          aria-label={`Rôle de ${user.name}`}
                          className="min-h-9 border border-tdev-anthracite bg-tdev-white px-2 text-sm"
                          value={user.role}
                          onChange={(event) =>
                            void patchUser(user.id, {
                              role: event.target.value as AdminRole,
                            })
                          }
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <StatusBadge value={user.active ? "active" : "inactive"} />
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2 py-2">
                          <AdminAction
                            tone={user.active ? "danger" : "success"}
                            onClick={() =>
                              void patchUser(user.id, { active: !user.active })
                            }
                          >
                            {user.active ? "Désactiver" : "Réactiver"}
                          </AdminAction>
                          {user.active ? (
                            <AdminAction onClick={() => void resetPassword(user.id)}>
                              Nouveau MDP
                            </AdminAction>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-tdev-muted">
              ADMIN : catalogue et paramètres. STAFF : commandes, retraits, stock. Les droits
              sont vérifiés sur chaque API, jamais depuis le navigateur.
            </p>
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-lg font-extrabold uppercase">Notifications</h2>
              <Button size="sm" variant="secondary" onClick={() => void markRead()}>
                Tout marquer lu
              </Button>
            </div>
            <ul className="mt-3 divide-y divide-tdev-border text-sm">
              {notes.length === 0 ? (
                <li className="py-2 text-tdev-muted">Aucune alerte.</li>
              ) : (
                notes.slice(0, 12).map((note) => (
                  <li key={note.id} className="flex justify-between gap-3 py-2">
                    <span>{note.message}</span>
                    <span className="text-xs text-tdev-muted">{note.read ? "lu" : "nouveau"}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-5">
            <h2 className="font-headline text-lg font-extrabold uppercase">Audit</h2>
            {audit.length === 0 ? (
              <p className="mt-3 text-sm text-tdev-muted">Aucune action sensible enregistrée.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-[720px] w-full text-left text-sm">
                  <thead className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-tdev-muted">
                    <tr>
                      <th className="py-2">Date</th>
                      <th>Utilisateur</th>
                      <th>Action</th>
                      <th>Ressource</th>
                      <th>Avant → après</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.slice(0, 30).map((log) => (
                      <tr key={log.id} className="border-t border-tdev-border">
                        <td className="py-2 text-tdev-muted">
                          {log.createdAt.slice(0, 16).replace("T", " ")}
                        </td>
                        <td>{log.userEmail}</td>
                        <td>{log.action}</td>
                        <td>
                          {log.resource} {log.resourceId}
                        </td>
                        <td className="max-w-xs truncate text-xs">
                          {log.oldValue ?? "—"} → {log.newValue ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
