"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { CreditCardIcon, ShieldIcon } from "@/components/ui/icons";
import { DesktopCheckoutNav } from "@/features/checkout/components/desktop-checkout-nav";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { useCart } from "@/features/cart/hooks/use-cart";
import type { Order } from "@/types/order";
import { useCheckoutDraft } from "@/features/checkout/hooks/use-checkout-draft";
import { createCheckoutSession } from "@/features/checkout/services/checkout-service";
import { cartStore } from "@/features/cart/store/cart-store";
import { checkoutDraftStore } from "@/features/checkout/store/checkout-draft-store";
import { openFedapayCheckout } from "@/features/payment/services/fedapay-service";
import { rememberPendingPayment } from "@/features/payment/store/pending-payment";
import { formatMoney } from "@/lib/utils/format-money";
import { toUserMessage, ValidationError } from "@/lib/api/errors";
import { validateCheckoutDraft } from "@/lib/validation/checkout";

export function PaymentProcessingView() {
  const cart = useCart();
  const draft = useCheckoutDraft();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "failed">("processing");
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const started = useRef(false);

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
  const pendingOrder = useRef<Promise<Order> | null>(null);

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

        pendingOrder.current ??= createCheckoutSession(
          latestDraft,
          latestCart.items,
        );
        const order = await pendingOrder.current;
        if (cancelled) {
          return;
        }

        /*
         * Le panier est vide a partir d'ici : la commande existe, la facturer
         * ne depend plus de lui. Il ne doit surtout pas etre reconstitue si
         * l'acheteur revient en arriere depuis la page de l'operateur, sinon il
         * verrait ses articles toujours disponibles et pourrait en commander
         * une seconde fois.
         */
        cartStore.clear();
        checkoutDraftStore.clear();

        /*
         * Le reglement se fait chez FedaPay : on ouvre la page de l'operateur
         * et le navigateur y va. On ne « simule » rien et on ne suppose aucun
         * succes — le retour se fait par la page de retour, qui attend le
         * webhook.
         *
         * La commande en cours est memorisee avant la redirection : l'adresse de
         * retour de l'operateur est unique pour tous les acheteurs, elle ne
         * peut donc pas porter l'identifiant de la commande.
         */
        const { checkoutUrl } = await openFedapayCheckout(order.id);
        if (cancelled) {
          return;
        }
        rememberPendingPayment(order.id, checkoutUrl);

        track(analyticsEvents.paymentStarted, { orderId: order.id });
        window.location.assign(checkoutUrl);
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
      // Le panier peut avoir ete vide entre-temps : on libere l'etat pour que
      // l'effet puisse rejouer apres une reactivation. La commande en cours,
      // elle, reste memorisee : elle existe deja cote API.
      cancelled = true;
      started.current = cartStore.getSnapshot().items.length === 0;
    };
  }, [router, retryKey]);

  function retry() {
    started.current = false;
    // Une nouvelle tentative doit repartir d'une commande neuve. Rejouer la
    // precedente echouee rapporterait le meme echec, et laisserait l'acheteur
    // sans facture a regler.
    pendingOrder.current = null;
    setStatus("processing");
    setError(null);
    setRetryKey((value) => value + 1);
  }

  /*
   * Seul le moyen de paiement est reellement transmis a l'API. L'operateur
   * mobile saisi au checkout ne l'est pas : FedaPay propose lui-meme le choix
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
              <span className="font-bold text-tdev-white">FedaPay</span> pour
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
              Ne ferme pas cette page : tu vas être redirigé chez FedaPay
            </p>

            <div className="mt-6 flex w-full items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs text-[#8a8f91]">
                <ShieldIcon className="size-4 text-tdev-green" />
                Reglement chez FedaPay, aucun numero de carte ici
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
