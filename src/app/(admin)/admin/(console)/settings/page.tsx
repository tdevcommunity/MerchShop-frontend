"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { adminRequest } from "@/features/admin/services/admin-client";
import type { AdminNotification, AuditLog } from "@/types/admin";

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff";
  active: boolean;
};

export default function AdminSettingsPage() {
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [notes, setNotes] = useState<AdminNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      adminRequest<AdminUserRow[]>("/api/admin/users"),
      adminRequest<AuditLog[]>("/api/admin/audit"),
      adminRequest<AdminNotification[]>("/api/admin/notifications"),
    ])
      .then(([nextUsers, nextAudit, nextNotes]) => {
        setUsers(nextUsers);
        setAudit(nextAudit);
        setNotes(nextNotes);
      })
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  async function markRead() {
    const next = await adminRequest<AdminNotification[]>("/api/admin/notifications", {
      method: "PATCH",
    });
    setNotes(next);
  }

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Comptes admin, notifications internes et journal d'audit. Pas d'email depuis le frontend."
      />
      <AdminState loading={!users && !error} error={error} />
      {users ? (
        <div className="grid gap-6">
          <section className="border border-tdev-anthracite bg-tdev-white p-5">
            <h2 className="font-headline text-lg font-extrabold uppercase">Utilisateurs</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[520px] w-full text-left text-sm">
                <thead className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-tdev-muted">
                  <tr>
                    <th className="py-2">Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Accès</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-tdev-border">
                      <td className="py-2">{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <StatusBadge value={user.role} />
                      </td>
                      <td>{user.active ? "Actif" : "Inactif"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-tdev-muted">
              ADMIN : catalogue et paramètres. STAFF : commandes, retraits, stock. Les droits sont
              vérifiés sur chaque API, jamais depuis le navigateur.
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
