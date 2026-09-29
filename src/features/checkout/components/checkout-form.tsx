"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { CheckoutSteps } from "@/features/checkout/components/checkout-steps";
import { createCheckoutSession } from "@/features/checkout/services/checkout-service";
import { useCart, useCartActions } from "@/features/cart/hooks/use-cart";
import { ValidationError } from "@/lib/api/errors";
import { validateCheckoutDraft } from "@/lib/validation/checkout";
import type { CheckoutDraft, CheckoutStep } from "@/types/checkout";
import { DELIVERY_METHODS } from "@/types/delivery";

const initialDraft: CheckoutDraft = {
  customer: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  deliveryMethod: null,
  shippingAddress: {
    line1: "",
    city: "",
    country: "Togo",
  },
};

export function CheckoutForm() {
  const cart = useCart();
  const { clear } = useCartActions();
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>("customer");
  const [draft, setDraft] = useState<CheckoutDraft>(initialDraft);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canContinue = cart.items.length > 0;

  const deliveryOptions = useMemo(
    () => [
      { value: DELIVERY_METHODS.PICKUP_EVENT, label: "Retrait Jour J — stand Merch" },
      { value: DELIVERY_METHODS.DELIVERY, label: "Livraison" },
    ],
    [],
  );

  function goNext() {
    if (step === "customer") {
      setStep("delivery");
      return;
    }
    if (step === "delivery") {
      if (draft.deliveryMethod) {
        track(analyticsEvents.deliveryMethodSelected, {
          method: draft.deliveryMethod,
        });
      }
      setStep("review");
      return;
    }
    setStep("payment");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (step !== "payment") {
      goNext();
      return;
    }

    try {
      validateCheckoutDraft(draft);
      setFieldErrors({});
      setIsSubmitting(true);
      track(analyticsEvents.paymentStarted, { itemCount: cart.itemCount });
      const order = await createCheckoutSession(draft, cart.items);
      clear();
      track(analyticsEvents.orderCompleted, { orderId: order.id });
      router.push(`/checkout/confirmation?orderId=${encodeURIComponent(order.id)}`);
    } catch (error) {
      if (error instanceof ValidationError) {
        setFieldErrors(error.fields);
        setStep("customer");
        return;
      }
      setSubmitError("Le checkout n'a pas pu aboutir. Réessaie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!canContinue) {
    return (
      <Alert title="Panier vide" tone="info">
        Ajoute des articles avant de lancer le checkout.
      </Alert>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <CheckoutSteps current={step} />

      {step === "customer" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="firstName"
            label="Prénom"
            autoComplete="given-name"
            value={draft.customer.firstName}
            error={fieldErrors.firstName}
            onChange={(event) =>
              setDraft({
                ...draft,
                customer: { ...draft.customer, firstName: event.target.value },
              })
            }
          />
          <Input
            name="lastName"
            label="Nom"
            autoComplete="family-name"
            value={draft.customer.lastName}
            error={fieldErrors.lastName}
            onChange={(event) =>
              setDraft({
                ...draft,
                customer: { ...draft.customer, lastName: event.target.value },
              })
            }
          />
          <Input
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={draft.customer.email}
            error={fieldErrors.email}
            onChange={(event) =>
              setDraft({
                ...draft,
                customer: { ...draft.customer, email: event.target.value },
              })
            }
          />
          <Input
            name="phone"
            label="Téléphone"
            type="tel"
            autoComplete="tel"
            hint="Mobile Money (T-Money / Flooz) si besoin"
            value={draft.customer.phone}
            error={fieldErrors.phone}
            onChange={(event) =>
              setDraft({
                ...draft,
                customer: { ...draft.customer, phone: event.target.value },
              })
            }
          />
        </div>
      ) : null}

      {step === "delivery" ? (
        <div className="flex flex-col gap-4">
          <Select
            name="deliveryMethod"
            label="Mode de réception"
            placeholder="Choisir"
            options={deliveryOptions}
            value={draft.deliveryMethod ?? ""}
            error={fieldErrors.deliveryMethod}
            onChange={(event) =>
              setDraft({
                ...draft,
                deliveryMethod:
                  event.target.value === DELIVERY_METHODS.DELIVERY
                    ? DELIVERY_METHODS.DELIVERY
                    : event.target.value === DELIVERY_METHODS.PICKUP_EVENT
                      ? DELIVERY_METHODS.PICKUP_EVENT
                      : null,
              })
            }
          />
          {draft.deliveryMethod === DELIVERY_METHODS.DELIVERY ? (
            <>
              <Input
                name="line1"
                label="Adresse"
                value={draft.shippingAddress?.line1 ?? ""}
                error={fieldErrors.line1}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    shippingAddress: {
                      line1: event.target.value,
                      city: draft.shippingAddress?.city ?? "",
                      country: draft.shippingAddress?.country ?? "Togo",
                    },
                  })
                }
              />
              <Input
                name="city"
                label="Ville"
                value={draft.shippingAddress?.city ?? ""}
                error={fieldErrors.city}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    shippingAddress: {
                      line1: draft.shippingAddress?.line1 ?? "",
                      city: event.target.value,
                      country: draft.shippingAddress?.country ?? "Togo",
                    },
                  })
                }
              />
            </>
          ) : null}
          {draft.deliveryMethod === DELIVERY_METHODS.PICKUP_EVENT ? (
            <Alert title="Retrait Jour J">
              Présente le QR Code de ta commande au stand Merch du festival.
            </Alert>
          ) : null}
        </div>
      ) : null}

      {step === "review" ? (
        <Alert title="Vérifie ta commande" tone="info">
          {cart.itemCount} article(s). Le montant définitif sera calculé par le
          backend, jamais à partir du seul panier navigateur.
        </Alert>
      ) : null}

      {step === "payment" ? (
        <Alert title="Paiement" tone="info">
          Mobile Money (T-Money, Flooz) et carte bancaire seront déclenchés par le
          backend. Cette étape simule le démarrage du flux — aucun secret n&apos;est
          stocké ici.
        </Alert>
      ) : null}

      {submitError ? <Alert title="Erreur" tone="error">{submitError}</Alert> : null}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {step === "payment"
          ? isSubmitting
            ? "Traitement…"
            : "Simuler le paiement"
          : "Continuer"}
      </Button>
    </form>
  );
}
