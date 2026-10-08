"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/features/admin/components/page-header";
import { formatAdminDate } from "@/features/admin/labels";
import { adminRequest } from "@/features/admin/services/admin-client";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/format-money";
import type { DashboardSnapshot } from "@/types/admin";

type Preset = "today" | "7d" | "30d" | "custom";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Jour calendaire local (évite le décalage UTC de toISOString). */
function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function todayKey() {
  return formatLocalDate(new Date());
}

function shiftDays(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

function rangeForPreset(preset: Exclude<Preset, "custom">) {
  const to = todayKey();
  if (preset === "today") {
    return { from: to, to };
  }
  if (preset === "7d") {
    return { from: shiftDays(-6), to };
  }
  return { from: shiftDays(-29), to };
}

export default function AdminDashboardPage() {
  const [preset, setPreset] = useState<Preset>("7d");
  const [from, setFrom] = useState(() => rangeForPreset("7d").from);
  const [to, setTo] = useState(() => rangeForPreset("7d").to);
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Les dates par defaut dependent du fuseau : le serveur (UTC) et le
  // navigateur peuvent tomber sur deux jours differents (erreur React #418).
  // On ne les affiche donc qu'une fois la page montee cote navigateur.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const query = useMemo(() => {
    const params = new URLSearchParams({ from, to });
    return params.toString();
  }, [from, to]);

  const [prevQuery, setPrevQuery] = useState(query);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setLoading(true);
    setError(null);
    setData(null);
  }

  useEffect(() => {
    const controller = new AbortController();

    void adminRequest<DashboardSnapshot>(`/api/admin/dashboard?${query}`, {
      signal: controller.signal,
    })
      .then((snapshot) => {
        if (!controller.signal.aborted) {
          setData(snapshot);
        }
      })
      .catch((loadError: Error) => {
        if (controller.signal.aborted || loadError.name === "AbortError") {
          return;
        }
        setError(loadError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

  function applyPreset(next: Exclude<Preset, "custom">) {
    const range = rangeForPreset(next);
    setPreset(next);
    setFrom(range.from);
    setTo(range.to);
  }

  const kpis = data
    ? [
        { label: "Chiffre d'affaires", value: formatMoney(data.revenue), period: true },
        { label: "Commandes", value: String(data.orders), period: true },
        { label: "Payées", value: String(data.paidOrders), period: true },
        { label: "En attente", value: String(data.pendingOrders), period: true },
        { label: "À retirer", value: String(data.readyForPickup), period: true },
        { label: "Retirées", value: String(data.pickedUp), period: true },
        { label: "Produits actifs", value: String(data.activeProducts), period: false },
        { label: "Stock faible", value: String(data.lowStockProducts), period: false },
      ]
    : [];
  const maxSale = Math.max(...(data?.salesByDay?.map((day) => day.amount) ?? [0]), 1);
  const chartDense = (data?.salesByDay?.length ?? 0) > 14;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="CA, commandes et retraits suivent la période. Produits actifs / stock restent l'état actuel."
      />

      <div className="mb-6 flex flex-col gap-3 border border-tdev-anthracite bg-tdev-white p-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["today", "Aujourd'hui"],
              ["7d", "7 jours"],
              ["30d", "30 jours"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className={cn(
                "min-h-9 border px-3 text-[11px] font-extrabold uppercase tracking-[0.08em]",
                preset === key
                  ? "border-tdev-blue bg-tdev-blue text-tdev-white"
                  : "border-tdev-anthracite bg-tdev-white text-tdev-anthracite hover:bg-tdev-surface",
              )}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPreset("custom")}
            className={cn(
              "min-h-9 border px-3 text-[11px] font-extrabold uppercase tracking-[0.08em]",
              preset === "custom"
                ? "border-tdev-blue bg-tdev-blue text-tdev-white"
                : "border-tdev-anthracite bg-tdev-white text-tdev-anthracite hover:bg-tdev-surface",
            )}
          >
            Personnalisé
          </button>
        </div>
        {preset === "custom" ? (
          <div className="grid max-w-xl gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="text-sm font-medium">
              Du
              <input
                type="date"
                className="mt-1.5 h-11 w-full border border-tdev-anthracite px-2 font-normal"
                value={from}
                max={to}
                onChange={(event) => {
                  setPreset("custom");
                  setFrom(event.target.value);
                }}
              />
            </label>
            <label className="text-sm font-medium">
              Au
              <input
                type="date"
                className="mt-1.5 h-11 w-full border border-tdev-anthracite px-2 font-normal"
                value={to}
                min={from}
                max={todayKey()}
                onChange={(event) => {
                  setPreset("custom");
                  setTo(event.target.value);
                }}
              />
            </label>
            <Button
              type="button"
              variant="secondary"
              className="w-full self-end sm:w-auto"
              onClick={() => applyPreset("7d")}
            >
              Réinitialiser
            </Button>
          </div>
        ) : null}
        <p className="text-xs text-tdev-muted">
          Période active : {mounted ? `${from} → ${to}` : "…"}
          {loading ? " · actualisation…" : ""}
        </p>
      </div>

      {error ? <p className="mb-4 text-tdev-orange">{error}</p> : null}
      {loading && !data ? (
        <p className="text-sm text-tdev-muted">Chargement du tableau de bord…</p>
      ) : null}

      {data ? (
        <>
          <div
            className={cn(
              "grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4",
              loading && "opacity-60",
            )}
          >
            {kpis.map((kpi) => (
              <article key={kpi.label} className="border border-tdev-anthracite bg-tdev-white p-3 sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tdev-muted sm:text-[11px] sm:tracking-[0.16em]">
                  {kpi.label}
                </p>
                <p className="mt-2 font-headline text-lg font-extrabold sm:text-2xl">{kpi.value}</p>
                <p className="mt-1 text-[10px] text-tdev-muted">
                  {kpi.period ? "Sur la période" : "État actuel"}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="border border-tdev-anthracite bg-tdev-white p-5">
              <h2 className="font-headline text-lg font-extrabold uppercase">
                Ventes sur la période
              </h2>
              <div className="mt-4 flex h-40 items-end gap-1 overflow-x-auto">
                {(data.salesByDay ?? []).map((day) => (
                  <div
                    key={day.date}
                    className={cn(
                      "flex flex-col items-center gap-1",
                      chartDense ? "min-w-4 flex-none" : "flex-1",
                    )}
                    title={`${day.date} · ${formatMoney(day.amount)} · ${day.count} cmd`}
                  >
                    <div
                      className="w-full min-w-2 bg-tdev-blue"
                      style={{ height: `${Math.max(8, (day.amount / maxSale) * 100)}%` }}
                    />
                    {!chartDense ? (
                      <span className="text-[10px] text-tdev-muted">{formatAdminDate(day.date).slice(5)}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
            <section className="border border-tdev-anthracite bg-tdev-white p-5">
              <h2 className="font-headline text-lg font-extrabold uppercase">Top produits</h2>
              {(data.topProducts ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-tdev-muted">Aucune vente sur cette période.</p>
              ) : (
                <ul className="mt-4 divide-y divide-tdev-border">
                  {(data.topProducts ?? []).map((product) => (
                    <li key={product.name} className="flex justify-between py-2 text-sm">
                      <span>{product.name}</span>
                      <span className="font-bold">
                        {product.quantity} · {formatMoney(product.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <section className="mt-6 border border-tdev-anthracite bg-tdev-white p-5">
            <h2 className="font-headline text-lg font-extrabold uppercase">Alertes stock</h2>
            <p className="mt-1 text-xs text-tdev-muted">État actuel, indépendant de la période.</p>
            {(data.lowStock ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-tdev-muted">Aucun produit proche de la rupture.</p>
            ) : (
              <ul className="mt-4 divide-y divide-tdev-border text-sm">
                {(data.lowStock ?? []).map((row) => (
                  <li key={row.sku} className="flex justify-between py-2">
                    <span>
                      {row.productName} · {row.sku}
                    </span>
                    <span className="font-bold text-tdev-orange">
                      {row.stock} / seuil {row.threshold}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
