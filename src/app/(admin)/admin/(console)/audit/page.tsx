"use client";

import { useEffect, useState } from "react";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { formatAdminDate } from "@/features/admin/labels";
import { adminRequest } from "@/features/admin/services/admin-client";
import type { AuditLog } from "@/types/admin";

type AuditResponse = {
  data: AuditLog[];
  meta: { currentPage: number; lastPage: number; total: number; perPage: number };
};

const PAGE_SIZE = 50;

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [meta, setMeta] = useState<AuditResponse["meta"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    void adminRequest<AuditResponse>(
      `/api/admin/audit?page=${page}&per_page=${PAGE_SIZE}`,
    )
      .then((response) => {
        setLogs(response.data);
        setMeta(response.meta);
      })
      .catch((loadError: Error) => setError(loadError.message));
  }, [page]);

  const lastPage = meta?.lastPage ?? 1;

  return (
    <div>
      <PageHeader
        title="Journal d'audit"
        description="Actions réalisées dans le back-office, ordre antichronologique."
      />

      <AdminState
        loading={!logs && !error}
        error={error}
        empty={Boolean(logs) && logs?.length === 0}
        emptyTitle="Aucune entrée"
        emptyHint="Les actions enregistrées apparaîtront ici."
      />

      {logs && logs.length > 0 ? (
        <>
          <div className="overflow-x-auto border border-tdev-anthracite bg-tdev-white">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-tdev-surface text-[11px] font-extrabold uppercase tracking-[0.12em]">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entité</th>
                  <th className="p-3">Acteur</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.uuid} className="border-t border-tdev-border">
                    <td className="p-3">
                      <StatusBadge value={log.action} />
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{log.resource}</span>
                      <span className="ml-1 text-tdev-muted text-xs">#{log.resourceId}</span>
                    </td>
                    <td className="p-3 text-tdev-muted">
                      {log.userEmail}
                    </td>
                    <td className="p-3 text-tdev-muted">
                      {formatAdminDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-tdev-muted">
              {meta ? `${meta.total} entrée(s) · page ${meta.currentPage}/${lastPage}` : ""}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="border border-tdev-anthracite px-3 py-1 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Précédent
              </button>
              <button
                type="button"
                className="border border-tdev-anthracite px-3 py-1 disabled:opacity-40"
                disabled={page >= lastPage}
                onClick={() => setPage((current) => current + 1)}
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
