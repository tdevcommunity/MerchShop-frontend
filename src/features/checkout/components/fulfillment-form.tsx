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
    ? "Retrait sur place"
    : deliverySelected
      ? "Livraison locale"
      : undefined;

  return (
    <CheckoutShell
      title="Commande"
      stepIndex={1}
      current="fulfillment"
      backHref="/cart"
      summary={
        <CheckoutOrderSummary
          cart={cart}
          receptionNote={receptionNote}
          receptionFree={pickupSelected}
          action={
            <CheckoutFooterBar
              total={cart.subtotal}
              actionLabel="Continuer"
              onClick={continueNext}
              variant="sidebar"
            />
          }
        />
      }
      footer={
        <CheckoutFooterBar
          total={cart.subtotal}
          actionLabel="Continuer"
          onClick={continueNext}
        />
      }
    >
      <div className="flex flex-1 flex-col gap-5 lg:gap-10">
        <CheckoutStepIntro
          eyebrow="Étape 1 — Réception"
          index="01"
          title="Comment tu reçois ?"
        >
          Choisis comment tu souhaites recevoir les articles officiels du TDEV
          Festival.
        </CheckoutStepIntro>

        <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          <MethodCard
            selected={pickupSelected}
            onSelect={() => select(DELIVERY_METHODS.PICKUP_EVENT)}
            icon={
              <span className="flex size-[42px] items-center justify-center bg-tdev-blue text-tdev-yellow lg:size-10">
                <MapPinIcon className="size-5" />
              </span>
            }
            title="Retrait jour J"
            badge={
              <span className="bg-tdev-green px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.275px] text-tdev-white">
                Gratuit
              </span>
            }
            description="Récupère ta commande directement sur le site du festival avec ton QR Code instantané."
            footer={
              pickupSelected
                ? "Stand Merch - Village TDEV • 12-14 juin 2026"
                : undefined
            }
          >
            {pickupSelected ? (
              <span className="bg-tdev-surface px-3 py-2.5 lg:hidden">
                <span className="block font-bold text-tdev-anthracite">
                  Stand Merch - Village TDEV
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
              <span className="flex size-[42px] items-center justify-center bg-tdev-anthracite text-tdev-white lg:size-10">
                <TruckIcon className="size-5" />
              </span>
            }
            title="Livraison locale"
            badge={
              <span className="bg-[#f0f0ee] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.275px]">
                Dès 2 000 FCFA
              </span>
            }
            description="Livraison directe à Lomé ou en région sous 3 à 5 jours ouvrés à l'adresse de ton choix."
            footer="Expédition avec suivi SMS et WhatsApp"
          />
        </div>

        {deliverySelected ? (
          <section className="motion-panel flex-1 border border-tdev-anthracite bg-tdev-white p-4 lg:p-8">
            <DeliveryAddressFields
              address={address}
              errors={errors}
              onChange={(shippingAddress) => update({ shippingAddress })}
            />
          </section>
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
  footer,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  badge: ReactNode;
  description: string;
  footer?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col border-2 bg-tdev-white text-left transition-colors duration-150",
        "lg:min-h-[248px] lg:justify-between lg:p-5 lg:hover:border-tdev-blue",
        selected
          ? "border-tdev-blue lg:bg-[#f8faff] lg:shadow-[3px_3px_0_#155dfc]"
          : "border-tdev-anthracite lg:opacity-80",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-3 px-[18px] py-4 lg:flex-col lg:items-start lg:gap-[7px] lg:p-0",
          selected ? "bg-[#eef4ff] lg:bg-transparent" : "",
        )}
      >
        {icon}
        <span className="flex-1 lg:pt-[5px]">
          <span className="block font-headline text-[17px] font-extrabold uppercase lg:text-lg">
            {title}
          </span>
          <span className="mt-1 inline-flex lg:mt-0">{badge}</span>
        </span>
        <span
          className={cn(
            "flex size-6 items-center justify-center lg:absolute lg:top-[18px] lg:right-[18px] lg:size-5",
            selected ? "bg-tdev-blue text-tdev-white" : "border-2 border-[#c5c5c5] lg:hidden",
          )}
        >
          {selected ? <CheckIcon className="size-[15px] lg:size-3.5" /> : null}
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-3 px-[18px] py-4 text-[13px] leading-relaxed text-tdev-subtle lg:p-0 lg:pt-1 lg:text-xs">
        <span className={cn(selected ? "block" : "hidden lg:block")}>
          {description}
        </span>
        {children}
      </span>
      {footer ? (
        <span
          className={cn(
            "hidden border-t px-0 pt-3 text-[11px] lg:block",
            selected
              ? "border-[#d8e6ff] font-medium text-tdev-blue"
              : "border-tdev-border text-tdev-muted",
          )}
        >
          {footer}
        </span>
      ) : null}
    </button>
  );
}
