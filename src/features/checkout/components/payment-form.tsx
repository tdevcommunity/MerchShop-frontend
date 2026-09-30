"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { CheckIcon, CreditCardIcon, PhoneIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { CheckoutFooterBar } from "@/features/checkout/components/checkout-footer-bar";
import { CheckoutOrderSummary } from "@/features/checkout/components/checkout-order-summary";
import { CheckoutShell } from "@/features/checkout/components/checkout-shell";
import { CheckoutStepIntro } from "@/features/checkout/components/checkout-step-intro";
import { EmptyCheckout } from "@/features/checkout/components/empty-checkout";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  useCheckoutDraft,
  useCheckoutDraftActions,
} from "@/features/checkout/hooks/use-checkout-draft";
import { deliveryLabel } from "@/features/checkout/utils";
import {
  validateCardDetails,
  validateFulfillment,
  validateInformation,
  validatePayment,
  type CardDetailsInput,
} from "@/lib/validation/checkout";
import { formatMoney } from "@/lib/utils/format-money";
import { cn } from "@/lib/utils/cn";
import type { CheckoutDraft, MobileOperator } from "@/types/checkout";
import type { PaymentMethod } from "@/types/payment";

const emptyCard: CardDetailsInput = {
  holderName: "",
  number: "",
  expiry: "",
  cvc: "",
};

export function PaymentForm() {
  const cart = useCart();
  const draft = useCheckoutDraft();
  const { update } = useCheckoutDraftActions();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [card, setCard] = useState<CardDetailsInput>(emptyCard);
  const [paying, setPaying] = useState(false);

  if (cart.items.length === 0) {
    return <EmptyCheckout />;
  }

  const blocked =
    Object.keys(validateFulfillment(draft)).length > 0 ||
    Object.keys(validateInformation(draft)).length > 0;

  if (blocked) {
    return (
      <CheckoutShell
        title="Paiement"
        stepIndex={3}
        current="payment"
        backHref="/checkout/information"
      >
        <Alert title="Informations incomplètes" tone="error">
          Complète d&apos;abord le mode de réception et tes coordonnées.
        </Alert>
      </CheckoutShell>
    );
  }

  function selectMethod(method: PaymentMethod) {
    if (method === "mobile_money") {
      update({
        paymentMethod: method,
        mobileOperator: draft.mobileOperator ?? "mixx",
      });
    } else {
      update({ paymentMethod: method, mobileOperator: null });
    }
    setErrors({});
  }

  function selectOperator(operator: MobileOperator) {
    update({ paymentMethod: "mobile_money", mobileOperator: operator });
    setErrors((current) => {
      const next = { ...current };
      delete next.mobileOperator;
      return next;
    });
  }

  function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (paying) {
      return;
    }
    const fields = { ...validatePayment(draft) };
    if (draft.paymentMethod === "card") {
      Object.assign(fields, validateCardDetails(card));
    }
    setErrors(fields);
    if (Object.keys(fields).length > 0) {
      return;
    }
    setPaying(true);
    track(analyticsEvents.paymentStarted, { itemCount: cart.itemCount });
    router.push("/checkout/processing");
  }

  const summaryError =
    errors.paymentMethod ?? errors.mobileOperator ?? errors.phone;
  const mobileSelected = draft.paymentMethod === "mobile_money";
  const cardSelected = draft.paymentMethod === "card";

  const mobileFields = (
    <MobileMoneyFields
      draft={draft}
      errors={errors}
      onOperator={selectOperator}
      onPhone={(phone) =>
        update({ customer: { ...draft.customer, phone } })
      }
    />
  );

  const cardFields = (
    <CardFields
      card={card}
      errors={errors}
      onChange={setCard}
    />
  );

  return (
    <CheckoutShell
      title="Paiement"
      stepIndex={3}
      current="payment"
      backHref="/checkout/information"
      summary={
        <CheckoutOrderSummary
          cart={cart}
          receptionNote={deliveryLabel(draft.deliveryMethod)}
          receptionFree={draft.deliveryMethod === "pickup_event"}
          action={
            <CheckoutFooterBar
              total={cart.subtotal}
              actionLabel={
                paying ? "Paiement en cours..." : `Payer ${formatMoney(cart.subtotal)}`
              }
              loading={paying}
              formId="checkout-payment"
              variant="sidebar"
            />
          }
        />
      }
      footer={
        <CheckoutFooterBar
          total={cart.subtotal}
          actionLabel={
            paying ? "Paiement en cours..." : `Payer ${formatMoney(cart.subtotal)}`
          }
          loading={paying}
          formId="checkout-payment"
        />
      }
    >
      <form
        id="checkout-payment"
        className="flex flex-1 flex-col gap-5 lg:gap-10"
        onSubmit={pay}
        noValidate
      >
        <CheckoutStepIntro
          eyebrow="Étape 3 — Paiement"
          index="02"
          title="Comment tu paies ?"
        >
          Choisis un moyen. Les champs s&apos;affichent ensuite, sans empiler
          tout le formulaire.
        </CheckoutStepIntro>

        <div className="bg-tdev-anthracite px-[22px] py-5 text-tdev-white lg:hidden">
          <p className="text-xs font-bold uppercase tracking-[1.8px] text-[#9a9a9a]">
            Montant à payer
          </p>
          <p className="font-headline text-[42px] font-extrabold leading-[1.05] text-tdev-yellow">
            {formatMoney(cart.subtotal)}
          </p>
          <p className="pt-1.5 text-[13px] font-medium text-[#c5c5c5]">
            {cart.itemCount} article{cart.itemCount > 1 ? "s" : ""} ·{" "}
            {deliveryLabel(draft.deliveryMethod)}
          </p>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Moyen de paiement</legend>
          <p className="text-xs font-bold uppercase tracking-[1.8px] lg:hidden">
            Moyen de paiement
          </p>

          <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
            <PaymentTile
              selected={mobileSelected}
              onSelect={() => selectMethod("mobile_money")}
              icon={
                <span className="flex size-[42px] items-center justify-center bg-tdev-blue text-tdev-yellow lg:size-10">
                  <PhoneIcon className="size-5" />
                </span>
              }
              title="Mobile Money"
              badge={
                <span className="bg-tdev-green px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.275px] text-tdev-white">
                  Instantané
                </span>
              }
              description="Paiement via Mixx By Yas ou Moov Money. On te demande le numéro ici."
            />

            <PaymentTile
              selected={cardSelected}
              onSelect={() => selectMethod("card")}
              icon={
                <span className="flex size-[42px] items-center justify-center bg-tdev-anthracite text-tdev-white lg:size-10">
                  <CreditCardIcon className="size-5" />
                </span>
              }
              title="Carte bancaire"
              badge={
                <span className="bg-[#f0f0ee] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.275px]">
                  Visa / Mastercard
                </span>
              }
              description="Interface mockée. Aucune donnée carte n’est envoyée ni stockée."
            />
          </div>

          {mobileSelected ? (
            <section className="motion-panel border border-tdev-anthracite bg-tdev-white p-4 lg:p-8">
              <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-tdev-muted lg:block">
                Détails Mobile Money
              </p>
              <div className="lg:mt-6 lg:max-w-xl">{mobileFields}</div>
            </section>
          ) : null}

          {cardSelected ? (
            <section className="motion-panel border border-tdev-anthracite bg-tdev-white p-4 lg:p-8">
              <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-tdev-muted lg:block">
                Détails de la carte
              </p>
              <p className="mt-0 hidden max-w-xl text-sm text-tdev-muted lg:mt-2 lg:block">
                Simulation locale uniquement. Rien n’est persisté.
              </p>
              <div className="lg:mt-6 lg:max-w-xl">{cardFields}</div>
            </section>
          ) : null}

          {!mobileSelected && !cardSelected ? (
            <p className="hidden border border-dashed border-tdev-border bg-tdev-white px-8 py-16 text-center text-sm text-tdev-muted lg:block">
              Sélectionne un moyen de paiement pour afficher les champs.
            </p>
          ) : null}

          <div className="border border-tdev-border px-4 py-3.5 opacity-60 lg:px-6">
            <p className="font-headline text-base font-extrabold uppercase">
              Paiement à la livraison
            </p>
            <p className="text-xs text-tdev-muted">
              Provisoire — non branché tant que le backend ne le confirme pas.
            </p>
          </div>
        </fieldset>

        {summaryError ? (
          <Alert title="Paiement" tone="error">
            {summaryError}
          </Alert>
        ) : null}
      </form>
    </CheckoutShell>
  );
}

function MobileMoneyFields({
  draft,
  errors,
  onOperator,
  onPhone,
}: {
  draft: CheckoutDraft;
  errors: Record<string, string>;
  onOperator: (operator: MobileOperator) => void;
  onPhone: (phone: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <OperatorChip
          label="Mixx By Yas"
          selected={draft.mobileOperator === "mixx"}
          onClick={() => onOperator("mixx")}
        />
        <OperatorChip
          label="Moov Money"
          selected={draft.mobileOperator === "moov"}
          onClick={() => onOperator("moov")}
        />
      </div>
      <Input
        name="phone"
        label="Numéro de téléphone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+228 90 12 34 56"
        hint="Numéro Mixx ou Moov pour valider le paiement."
        value={draft.customer.phone}
        error={errors.phone}
        onChange={(event) => onPhone(event.target.value)}
      />
    </div>
  );
}

function CardFields({
  card,
  errors,
  onChange,
}: {
  card: CardDetailsInput;
  errors: Record<string, string>;
  onChange: (card: CardDetailsInput) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Input
        name="cardNumber"
        label="Numéro de carte"
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="ACCT-000015"
        value={card.number}
        error={errors.number}
        onChange={(event) =>
          onChange({ ...card, number: formatCardNumber(event.target.value) })
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="cardExpiry"
          label="Expiration"
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/AA"
          value={card.expiry}
          error={errors.expiry}
          onChange={(event) =>
            onChange({ ...card, expiry: formatCardExpiry(event.target.value) })
          }
        />
        <Input
          name="cardCvc"
          label="CVC"
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder="123"
          value={card.cvc}
          error={errors.cvc}
          onChange={(event) =>
            onChange({
              ...card,
              cvc: event.target.value.replace(/\D/g, "").slice(0, 4),
            })
          }
        />
      </div>
      <Input
        name="cardHolder"
        label="Nom sur la carte"
        autoComplete="cc-name"
        placeholder="AMA KOFFI"
        value={card.holderName}
        error={errors.holderName}
        onChange={(event) =>
          onChange({ ...card, holderName: event.target.value })
        }
      />
      <p className="text-xs text-tdev-muted lg:hidden">
        Interface mockée. Aucune donnée carte n&apos;est envoyée ni stockée.
      </p>
    </div>
  );
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatCardExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function PaymentTile({
  selected,
  onSelect,
  icon,
  title,
  badge,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  badge: ReactNode;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col border-2 bg-tdev-white text-left transition-colors duration-150",
        "lg:min-h-[220px] lg:justify-between lg:p-5 lg:hover:border-tdev-blue",
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
            selected
              ? "bg-tdev-blue text-tdev-white"
              : "border-2 border-[#c5c5c5] lg:hidden",
          )}
        >
          {selected ? <CheckIcon className="size-[15px] lg:size-3.5" /> : null}
        </span>
      </span>
      <span
        className={cn(
          "px-[18px] pb-4 text-[13px] leading-relaxed text-tdev-subtle lg:p-0 lg:pt-1 lg:text-xs",
          selected ? "block" : "hidden lg:block",
        )}
      >
        {description}
      </span>
    </button>
  );
}

function OperatorChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "min-h-11 flex-1 border px-3 text-xs font-bold uppercase",
        selected
          ? "border-tdev-anthracite bg-tdev-anthracite text-tdev-white"
          : "border-tdev-anthracite bg-tdev-white",
      )}
    >
      {label}
    </button>
  );
}
