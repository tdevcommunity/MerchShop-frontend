import { Spinner } from "@/components/ui/spinner";
import { CheckIcon } from "@/components/ui/icons";
import { PickupQrCard } from "@/features/qr/components/pickup-qr-card";
import {
  customerFullName,
  deliveryLabel,
  PICKUP_STAND_NOTE,
} from "@/features/checkout/utils";
import { formatMoney } from "@/lib/utils/format-money";
import type { Order } from "@/types/order";
import type { PickupQr } from "@/types/qr";

type MerchPassCardProps = {
  order: Order;
  qr: PickupQr | null;
  qrError: string | null;
};

export function MerchPassCard({ order, qr, qrError }: MerchPassCardProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const name = customerFullName(
    order.customer.firstName,
    order.customer.lastName,
  );

  return (
    <article className="overflow-hidden border-2 border-tdev-yellow bg-tdev-white text-tdev-anthracite shadow-[8px_8px_0_#fee800]">
      <div className="flex items-center justify-between bg-tdev-blue p-6 text-tdev-white">
        <div>
          <p className="font-headline text-xl font-black uppercase tracking-[-0.5px]">
            TDEV Festival 2026
          </p>
          <p className="font-headline text-xs font-bold uppercase tracking-[0.5px] text-tdev-yellow">
            Merch Official Pass
          </p>
        </div>
        <span className="flex size-10 items-center justify-center bg-tdev-yellow font-headline text-xl font-extrabold text-tdev-anthracite">
          T
        </span>
      </div>

      <div className="flex items-center justify-between border-b border-tdev-border bg-[#fcfcfc] p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#8a8f91]">
            Commande
          </p>
          <p className="font-headline text-lg font-extrabold">{order.reference}</p>
        </div>
        <span className="bg-tdev-green px-3 py-1 font-headline text-xs font-bold uppercase text-tdev-white">
          Prêt pour retrait
        </span>
      </div>

      <div className="flex flex-col items-center bg-tdev-white p-8">
        <div className="border-2 border-tdev-anthracite bg-tdev-white p-4 shadow-[4px_4px_0_#1b1d1c]">
          {qrError ? (
            <p className="max-w-48 text-center text-sm text-tdev-orange">{qrError}</p>
          ) : qr ? (
            <PickupQrCard qr={qr} compact />
          ) : (
            <Spinner label="Chargement du QR" />
          )}
        </div>
        <p className="mt-4 max-w-[260px] text-center text-xs text-tdev-muted">
          Présente ce pass au Stand Merch officiel avec une pièce d&apos;identité.
        </p>
      </div>

      <div className="flex items-center bg-[#f5f5f3] px-1 py-2">
        <span className="-ml-2 size-5 rounded-full bg-tdev-anthracite" />
        <span className="mx-2 h-0.5 flex-1 border-t-2 border-dashed border-[#c5c5c5]" />
        <span className="-mr-2 size-5 rounded-full bg-tdev-anthracite" />
      </div>

      <dl className="grid grid-cols-2">
        <PassMeta label="Client" value={name || "Invité"} />
        <PassMeta
          label="Articles"
          value={`${itemCount} produit${itemCount > 1 ? "s" : ""}`}
        />
        <PassMeta label="Mode" value={deliveryLabel(order.deliveryMethod)} />
        <PassMeta
          label="Total payé"
          value={formatMoney(order.total)}
          accent
        />
      </dl>

      <p className="flex items-center gap-2 bg-tdev-anthracite p-4 text-xs text-[#e5e5e2]">
        <CheckIcon className="size-4 text-tdev-yellow" />
        {order.pickupLabel
          ? `${order.pickupLabel} • 12-14 juin 2026 (Ouvert 10h-22h)`
          : PICKUP_STAND_NOTE}
      </p>
    </article>
  );
}

function PassMeta({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border-t border-tdev-border p-3.5 even:border-l even:border-tdev-border">
      <dt className="text-[10px] font-bold uppercase leading-[1.6] text-[#8a8f91]">
        {label}
      </dt>
      <dd
        className={
          accent
            ? "font-headline text-sm font-extrabold text-tdev-blue"
            : "font-headline text-sm font-extrabold"
        }
      >
        {value}
      </dd>
    </div>
  );
}
