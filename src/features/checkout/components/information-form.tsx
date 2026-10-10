"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { CheckoutFooterBar } from "@/features/checkout/components/checkout-footer-bar";
import { CheckoutOrderSummary } from "@/features/checkout/components/checkout-order-summary";
import { CheckoutShell } from "@/features/checkout/components/checkout-shell";
import { CheckoutStepIntro } from "@/features/checkout/components/checkout-step-intro";
import { EmptyCheckout } from "@/features/checkout/components/empty-checkout";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  useCheckoutDraft,
  useCheckoutDraftActions,
} from "@/features/checkout/hooks/use-checkout-draft";
import { deliveryLabel } from "@/features/checkout/utils";
import { validateFulfillment, validateInformation } from "@/lib/validation/checkout";

export function InformationForm() {
  const cart = useCart();
  const draft = useCheckoutDraft();
  const { update } = useCheckoutDraftActions();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (cart.items.length === 0) {
    return <EmptyCheckout />;
  }

  const fulfillmentError = Object.keys(validateFulfillment(draft)).length > 0;
  if (fulfillmentError) {
    return (
      <CheckoutShell
        title="Informations"
        stepIndex={2}
        current="information"
        backHref="/checkout/fulfillment"
      >
        <Alert title="Mode de réception incomplet" tone="error">
          Choisis d&apos;abord comment tu reçois ta commande
          {draft.deliveryMethod === "delivery"
            ? " et renseigne l'adresse de livraison."
            : "."}
        </Alert>
      </CheckoutShell>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateInformation(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    router.push("/checkout/payment");
  }

  return (
    <CheckoutShell
      title="Informations"
      stepIndex={2}
      current="information"
      backHref="/checkout/fulfillment"
      summary={
        <CheckoutOrderSummary
          cart={cart}
          receptionNote={deliveryLabel(draft.deliveryMethod)}
          receptionFree={draft.deliveryMethod === "pickup_event"}
          action={
            <CheckoutFooterBar
              total={cart.subtotal}
              actionLabel="Passer au paiement"
              formId="checkout-information"
              variant="sidebar"
            />
          }
        />
      }
      footer={
        <CheckoutFooterBar
          total={cart.subtotal}
          actionLabel="Continuer vers le paiement"
          formId="checkout-information"
        />
      }
    >
      <form
        id="checkout-information"
        className="flex flex-1 flex-col gap-5 lg:gap-10"
        onSubmit={handleSubmit}
        noValidate
      >
        <CheckoutStepIntro
          eyebrow="Étape 2 — Identité"
          index="02"
          title="Tes coordonnées"
        >
          On garde ça court. Juste l&apos;essentiel pour sécuriser ton retrait et
          tes justificatifs.
        </CheckoutStepIntro>

        <div className="flex flex-col gap-4 lg:pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="firstName"
              label="Prénom"
              autoComplete="given-name"
              value={draft.customer.firstName}
              error={errors.firstName}
              onChange={(event) =>
                update({
                  customer: { ...draft.customer, firstName: event.target.value },
                })
              }
            />
            <Input
              name="lastName"
              label="Nom"
              autoComplete="family-name"
              value={draft.customer.lastName}
              error={errors.lastName}
              onChange={(event) =>
                update({
                  customer: { ...draft.customer, lastName: event.target.value },
                })
              }
            />
          </div>
          <Input
            name="email"
            label="Email (optionnel)"
            type="email"
            autoComplete="email"
            hint="Pour t'envoyer le reçu. Tu peux passer cette étape."
            value={draft.customer.email}
            error={errors.email}
            onChange={(event) =>
              update({
                customer: { ...draft.customer, email: event.target.value },
              })
            }
          />
          <Input
            name="phone"
            label="Numéro de téléphone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+228 90 12 34 56"
            hint="Pour l'accès à ta commande et les notifications de livraison."
            value={draft.customer.phone}
            error={errors.phone}
            onChange={(event) =>
              update({
                customer: { ...draft.customer, phone: event.target.value },
              })
            }
          />
          <p className="flex items-start gap-2 pt-2 text-xs font-medium text-tdev-green">
            Tes données sont chiffrées selon les standards de sécurité et ne sont
            jamais partagées.
          </p>
        </div>
      </form>
    </CheckoutShell>
  );
}
