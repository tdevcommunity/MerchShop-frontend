"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { awaitPaymentOutcome } from "@/features/payment/services/payment-flow";
import {
  clearCartBackup,
  clearPendingPayment,
  isPendingPaymentStale,
  readPendingPayment,
  restoreCart,
} from "@/features/payment/store/pending-payment";
import { cartStore } from "@/features/cart/store/cart-store";
import { getOrderGuestToken } from "@/lib/api/order-token";

type State =
  | { phase: "waiting" }
  | { phase: "failed"; orderId: string; message: string }
  | { phase: "pending"; orderId: string }
  | { phase: "orphan"; message: string };

/**
 * Retour de l'operateur apres tentative de reglement.
 *
 * Cette page ne prouve rien. Elle ne fait que relire la commande en attente et
 * attendre que le webhook FedaPay l'ait fait passer en « payee ». Tant que ce
 * n'est pas arrive, l'interface dit « en cours » — jamais « paye ».
 *
 * FedaPay redirige ici aussi bien apres un succes qu apres un abandon ou un
 * echec : les trois cas se distinguent par l'etat de la commande, jamais par un
 * parametre de l'URL, qui n engaged que l'afficheur a se tromper.
 */
export function PaymentReturnView() {
  const router = useRouter();
  const [state, setState] = useState<State>({ phase: "waiting" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    async function run() {
      const pending = readPendingPayment();

      if (!pending) {
        setState({
          phase: "orphan",
          message:
            "Aucune commande en attente de paiement n'a été trouvée sur cet appareil. Si tu as été débité, contacte-nous avec ta référence de commande.",
        });
        return;
      }

      if (isPendingPaymentStale(pending)) {
        clearPendingPayment();
        setState({
          phase: "orphan",
          message:
            "Cette tentative de paiement est trop ancienne pour être suivie ici. Vérifie le statut de ta commande ou contacte-nous.",
        });
        return;
      }

      /*
       * Le jeton d'invite a pu etre perdu : le navigateur peut avoir efface le
       * stockage, ou l'acheteur avoir change d'onglet. Sans lui, la lecture de
       * sa commande par un tiers est refusee par l'API. C'est ici que se
       * joue l'acces, pas la preuve du paiement.
       */
      if (!getOrderGuestToken(pending.orderId)) {
        clearPendingPayment();
        setState({
          phase: "orphan",
          message:
            "La session de paiement a expiré. Ouvre de nouveau ton email de confirmation ou contacte-nous.",
        });
        return;
      }

      try {
        const outcome = await awaitPaymentOutcome(pending.orderId, 60000);

        if (outcome.state === "paid") {
          clearPendingPayment();
          clearCartBackup();
          router.replace(
            `/checkout/confirmation?orderId=${encodeURIComponent(outcome.order.id)}`,
          );
          return;
        }

        if (outcome.state === "failed") {
          clearPendingPayment();
          /*
           * Restauration du panier en cas d'échec pour permettre à l'utilisateur de réessayer.
           */
          const backedUpCart = restoreCart();
          if (backedUpCart) {
            backedUpCart.forEach((item) => {
              cartStore.addItem(item);
            });
          }
          setState({
            phase: "failed",
            orderId: pending.orderId,
            message:
              "Le paiement n'a pas abouti. Aucun montant n'a été encaissé et tu peux réessayer.",
          });
          return;
        }

        // Le webhook n'est pas encore passe : on ne declare rien.
        setState({ phase: "pending", orderId: pending.orderId });
      } catch {
        setState({
          phase: "pending",
          orderId: pending.orderId,
        });
      }
    }

    void run();
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-tdev-anthracite px-5 py-16">
      <div className="w-full max-w-md">
        {state.phase === "waiting" && (
          <div className="flex flex-col items-center gap-4">
            <Spinner label="Vérification de ton paiement" />
            <p className="text-center text-sm text-[#b5b5b5]">
              Nous attendons la confirmation de l&apos;opérateur. Ne ferme pas
              cette page.
            </p>
          </div>
        )}

        {state.phase === "pending" && (
          <div className="flex flex-col gap-4">
            <Alert title="Paiement en cours de confirmation" tone="info">
              L&apos;opérateur n&apos;a pas encore confirmé le règlement. Ta
              commande est enregistrée et ne sera débitée qu&apos;une seule
              fois : tu peux fermer cette page sans risque.
            </Alert>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push(`/checkout/confirmation?orderId=${encodeURIComponent(state.orderId)}`)}
            >
              Voir ma commande
            </Button>
          </div>
        )}

        {state.phase === "failed" && (
          <div className="flex flex-col gap-4">
            <Alert title="Paiement non abouti" tone="error">
              {state.message}
            </Alert>
            <Button variant="primary" size="lg" onClick={() => router.push("/shop")}>
              Retourner à la boutique
            </Button>
            <Link
              href="/shop"
              className="text-center text-sm text-tdev-yellow"
            >
              Voir le catalogue
            </Link>
          </div>
        )}

        {state.phase === "orphan" && (
          <div className="flex flex-col gap-4">
            <Alert title="Paiement non suivi" tone="info">
              {state.message}
            </Alert>
            <Button variant="primary" size="lg" onClick={() => router.push("/shop")}>
              Retourner à la boutique
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}