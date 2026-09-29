"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { CheckIcon, MapPinIcon, TruckIcon } from "@/components/ui/icons";
import { CheckoutFooterBar } from "@/features/checkout/components/checkout-footer-bar";
import { CheckoutOrderSummary } from "@/features/checkout/components/checkout-order-summary";
import { CheckoutShell } from "@/features/checkout/components/checkout-shell";
import { DeliveryAddressFields } from "@/features/checkout/components/delivery-address-fields";
import { CheckoutStepIntro } from "@/features/checkout/components/checkout-step-intro";
import { EmptyCheckout } from "@/features/checkout/components/empty-checkout";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  useCheckoutDraft,
  useCheckoutDraftActions,
} from "@/features/checkout/hooks/use-checkout-draft";
import { validateFulfillment } from "@/lib/validation/checkout";
import { cn } from "@/lib/utils/cn";
import { DELIVERY_METHODS, type DeliveryMethod, type ShippingAddress } from "@/types/delivery";

const defaultAddress: ShippingAddress = {
  line1: "",
  city: "",
  country: "Togo",
  source: "maps",
};

export function FulfillmentForm() {
  const cart = useCart();
  const draft = useCheckoutDraft();
  const { update } = useCheckoutDraftActions();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (cart.items.length === 0) {
    return <EmptyCheckout />;
  }

  function select(method: DeliveryMethod) {
    if (method === DELIVERY_METHODS.DELIVERY) {
      update({
        deliveryMethod: method,
        shippingAddress: draft.shippingAddress ?? defaultAddress,
      });
    } else {
      update({ deliveryMethod: method });
    }
    setErrors({});
    track(analyticsEvents.deliveryMethodSelected, { method });
  }

  function continueNext() {
    const nextErrors = validateFulfillment(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    router.push("/checkout/information");
  }

  const pickupSelected = draft.deliveryMethod === DELIVERY_METHODS.PICKUP_EVENT;
  const deliverySelected = draft.deliveryMethod === DELIVERY_METHODS.DELIVERY;
  const address = draft.shippingAddress ?? defaultAddress;
  const receptionNote = pickupSelected
    ? "Retrait jour J · Gratuit"
    : deliverySelected
      ? "Livraison à l’adresse indiquée"
      : undefined;

  return (
    <CheckoutShell
      title="Commande"
      stepIndex={1}
      current="fulfillment"
      backHref="/cart"
      summary={<CheckoutOrderSummary cart={cart} receptionNote={receptionNote} />}
      footer={
        <CheckoutFooterBar
          total={cart.subtotal}
          actionLabel="Continuer"
          onClick={continueNext}
        />
      }
    >
      <div className="flex flex-1 flex-col gap-5 lg:gap-8">
        <CheckoutStepIntro eyebrow="Étape 1 — Réception" title="Comment tu reçois ?">
          Retrait au Village TDEV le jour J, ou livraison à l’adresse que tu
          indiques.
        </CheckoutStepIntro>

        <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
          <MethodCard
            selected={pickupSelected}
            onSelect={() => select(DELIVERY_METHODS.PICKUP_EVENT)}
            icon={
              <span className="flex size-[42px] items-center justify-center bg-tdev-blue text-tdev-yellow lg:size-14">
                <MapPinIcon className="size-5 lg:size-6" />
              </span>
            }
            title="Retrait jour J"
            badge={<span className="text-xs font-bold text-tdev-green">Gratuit</span>}
            description="Récupère ta commande au stand Merch du Village TDEV, avec ton QR Code."
          >
            {pickupSelected ? (
              <span className="bg-tdev-surface px-3 py-2.5 lg:hidden">
                <span className="block font-bold text-tdev-anthracite">
                  Stand Merch — Village TDEV
                </span>
                <span className="text-xs font-medium text-tdev-muted">
                  Présente ton QR Code + une pièce d&apos;identité.
                </span>
              </span>
            ) : null}
          </MethodCard>

          <MethodCard
            selected={deliverySelected}
            onSelect={() => select(DELIVERY_METHODS.DELIVERY)}
            icon={
              <span className="flex size-[42px] items-center justify-center bg-tdev-anthracite text-tdev-white lg:size-14">
                <TruckIcon className="size-5 lg:size-6" />
              </span>
            }
            title="Livraison"
            badge={
              <span className="text-xs font-semibold text-tdev-muted">
                Selon zones confirmées
              </span>
            }
            description="On te livre à l’adresse que tu indiques. Pays, ville, quartier et localisation."
          />
        </div>

        {pickupSelected ? (
          <section className="hidden flex-1 border border-tdev-anthracite bg-tdev-white lg:grid lg:grid-cols-2 lg:gap-0">
            <div className="flex flex-col justify-between gap-8 p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-tdev-muted">
                  Lieu de retrait
                </p>
                <h3 className="mt-3 font-headline text-3xl font-extrabold uppercase leading-tight">
                  Stand Merch
                  <br />
                  Village TDEV
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-tdev-subtle">
                  Pas de file d’attente en ligne. Tu présentes ton pass QR le jour J,
                  on te remet le merch sur place.
                </p>
              </div>
              <p className="text-sm font-bold text-tdev-green">Aucun frais de retrait</p>
            </div>
            <dl className="grid grid-rows-3 border-l border-tdev-border">
              <Fact label="Quand" value="Jour du festival" />
              <Fact label="À présenter" value="QR merch + pièce d’identité" />
              <Fact label="Délai" value="Remise immédiate au stand" last />
            </dl>
          </section>
        ) : null}

        {deliverySelected ? (
          <section className="flex-1 border border-tdev-anthracite bg-tdev-white p-4 lg:p-8">
            <DeliveryAddressFields
              address={address}
              errors={errors}
              onChange={(shippingAddress) => update({ shippingAddress })}
            />
          </section>
        ) : null}

        {!pickupSelected && !deliverySelected ? (
          <p className="hidden border border-dashed border-tdev-border bg-tdev-white px-8 py-16 text-center text-sm text-tdev-muted lg:block">
            Sélectionne un mode de réception pour afficher les détails.
          </p>
        ) : null}

        {errors.deliveryMethod ? (
          <Alert title="Mode de réception" tone="error">
            {errors.deliveryMethod}
          </Alert>
        ) : null}
      </div>
    </CheckoutShell>
  );
}

function MethodCard({
  selected,
  onSelect,
  icon,
  title,
  badge,
  description,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  badge: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-col border-2 bg-tdev-white text-left transition-colors",
        "lg:min-h-[220px] lg:hover:border-tdev-blue",
        selected ? "border-tdev-blue" : "border-tdev-anthracite",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-3 px-[18px] py-4 lg:px-6 lg:py-5",
          selected ? "bg-[#eef4ff]" : "",
        )}
      >
        {icon}
        <span className="flex-1">
          <span className="block font-headline text-[17px] font-extrabold uppercase lg:text-xl">
            {title}
          </span>
          {badge}
        </span>
        <span
          className={cn(
            "flex size-6 items-center justify-center lg:size-7",
            selected ? "bg-tdev-blue text-tdev-white" : "border-2 border-[#c5c5c5]",
          )}
        >
          {selected ? <CheckIcon className="size-[15px]" /> : null}
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-3 px-[18px] py-4 text-[13px] leading-relaxed text-tdev-subtle lg:px-6 lg:pb-6 lg:pt-0 lg:text-sm">
        <span className={cn(selected ? "block" : "hidden lg:block")}>
          {description}
        </span>
        {children}
      </span>
    </button>
  );
}

function Fact({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center gap-1 px-8 py-6",
        last ? "" : "border-b border-tdev-border",
      )}
    >
      <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-tdev-muted">
        {label}
      </dt>
      <dd className="font-headline text-lg font-extrabold">{value}</dd>
    </div>
  );
}
