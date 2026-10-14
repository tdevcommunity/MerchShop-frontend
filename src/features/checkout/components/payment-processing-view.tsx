"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { CreditCardIcon, ShieldIcon } from "@/components/ui/icons";
import { DesktopCheckoutNav } from "@/features/checkout/components/desktop-checkout-nav";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useCheckoutDraft } from "@/features/checkout/hooks/use-checkout-draft";
import { getOrderById } from "@/features/order/services/order-service";
import {
  isOrderAwaitingPayment,
  isOrderPaid,
} from "@/features/order/utils/order-payment-state";
import { createCheckoutSession } from "@/features/checkout/services/checkout-service";
import { cartStore } from "@/features/cart/store/cart-store";
import { checkoutDraftStore } from "@/features/checkout/store/checkout-draft-store";
import { openPaymentCheckout } from "@/features/payment/services/payment-checkout-service";
import { rememberPendingPayment } from "@/features/payment/store/pending-payment";
import { formatMoney } from "@/lib/utils/format-money";
import { toUserMessage, ValidationError } from "@/lib/api/errors";
import {
  resetSharedCheckoutOrder,
  getSharedCheckoutOrder,
  getSharedOpenPaymentCheckout,
  stageVeltoRedirect,
} from "@/features/checkout/utils/checkout-processing-session";
import {
  completeVeltoRedirectIfReady,
  subscribeVeltoRedirectReady,
} from "@/features/checkout/utils/velto-redirect-session";
import { commitCheckoutDraftForPayment } from "@/features/checkout/utils/prepare-velto-payment";
import {
  checkoutPathForValidationFields,
  firstCheckoutValidationMessage,
  validateCheckoutDraft,
} from "@/lib/validation/checkout";

export function PaymentProcessingView() {
  const cart = useCart();
  const draft = useCheckoutDraft();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeOrderId = searchParams.get("orderId");
  const [status, setStatus] = useState<"processing" | "failed">("processing");
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  /*
   * Creation de commande en cours, partagee par les rejeux d'effet.
   *
   * En developpement, React rejoue les effets (StrictMode) : sans cette
   * memoire, chaque rejeu repartirait de zero et creerait sa propre commande.
   * Ce ne serait pas qu'un doublon a l'ecran — l'API reserve le stock a chaque
   * creation, donc deux commandes pour un seul panier, avec deux retraitements.
   * En partageant la promesse, le rejeu attend la meme commande et n'en cree
   * pas une seconde.
   */
  useEffect(() => {
    function beforeVeltoRedirect(orderId: string, checkoutUrl: string) {
      rememberPendingPayment(orderId, checkoutUrl);
      if (!resumeOrderId) {
        cartStore.clear();
        checkoutDraftStore.clear();
      }
      track(analyticsEvents.paymentStarted, { orderId });
    }

    function tryRedirect() {
      return completeVeltoRedirectIfReady(beforeVeltoRedirect);
    }

    if (tryRedirect()) {
      return;
    }

    const unsubscribe = subscribeVeltoRedirectReady(() => {
      tryRedirect();
    });

    checkoutDraftStore.hydrate();
    cartStore.hydrate();
    const readyCart = cartStore.getSnapshot();
    if (!resumeOrderId && readyCart.items.length === 0) {
      router.replace("/cart");
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        let orderId: string;

        if (resumeOrderId) {
          const existing = await getOrderById(resumeOrderId);
          if (cancelled) {
            return;
          }
          if (isOrderPaid(existing)) {
            router.replace(
              `/checkout/confirmation?orderId=${encodeURIComponent(existing.id)}`,
            );
            return;
          }
          if (!isOrderAwaitingPayment(existing)) {
            setStatus("failed");
            setError(
              "Cette commande ne peut plus être payée ici. Contacte-nous si tu as été débité.",
            );
            return;
          }
          orderId = existing.id;
        } else {
          const latestDraft = commitCheckoutDraftForPayment(
            checkoutDraftStore.getSnapshot(),
          );
          const latestCart = cartStore.getSnapshot();
          validateCheckoutDraft(latestDraft);

          const order = await getSharedCheckoutOrder(() =>
            createCheckoutSession(latestDraft, latestCart.items),
          );
          if (cancelled) {
            return;
          }
          orderId = order.id;
        }

        /*
         * Le reglement se fait chez Velto : on ouvre la page de l'operateur
         * et le navigateur y va. On ne « simule » rien et on ne suppose aucun
         * succes — le retour se fait par la page de retour, qui attend le
         * webhook.
         *
         * La commande en cours est memorisee avant la redirection : l'adresse de
         * retour de l'operateur est unique pour tous les acheteurs, elle ne
         * peut donc pas porter l'identifiant de la commande.
         */
        const { checkoutUrl } = await getSharedOpenPaymentCheckout(orderId, () =>
          openPaymentCheckout(orderId),
        );
        stageVeltoRedirect(orderId, checkoutUrl);
        rememberPendingPayment(orderId, checkoutUrl);

        /*
         * Le panier est vide seulement au moment de quitter pour Velto : en dev,
         * React peut rejouer l'effet avant la redirection ; vider trop tot
         * renverrait l'acheteur au panier vide.
         */
        if (!resumeOrderId) {
          cartStore.clear();
          checkoutDraftStore.clear();
        }

        if (cancelled) {
          return;
        }

        tryRedirect();
      } catch (runError) {
        if (cancelled) {
          return;
        }
        track(analyticsEvents.paymentFailed, { reason: "checkout_error" });
        if (runError instanceof ValidationError) {
          const hasClientFields = Object.keys(runError.fields).some((key) =>
            [
              "firstName",
              "lastName",
              "email",
              "phone",
              "customer_phone_number",
              "deliveryMethod",
              "shipping",
              "paymentMethod",
            ].includes(key),
          );
          if (hasClientFields) {
            router.replace(checkoutPathForValidationFields(runError.fields));
            return;
          }
          setStatus("failed");
          setError(firstCheckoutValidationMessage(runError.fields));
          return;
        }
        setStatus("failed");
        setError(toUserMessage(runError));
      }
    }

    void run();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router, retryKey, resumeOrderId]);

  function retry() {
    // Une nouvelle tentative doit repartir d'une commande neuve. Rejouer la
    // precedente echouee rapporterait le meme echec, et laisserait l'acheteur
    // sans facture a regler.
    resetSharedCheckoutOrder();
    setStatus("processing");
    setError(null);
    setRetryKey((value) => value + 1);
  }

  /*
   * Seul le moyen de paiement est reellement transmis a l'API. L'operateur
   * mobile saisi au checkout ne l'est pas : Velto propose lui-meme le choix
   * du reseau sur sa page, donc l'afficher ici laisserait croire a un choix
   * deja transmis que l'on aurait enregistre.
   */
  const methodLabel =
    draft.paymentMethod === "card" ? "Carte bancaire" : "Mobile Money";

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
              href="/checkout/information"
              className="text-center text-sm text-tdev-yellow"
            >
              Revenir aux coordonnées
            </Link>
          </div>
        ) : (
          <article className="motion-scale-in relative z-10 flex w-full max-w-[580px] flex-col items-center border-2 border-[#33383a] bg-tdev-anthracite px-6 py-10 shadow-[8px_8px_0_#fee800] lg:px-[50px] lg:py-12">
            <div className="relative mb-8 flex size-[112px] items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-tdev-yellow" />
              <span className="absolute inset-2 rounded-full border-2 border-[#2c3133]" />
              <span className="flex size-14 items-center justify-center rounded-full bg-tdev-blue">
                <CreditCardIcon className="size-6 text-tdev-white" />
              </span>
            </div>

            <h1 className="text-center font-headline text-3xl font-extrabold uppercase leading-none tracking-[-1.2px] lg:text-5xl">
              Redirection
              <br />
              en cours
            </h1>
            <p className="mt-6 max-w-[448px] text-center text-sm leading-relaxed text-[#b5b5b5] lg:text-base">
              Nous te redirigeons vers{" "}
              <span className="font-bold text-tdev-white">Velto</span> pour
              valider ton reglement de{" "}
              <span className="font-bold text-tdev-orange">
                {formatMoney(cart.subtotal)}
              </span>
              . Tu seras ramene ici juste apres.
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
                  Moyen de paiement
                </dt>
                <dd className="text-xs font-semibold">{methodLabel}</dd>
              </div>
              <div className="h-px bg-[#33383a]" />
              <div className="flex items-center justify-between">
                <dt className="text-xs font-semibold uppercase tracking-[0.6px] text-[#8a8f91]">
                  Statut actuel
                </dt>
                <dd className="flex items-center gap-1.5 text-xs font-bold text-tdev-yellow">
                  <span className="size-2 bg-tdev-yellow" />
                  Ouverture de la page de reglement
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
              Ne ferme pas cette page : tu vas être redirigé chez Velto
            </p>

            <div className="mt-6 flex w-full items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs text-[#8a8f91]">
                <ShieldIcon className="size-4 text-tdev-green" />
                Reglement chez Velto, aucun numero de carte ici
              </p>
              <button
                type="button"
                onClick={retry}
                className="text-xs font-semibold text-tdev-yellow"
              >
                Reprendre
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
