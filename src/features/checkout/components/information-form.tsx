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
            ? " et renseigne l’adresse de livraison."
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
        className="flex flex-1 flex-col gap-5 lg:gap-8"
        onSubmit={handleSubmit}
        noValidate
      >
        <CheckoutStepIntro eyebrow="Étape 2 — Identité" title="Tes coordonnées">
          On garde ça court. Juste l’essentiel pour te contacter.
        </CheckoutStepIntro>

        <div className="flex flex-1 flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-10">
          <div className="flex flex-col gap-[18px] border border-tdev-anthracite bg-tdev-white p-4 lg:min-h-[380px] lg:p-8">
            <div className="grid gap-3.5 sm:grid-cols-2">
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
              hint="Pour t’envoyer le reçu. Tu peux passer cette étape."
              value={draft.customer.email}
              error={errors.email}
              onChange={(event) =>
                update({
                  customer: { ...draft.customer, email: event.target.value },
                })
              }
            />
            <p className="mt-auto text-xs text-tdev-muted">
              Ces informations servent à la commande. Elles ne sont pas une preuve
              de paiement.
            </p>
          </div>

          <aside className="hidden border border-tdev-anthracite bg-tdev-white lg:flex lg:flex-col">
            <p className="border-b border-tdev-border px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-tdev-muted">
              À retenir
            </p>
            <dl>
              <div className="border-b border-tdev-border px-6 py-5">
                <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-tdev-muted">
                  Réception
                </dt>
                <dd className="mt-1 font-headline text-lg font-extrabold">
                  {deliveryLabel(draft.deliveryMethod)}
                </dd>
              </div>
              <div className="border-b border-tdev-border px-6 py-5">
                <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-tdev-muted">
                  Email
                </dt>
                <dd className="mt-1 text-sm leading-relaxed">
                  Optionnel. Utile pour le reçu digital.
                </dd>
              </div>
              <div className="px-6 py-5">
                <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-tdev-muted">
                  Téléphone
                </dt>
                <dd className="mt-1 text-sm leading-relaxed">
                  Demandé à l’étape paiement si tu choisis Mobile Money.
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </form>
    </CheckoutShell>
  );
}
