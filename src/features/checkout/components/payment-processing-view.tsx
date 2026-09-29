"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { PhoneIcon, ShieldIcon } from "@/components/ui/icons";
import { DesktopCheckoutNav } from "@/features/checkout/components/desktop-checkout-nav";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useCheckoutDraft } from "@/features/checkout/hooks/use-checkout-draft";
import { createCheckoutSession } from "@/features/checkout/services/checkout-service";
import { operatorLabel } from "@/features/checkout/utils";
import { cartStore } from "@/features/cart/store/cart-store";
import { checkoutDraftStore } from "@/features/checkout/store/checkout-draft-store";
import { simulateMockPayment } from "@/features/payment/services/mock-payment";
import { isPaymentSuccess } from "@/features/payment/services/payment-status";
import { formatMoney } from "@/lib/utils/format-money";
import { toUserMessage, ValidationError } from "@/lib/api/errors";
import { validateCheckoutDraft } from "@/lib/validation/checkout";

export function PaymentProcessingView() {
  const cart = useCart();
  const draft = useCheckoutDraft();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "failed">("processing");
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const started = useRef(false);

  const fail = searchParams.get("fail") === "1";

  useEffect(() => {
    if (started.current) {
      return;
    }

    checkoutDraftStore.hydrate();
    cartStore.hydrate();
    const readyCart = cartStore.getSnapshot();
    const readyDraft = checkoutDraftStore.getSnapshot();
    if (readyCart.items.length === 0) {
      router.replace("/cart");
      return;
    }
    if (!readyDraft.paymentMethod) {
      router.replace("/checkout/payment");
      return;
    }

    started.current = true;
    let cancelled = false;

    async function run() {
      try {
        const latestDraft = checkoutDraftStore.getSnapshot();
        const latestCart = cartStore.getSnapshot();
        validateCheckoutDraft(latestDraft);
        const paymentStatus = await simulateMockPayment(fail);
        if (cancelled) {
          return;
        }
        if (!isPaymentSuccess(paymentStatus)) {
          track(analyticsEvents.paymentFailed, { reason: "mock_failed" });
          setStatus("failed");
          setError("Le paiement n'a pas abouti. Tu peux réessayer.");
          started.current = false;
          return;
        }
        const order = await createCheckoutSession(latestDraft, latestCart.items);
        if (cancelled) {
          return;
        }
        cartStore.clear();
        checkoutDraftStore.clear();
        track(analyticsEvents.paymentSuccess, { orderId: order.id });
        track(analyticsEvents.orderCompleted, { orderId: order.id });
        router.replace(
          `/checkout/confirmation?orderId=${encodeURIComponent(order.id)}`,
        );
      } catch (runError) {
        if (cancelled) {
          return;
        }
        started.current = false;
        track(analyticsEvents.paymentFailed, { reason: "checkout_error" });
        setStatus("failed");
        setError(
          runError instanceof ValidationError
            ? "Des informations de commande sont incomplètes."
            : toUserMessage(runError),
        );
      }
    }

    void run();
    return () => {
      cancelled = true;
      started.current = false;
    };
  }, [fail, retryKey, router]);

  function retry() {
    started.current = false;
    setStatus("processing");
    setError(null);
    setRetryKey((value) => value + 1);
  }

  const phone = draft.customer.phone.trim() || "ton numéro";
  const operator = operatorLabel(draft.mobileOperator);

  return (
    <div className="flex min-h-dvh flex-col bg-[#141615] text-tdev-white">
      <header className="flex h-14 items-center justify-between border-b border-[#2d302f] px-5 lg:h-[72px] lg:px-14">
        <BrandMark inverted />
        <DesktopCheckoutNav current="processing" inverted />
        <p className="hidden items-center gap-2 border border-[#33383a] bg-[#24282a] px-3.5 py-1.5 lg:flex">
          <span className="size-2 rounded-full bg-tdev-yellow" />
          <span className="font-headline text-xs font-bold uppercase tracking-[0.6px] text-tdev-yellow">
            Session sécurisée
          </span>
        </p>
      </header>

      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-10 lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-5 [background-image:linear-gradient(90deg,#fff_2.5%,transparent_2.5%),linear-gradient(#fff_2.5%,transparent_2.5%)] [background-size:24px_24px]"
          aria-hidden="true"
        />

        {status === "failed" ? (
          <div className="motion-enter relative z-10 mx-auto flex w-full max-w-md flex-col gap-4">
            <Alert title="Paiement interrompu" tone="error">
              {error ?? "Une erreur est survenue."}
            </Alert>
            <Button variant="primary" size="lg" onClick={retry}>
              Réessayer
            </Button>
            <Link
              href="/checkout/payment"
              className="text-center text-sm text-tdev-yellow"
            >
              Changer de moyen de paiement
            </Link>
          </div>
        ) : (
          <article className="motion-scale-in relative z-10 flex w-full max-w-[580px] flex-col items-center border-2 border-[#33383a] bg-tdev-anthracite px-6 py-10 shadow-[8px_8px_0_#fee800] lg:px-[50px] lg:py-12">
            <div className="relative mb-8 flex size-[112px] items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-tdev-yellow" />
              <span className="absolute inset-2 rounded-full border-2 border-[#2c3133]" />
              <span className="flex size-14 items-center justify-center rounded-full bg-tdev-blue">
                <PhoneIcon className="size-6 text-tdev-white" />
              </span>
            </div>

            <h1 className="text-center font-headline text-3xl font-extrabold uppercase leading-none tracking-[-1.2px] lg:text-5xl">
              Paiement en
              <br />
              cours
            </h1>
            <p className="mt-6 max-w-[448px] text-center text-sm leading-relaxed text-[#b5b5b5] lg:text-base">
              Valide la notification reçue sur ton téléphone au{" "}
              <span className="font-bold text-tdev-white">{phone}</span>. Nous
              synchronisons en direct avec l&apos;opérateur{" "}
              <span className="font-bold text-tdev-orange">
                {draft.mobileOperator === "mixx"
                  ? "Mixx By Yas"
                  : draft.mobileOperator === "moov"
                    ? "Moov Money"
                    : "choisi"}
                ...
              </span>
            </p>

            <div className="motion-processing-dots mt-8 flex items-center gap-2" aria-hidden="true">
              <span className="size-3 bg-tdev-yellow" />
              <span className="size-3 bg-tdev-yellow" />
              <span className="size-3 bg-[#4a4f51]" />
            </div>

            <dl className="mt-8 flex w-full flex-col gap-3 border border-[#33383a] bg-[#24282a] p-5">
              <div className="flex items-center justify-between">
                <dt className="text-xs font-semibold uppercase tracking-[0.6px] text-[#8a8f91]">
                  Référence de commande
                </dt>
                <dd className="font-headline text-sm font-extrabold">En cours</dd>
              </div>
              <div className="h-px bg-[#33383a]" />
              <div className="flex items-center justify-between">
                <dt className="text-xs font-semibold uppercase tracking-[0.6px] text-[#8a8f91]">
                  Opérateur
                </dt>
                <dd className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="size-2 rounded-full bg-tdev-orange" />
                  {operator}
                </dd>
              </div>
              <div className="h-px bg-[#33383a]" />
              <div className="flex items-center justify-between">
                <dt className="text-xs font-semibold uppercase tracking-[0.6px] text-[#8a8f91]">
                  Statut actuel
                </dt>
                <dd className="flex items-center gap-1.5 text-xs font-bold text-tdev-yellow">
                  <span className="size-2 bg-tdev-yellow" />
                  En attente du push USSD
                </dd>
              </div>
              <div className="h-px bg-[#33383a]" />
              <div className="flex items-center justify-between">
                <dt className="text-xs font-semibold uppercase tracking-[0.6px] text-[#8a8f91]">
                  Montant total
                </dt>
                <dd className="font-headline text-xl font-extrabold text-tdev-yellow">
                  {formatMoney(cart.subtotal)}
                </dd>
              </div>
            </dl>

            <p className="mt-6 flex w-full items-center justify-center gap-2.5 bg-tdev-orange px-4 py-3.5 text-center text-sm font-bold tracking-[0.35px] text-tdev-anthracite">
              Ne ferme pas cette page pendant la confirmation
            </p>

            <div className="mt-6 flex w-full items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs text-[#8a8f91]">
                <ShieldIcon className="size-4 text-tdev-green" />
                Chiffrement bancaire de bout en bout
              </p>
              <button
                type="button"
                onClick={retry}
                className="text-xs font-semibold text-tdev-yellow"
              >
                Renvoyer le push USSD
              </button>
            </div>
          </article>
        )}
      </div>

      <footer className="hidden items-center justify-between border-t border-[#2d302f] px-14 py-5 text-xs text-[#8a8f91] lg:flex">
        <p>© 2026 TDEV Festival • Boutique Officielle • Besoin d&apos;aide ? contact@tdev.tg</p>
        <p className="flex items-center gap-1.5 text-tdev-white">
          <span className="size-2 rounded-full bg-tdev-green" />
          Serveurs de paiement opérationnels
        </p>
      </footer>
    </div>
  );
}
