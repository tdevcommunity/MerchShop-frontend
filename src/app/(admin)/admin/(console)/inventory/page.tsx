"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { adminRequest } from "@/features/admin/services/admin-client";
import { INVENTORY_REASONS, type InventoryLog, type InventoryReason } from "@/types/admin";

type InventoryRow = {
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
  reserved: number;
  sold: number;
  threshold: number;
  active: boolean;
  level: string;
};

const REASON_LABEL: Record<InventoryReason, string> = {
  reception: "Réception",
  correction: "Correction",
  damaged: "Produit endommagé",
  loss: "Perte",
  return: "Retour",
  inventory: "Inventaire",
  sale: "Vente",
};

export default function AdminInventoryPage() {
  const [rows, setRows] = useState<InventoryRow[] | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [variantId, setVariantId] = useState("");
  const [delta, setDelta] = useState("10");
  const [reason, setReason] = useState<InventoryReason>("reception");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([
      adminRequest<InventoryRow[]>("/api/admin/inventory"),
      adminRequest<InventoryLog[]>("/api/admin/inventory?history=1"),
    ])
      .then(([inventory, history]) => {
        setRows(inventory);
        setLogs(history);
      })
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  async function load() {
    const [inventory, history] = await Promise.all([
      adminRequest<InventoryRow[]>("/api/admin/inventory"),
      adminRequest<InventoryLog[]>("/api/admin/inventory?history=1"),
    ]);
    setRows(inventory);
    setLogs(history);
  }

  const filtered = useMemo(() => {
    const list = rows ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter((row) =>
      [row.productName, row.sku, row.color ?? "", row.size ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [rows, query]);

  async function adjust(event: FormEvent) {
    event.preventDefault();
    if (!variantId) {
      setError("Sélectionnez une variante.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminRequest(`/api/admin/inventory/${variantId}`, {
        method: "PATCH",
        body: { delta: Number(delta), reason, note },
      });
      setNote("");
      await load();
    } catch (adjustError) {
      setError(adjustError instanceof Error ? adjustError.message : "Ajustement impossible.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Stock"
        description="La quantité affichée ici est la source de vérité. Le Shop ne décide jamais seul."
      />
      <form
        onSubmit={adjust}
        className="mb-6 grid gap-3 border border-tdev-anthracite bg-tdev-white p-4 lg:grid-cols-[2fr_1fr_1fr_2fr_auto]"
      >
        <label className="text-sm font-medium">
          Variante
          <select
            className="mt-1.5 h-11 w-full border border-tdev-anthracite px-2"
            value={variantId}
            onChange={(event) => setVariantId(event.target.value)}
          >
            <option value="">Choisir</option>
            {(rows ?? []).map((row) => (
              <option key={row.variantId} value={row.variantId}>
                {row.productName} · {row.sku} ({row.stock})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Variation
          <input
            type="number"
            className="mt-1.5 h-11 w-full border border-tdev-anthracite px-2"
            value={delta}
            onChange={(event) => setDelta(event.target.value)}
          />
        </label>
        <label className="text-sm font-medium">
          Motif
          <select
            className="mt-1.5 h-11 w-full border border-tdev-anthracite px-2"
            value={reason}
            onChange={(event) => setReason(event.target.value as InventoryReason)}
          >
            {INVENTORY_REASONS.filter((item) => item !== "sale").map((item) => (
              <option key={item} value={item}>
                {REASON_LABEL[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Note
          <input
            className="mt-1.5 h-11 w-full border border-tdev-anthracite px-2"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Réception nouvelle marchandise"
          />
        </label>
        <Button type="submit" variant="brand" className="self-end" disabled={saving}>
          Ajuster
        </Button>
      </form>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Produit, SKU, couleur…"
        className="mb-4 h-11 w-full max-w-md border border-tdev-anthracite px-3 text-sm"
      />
      <AdminState
        loading={!rows && !error}
        error={error}
        empty={Boolean(rows) && filtered.length === 0}
        emptyTitle="Aucun stock"
        emptyHint="Créez des variantes produit pour suivre l'inventaire."
      />
      {rows && filtered.length > 0 ? (
        <div className="overflow-x-auto border border-tdev-anthracite bg-tdev-white">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="bg-tdev-surface text-[11px] font-extrabold uppercase tracking-[0.12em]">
              <tr>
                <th className="p-3">Produit</th>
                <th className="p-3">Variante</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Dispo</th>
                <th className="p-3">Réservé</th>
                <th className="p-3">Vendu</th>
                <th className="p-3">Seuil</th>
                <th className="p-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.variantId} className="border-t border-tdev-border">
                  <td className="p-3 font-medium">{row.productName}</td>
                  <td className="p-3">
                    {[row.size, row.color].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="p-3">{row.sku}</td>
                  <td className="p-3">{row.stock}</td>
                  <td className="p-3">{row.reserved}</td>
                  <td className="p-3">{row.sold}</td>
                  <td className="p-3">{row.threshold}</td>
                  <td className="p-3">
                    <StatusBadge value={row.level} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <section className="mt-8">
        <h2 className="font-headline text-lg font-extrabold uppercase">Historique</h2>
        {logs.length === 0 ? (
          <p className="mt-3 text-sm text-tdev-muted">Aucun mouvement pour l&apos;instant.</p>
        ) : (
          <div className="mt-3 overflow-x-auto border border-tdev-anthracite bg-tdev-white">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="bg-tdev-surface text-[11px] font-extrabold uppercase tracking-[0.12em]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Produit</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Avant</th>
                  <th className="p-3">Variation</th>
                  <th className="p-3">Après</th>
                  <th className="p-3">Motif</th>
                  <th className="p-3">Utilisateur</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 40).map((log) => (
                  <tr key={log.id} className="border-t border-tdev-border">
                    <td className="p-3 text-tdev-muted">{log.createdAt.slice(0, 16).replace("T", " ")}</td>
                    <td className="p-3">{log.productName}</td>
                    <td className="p-3">{log.sku}</td>
                    <td className="p-3">{log.previousStock}</td>
                    <td className="p-3">{log.delta > 0 ? `+${log.delta}` : log.delta}</td>
                    <td className="p-3">{log.nextStock}</td>
                    <td className="p-3">{REASON_LABEL[log.reason]}</td>
                    <td className="p-3">{log.userEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
