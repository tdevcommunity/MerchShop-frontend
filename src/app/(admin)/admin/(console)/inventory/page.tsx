"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { formatAdminDate } from "@/features/admin/labels";
import { adminRequest, adminList } from "@/features/admin/services/admin-client";
import { cn } from "@/lib/utils/cn";
import {
  INVENTORY_REASONS,
  type InventoryLog,
  type InventoryReason,
  type InventoryVariant,
} from "@/types/admin";

const REASON_LABEL: Record<InventoryReason, string> = {
  reception: "Réception",
  correction: "Correction",
  damaged: "Produit endommagé",
  loss: "Perte",
  return: "Retour",
  inventory: "Inventaire",
  sale: "Vente",
};

/*
 * Le libelle d'une declinaison vient de la ressource : `name` est le texte
 * affiche au client et au guichet (« Taille M - Noir »), et `sku` l'identifie au
 * comptoir. Les deux suffisent, et rien n'est recompose ici a partir de `size`
 * et `color` — ces champs servent a agreger, pas a nommer.
 */
function variantLabel(row: InventoryVariant) {
  return `${row.name} · ${row.sku}`;
}

async function fetchStock() {
  return adminList<InventoryVariant>("/api/admin/inventory");
}

async function fetchHistory() {
  return adminList<InventoryLog>("/api/admin/inventory/adjustments");
}

export default function AdminInventoryPage() {
  const [rows, setRows] = useState<InventoryVariant[] | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [variantUuid, setVariantUuid] = useState("");
  const [variantSearch, setVariantSearch] = useState("");
  const [variantOpen, setVariantOpen] = useState(false);
  const [delta, setDelta] = useState("10");
  const [reason, setReason] = useState<InventoryReason>("reception");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const variantBoxRef = useRef<HTMLDivElement>(null);

  /*
   * Les deux lectures sont independantes, et le restent.
   *
   * Le journal demande la permission `audit`, reservee a l'administrateur, alors
   * que la liste du stock est ouverte au guichetier. Les charger d'un seul bloc
   * ferait echouer la page entiere pour un role qui a justement le droit de voir
   * le stock : il verrait un refus la ou il n'a besoin que du comptoir.
   */
  useEffect(() => {
    void fetchStock()
      .then(setRows)
      .catch((loadError: Error) => setError(loadError.message));
    void fetchHistory()
      .then(setLogs)
      .catch((loadError: Error) => setHistoryError(loadError.message));
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!variantBoxRef.current?.contains(event.target as Node)) {
        setVariantOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  async function load() {
    const inventory = await fetchStock();
    setRows(inventory);
    try {
      setLogs(await fetchHistory());
      setHistoryError(null);
    } catch (loadError) {
      setHistoryError(loadError instanceof Error ? loadError.message : "Historique indisponible.");
    }
    return inventory;
  }

  const selectedVariant = useMemo(
    () => (rows ?? []).find((row) => row.uuid === variantUuid) ?? null,
    [rows, variantUuid],
  );

  const variantMatches = useMemo(() => {
    const list = rows ?? [];
    const q = variantSearch.trim().toLowerCase();
    if (!q) {
      return list.slice(0, 12);
    }
    return list
      .filter((row) =>
        [row.name, row.sku, row.color ?? "", row.size ?? "", row.uuid]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 12);
  }, [rows, variantSearch]);

  const filtered = useMemo(() => {
    const list = rows ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter((row) =>
      [row.name, row.sku, row.color ?? "", row.size ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [rows, query]);

  function selectVariant(row: InventoryVariant) {
    setVariantUuid(row.uuid);
    setVariantSearch(variantLabel(row));
    setVariantOpen(false);
  }

  function clearVariant() {
    setVariantUuid("");
    setVariantSearch("");
    setVariantOpen(true);
  }

  async function adjust(event: FormEvent) {
    event.preventDefault();
    if (!variantUuid) {
      setError("Sélectionnez une variante.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminRequest(`/api/admin/inventory/${variantUuid}/adjust`, {
        method: "POST",
        body: { delta: Number(delta), reason, note },
      });
      setNote("");
      const inventory = await load();
      const refreshed = inventory.find((row) => row.uuid === variantUuid);
      if (refreshed) {
        setVariantSearch(variantLabel(refreshed));
      }
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
        <div ref={variantBoxRef} className="relative text-sm font-medium">
          <label htmlFor="variant-search">Variante</label>
          <div className="relative mt-1.5">
            <input
              id="variant-search"
              role="combobox"
              aria-expanded={variantOpen}
              aria-controls="variant-search-list"
              aria-autocomplete="list"
              autoComplete="off"
              className="h-11 w-full border border-tdev-anthracite px-2 pr-16 font-normal"
              placeholder="Rechercher produit, SKU, taille, couleur…"
              value={variantSearch}
              onChange={(event) => {
                setVariantSearch(event.target.value);
                setVariantUuid("");
                setVariantOpen(true);
              }}
              onFocus={() => setVariantOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setVariantOpen(false);
                }
                if (event.key === "Enter" && variantOpen && variantMatches[0]) {
                  event.preventDefault();
                  selectVariant(variantMatches[0]);
                }
              }}
            />
            {variantUuid || variantSearch ? (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-extrabold uppercase text-tdev-muted hover:text-tdev-anthracite"
                onClick={clearVariant}
              >
                Effacer
              </button>
            ) : null}
          </div>
          {variantOpen ? (
            <ul
              id="variant-search-list"
              role="listbox"
              className="absolute z-20 mt-1 max-h-64 w-full overflow-auto border border-tdev-anthracite bg-tdev-white shadow-[4px_4px_0_#1a1a1a]"
            >
              {variantMatches.length === 0 ? (
                <li className="px-3 py-2 text-sm font-normal text-tdev-muted">
                  Aucune variante trouvée.
                </li>
              ) : (
                variantMatches.map((row) => {
                  const selected = row.uuid === variantUuid;
                  return (
                    <li key={row.uuid} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left font-normal transition-colors",
                          selected ? "bg-tdev-surface" : "hover:bg-tdev-surface",
                        )}
                        onClick={() => selectVariant(row)}
                      >
                        <span className="text-sm font-medium text-tdev-anthracite">
                          {row.name}
                        </span>
                        <span className="text-xs text-tdev-muted">
                          {[row.size, row.color].filter(Boolean).join(" / ") || "Sans option"}
                          {" · "}
                          {row.sku}
                          {" · stock "}
                          {row.stock}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          ) : null}
          {selectedVariant ? (
            <p className="mt-1 text-xs font-normal text-tdev-muted">
              Sélectionnée · stock actuel {selectedVariant.stock}
            </p>
          ) : (
            <p className="mt-1 text-xs font-normal text-tdev-muted">
              Tape pour filtrer, puis choisis dans la liste.
            </p>
          )}
        </div>
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
        <Button type="submit" variant="brand" className="w-full self-end lg:w-auto" disabled={saving}>
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
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-tdev-surface text-[11px] font-extrabold uppercase tracking-[0.12em]">
              <tr>
                <th className="p-3">Variante</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Dispo</th>
                <th className="p-3">Seuil</th>
                <th className="p-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.uuid} className="border-t border-tdev-border">
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3">{row.sku}</td>
                  <td className="p-3">{row.stock}</td>
                  <td className="p-3">{row.lowStockThreshold}</td>
                  <td className="p-3">
                    <StatusBadge value={row.stockLevel} label={row.stockLevelLabel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <section className="mt-8">
        <h2 className="font-headline text-lg font-extrabold uppercase">Historique</h2>
        {historyError ? (
          <p className="mt-3 text-sm text-tdev-muted">{historyError}</p>
        ) : logs.length === 0 ? (
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
                  <tr key={log.uuid} className="border-t border-tdev-border">
                    <td className="p-3 text-tdev-muted">{formatAdminDate(log.createdAt, 16).replace("T", " ")}</td>
                    <td className="p-3">{log.productName}</td>
                    <td className="p-3">{log.sku}</td>
                    <td className="p-3">{log.previousStock}</td>
                    <td className="p-3">{log.delta > 0 ? `+${log.delta}` : log.delta}</td>
                    <td className="p-3">{log.nextStock}</td>
                    <td className="p-3">{log.reasonLabel || REASON_LABEL[log.reason]}</td>
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
