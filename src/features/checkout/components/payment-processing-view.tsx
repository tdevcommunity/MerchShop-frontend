"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { useCart } from "@/features/cart/hooks/use-cart";
import { createCheckoutSession } from "@/features/checkout/services/checkout-service";
import { cartStore } from "@/features/cart/store/cart-store";
import { checkoutDraftStore } from "@/features/checkout/store/checkout-draft-store";
import { simulateMockPayment } from "@/features/payment/services/mock-payment";
import { isPaymentSuccess } from "@/features/payment/services/payment-status";
import { formatMoney } from "@/lib/utils/format-money";
import { toUserMessage, ValidationError } from "@/lib/api/errors";
import { validateCheckoutDraft } from "@/lib/validation/checkout";

export function PaymentProcessingView() {
  const cart = useCart();
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

  if (status === "failed") {
    return (
      <div className="flex min-h-dvh flex-col bg-tdev-anthracite text-tdev-white">
        <header className="hidden h-[72px] w-full items-center px-12 lg:flex">
          <BrandMark inverted />
        </header>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-8">
          <Alert title="Paiement interrompu" tone="error">
            {error ?? "Une erreur est survenue."}
          </Alert>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              started.current = false;
              setStatus("processing");
              setError(null);
              setRetryKey((value) => value + 1);
            }}
          >
            Réessayer
          </Button>
          <Link href="/checkout/payment" className="text-center text-sm text-tdev-yellow">
            Changer de moyen de paiement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-tdev-anthracite text-tdev-white">
      <header className="hidden h-[72px] w-full items-center px-12 lg:flex">
        <BrandMark inverted />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-7 px-8">
        <Spinner
          className="size-16 border-4 border-[#4a4f51] border-t-tdev-yellow lg:size-20"
          label="Paiement en cours"
        />
        <div className="flex flex-col items-center gap-2.5 text-center">
          <h1 className="font-headline text-3xl font-extrabold uppercase leading-[0.95] lg:text-5xl">
            Paiement
            <br />
            en cours
          </h1>
          <p className="max-w-[280px] text-sm leading-relaxed text-[#b5b5b5] lg:max-w-sm lg:text-base">
            Nous confirmons ton paiement mocké. Ne ferme pas cette page.
          </p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-2.5 border border-[#33383a] bg-[#24282a] px-5 py-[18px] lg:max-w-md">
          <p className="flex justify-between text-xs uppercase tracking-[0.3px] text-[#8a8f91]">
            <span>Statut</span>
            <span className="font-bold text-tdev-yellow">En attente</span>
          </p>
          <p className="flex justify-between text-sm">
            <span className="text-[#8a8f91]">Montant estimé</span>
            <span className="font-headline font-extrabold">
              {formatMoney(cart.subtotal)}
            </span>
          </p>
        </div>
      </div>
      <p className="flex items-center justify-center gap-2.5 bg-tdev-orange px-6 py-[18px] text-[13px] font-bold text-tdev-anthracite lg:text-sm">
        Ne ferme pas cette page pendant le paiement
      </p>
    </div>
  );
}
