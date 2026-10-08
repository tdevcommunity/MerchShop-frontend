"use client";

import { useEffect, useState } from "react";
import { AdminState } from "@/features/admin/components/admin-state";
import { formatAdminDate } from "@/features/admin/labels";
import { PageHeader } from "@/features/admin/components/page-header";
import { adminRequest } from "@/features/admin/services/admin-client";
import type { AdminNotification } from "@/types/admin";

type NotificationsResponse = {
  data: AdminNotification[];
  meta: { currentPage: number; lastPage: number; total: number; perPage: number };
};

const TONE_ICON: Record<AdminNotification["tone"], string> = {
  warning: "⚠️",
  info: "ℹ️",
  success: "✅",
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void adminRequest<NotificationsResponse>("/api/admin/notifications")
      .then((response) => setNotifications(response.data))
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  return (
    <div>
      <PageHeader
        title="Alertes"
        description="Notifications système du back-office, lecture seule."
      />

      <AdminState
        loading={!notifications && !error}
        error={error}
        empty={Boolean(notifications) && notifications?.length === 0}
        emptyTitle="Aucune alerte"
        emptyHint="Les alertes du système apparaîtront ici."
      />

      {notifications && notifications.length > 0 ? (
        <div className="flex flex-col gap-2">
          {notifications.map((note) => (
            <div
              key={note.id}
              className="flex items-start gap-3 border border-tdev-anthracite bg-tdev-white px-4 py-3"
            >
              <span className="shrink-0 text-lg leading-none" aria-hidden>
                {TONE_ICON[note.tone]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{note.message}</p>
                <p className="mt-1 text-xs text-tdev-muted">{formatAdminDate(note.createdAt)}</p>
              </div>
              {!note.read ? (
                <span className="inline-block size-2 shrink-0 rounded-full bg-tdev-orange" />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
