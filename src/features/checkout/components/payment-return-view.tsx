"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { awaitPaymentOutcome } from "@/features/payment/services/payment-flow";
import { syncPaymentReturn } from "@/features/payment/services/sync-payment-return";
import { isOrderPaid, isOrderPaymentFailed } from "@/features/order/utils/order-payment-state";
import {
  clearPendingPayment,
  isPendingPaymentStale,
  readPendingPayment,
  rememberPendingPayment,
} from "@/features/payment/store/pending-payment";
import {
  getOrderGuestToken,
  saveOrderGuestToken,
} from "@/lib/api/order-token";
import {
  failureMessageForReturn,
  isOperatorPaymentAbandoned,
  isOperatorReturnWithoutSuccess,
  operatorReturnStatus,
  PAYMENT_ABANDONED_MESSAGE,
  PAYMENT_NOT_COMPLETED_MESSAGE,
  shouldFastPaymentFollowUp,
} from "@/features/checkout/utils/payment-return-params";
import { ApiError, toUserMessage } from "@/lib/api/errors";

type State =
  | { phase: "waiting" }
  | { phase: "failed"; orderId: string; message: string }
  | { phase: "pending"; orderId: string; hint?: string }
  | { phase: "orphan"; message: string };

function showPaymentFailed(orderId: string, message: string): State {
  return { phase: "failed", orderId, message };
}

function persistGuestTokenFromReturnUrl(searchParams: URLSearchParams): void {
  const orderId = searchParams.get("orderId")?.trim() ?? "";
  const token =
    searchParams.get("orderToken")?.trim() ??
    searchParams.get("order_token")?.trim() ??
    "";

  if (orderId !== "" && token !== "") {
    saveOrderGuestToken(orderId, token);
  }
}

function resolveTrackedOrderId(
  searchParams: URLSearchParams,
): { orderId: string } | { error: string } {
  persistGuestTokenFromReturnUrl(searchParams);

  const pending = readPendingPayment();
  const queryOrderId = searchParams.get("orderId")?.trim() ?? "";

  if (pending && !isPendingPaymentStale(pending)) {
    return { orderId: pending.orderId };
  }

  if (pending && isPendingPaymentStale(pending)) {
    clearPendingPayment();
  }

  if (queryOrderId !== "" && getOrderGuestToken(queryOrderId)) {
    rememberPendingPayment(queryOrderId);
    return { orderId: queryOrderId };
  }

  if (queryOrderId !== "") {
    return {
      error:
        "La session de paiement a expiré. Ouvre de nouveau ton email de confirmation ou contacte-nous.",
    };
  }

  return {
    error:
      "Aucune commande en attente de paiement n'a été trouvée sur cet appareil. Si tu as été débité, contacte-nous avec ta référence de commande.",
  };
}

async function followUpUntilPaid(
  orderId: string,
  router: { replace: (href: string) => void },
  fast: boolean,
  onUnresolved: (message: string, failed: boolean) => void,
) {
  const outcome = await awaitPaymentOutcome(orderId, 120_000, { fast });
  if (outcome.state === "paid") {
    clearPendingPayment();
    router.replace(
      `/checkout/confirmation?orderId=${encodeURIComponent(outcome.order.id)}`,
    );
    return;
  }
  if (outcome.state === "failed") {
    clearPendingPayment();
    onUnresolved(
      "Le paiement n'a pas abouti. Aucun montant n'a été encaissé et tu peux réessayer.",
      true,
    );
    return;
  }
  onUnresolved(
    "La confirmation prend plus de temps que prévu. Tu peux réessayer le paiement ou nous contacter si tu as été débité.",
    false,
  );
}

/**
 * Retour de l'operateur apres tentative de reglement.
 *
 * Cette page ne prouve rien. Elle ne fait que relire la commande en attente et
 * attendre que le webhook Velto l'ait fait passer en « payee ». Tant que ce
 * n'est pas arrive, l'interface dit « en cours » — jamais « paye ».
 */
export function PaymentReturnView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>({ phase: "waiting" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    async function run() {
      const resolved = resolveTrackedOrderId(searchParams);
      if ("error" in resolved) {
        setState({ phase: "orphan", message: resolved.error });
        return;
      }

      const orderId = resolved.orderId;

      if (!getOrderGuestToken(orderId)) {
        clearPendingPayment();
        setState({
          phase: "orphan",
          message:
            "La session de paiement a expiré. Ouvre de nouveau ton email de confirmation ou contacte-nous.",
        });
        return;
      }

      const returnStatus = operatorReturnStatus(searchParams);
      const abandoned = isOperatorPaymentAbandoned(searchParams);
      const exitedWithoutSuccess = isOperatorReturnWithoutSuccess(searchParams);
      const transactionId =
        searchParams.get("transaction_id") ??
        searchParams.get("transactionId") ??
        "";
      const fastFollowUp = shouldFastPaymentFollowUp(returnStatus, abandoned);
      let syncHint: string | undefined;

      const genericFailureMessage =
        "Le paiement n'a pas abouti. Aucun montant n'a été encaissé et tu peux réessayer.";

      try {
        if (transactionId.trim() !== "") {
          try {
            const synced = await syncPaymentReturn(
              orderId,
              transactionId.trim(),
            );
            if (isOrderPaid(synced)) {
              clearPendingPayment();
              router.replace(
                `/checkout/confirmation?orderId=${encodeURIComponent(synced.id)}`,
              );
              return;
            }
            if (isOrderPaymentFailed(synced)) {
              clearPendingPayment();
              setState(
                showPaymentFailed(
                  orderId,
                  failureMessageForReturn(searchParams, genericFailureMessage),
                ),
              );
              return;
            }
            if (exitedWithoutSuccess) {
              clearPendingPayment();
              setState(
                showPaymentFailed(
                  orderId,
                  failureMessageForReturn(searchParams, genericFailureMessage),
                ),
              );
              return;
            }
          } catch (syncError) {
            if (syncError instanceof ApiError && syncError.status === 403) {
              setState({
                phase: "orphan",
                message: toUserMessage(syncError),
              });
              return;
            }
            syncHint = toUserMessage(syncError);
            if (exitedWithoutSuccess) {
              clearPendingPayment();
              setState(
                showPaymentFailed(
                  orderId,
                  failureMessageForReturn(searchParams, genericFailureMessage),
                ),
              );
              return;
            }
          }
        } else if (exitedWithoutSuccess) {
          clearPendingPayment();
          setState(
            showPaymentFailed(
              orderId,
              failureMessageForReturn(searchParams, genericFailureMessage),
            ),
          );
          return;
        }

        const pollMs = returnStatus === "approved" ? 20_000 : 8_000;
        const outcome = await awaitPaymentOutcome(orderId, pollMs, {
          fast: fastFollowUp,
        });

        if (outcome.state === "paid") {
          clearPendingPayment();
          router.replace(
            `/checkout/confirmation?orderId=${encodeURIComponent(outcome.order.id)}`,
          );
          return;
        }

        if (outcome.state === "failed") {
          clearPendingPayment();
          setState(
            showPaymentFailed(
              orderId,
              failureMessageForReturn(searchParams, genericFailureMessage),
            ),
          );
          return;
        }

        if (exitedWithoutSuccess) {
          clearPendingPayment();
          setState(
            showPaymentFailed(
              orderId,
              failureMessageForReturn(searchParams, genericFailureMessage),
            ),
          );
          return;
        }

        setState({ phase: "pending", orderId, hint: syncHint });
        void followUpUntilPaid(orderId, router, fastFollowUp, (message, failed) => {
          if (failed) {
            setState({ phase: "failed", orderId, message });
            return;
          }
          setState({ phase: "pending", orderId, hint: message });
        });
      } catch {
        setState({ phase: "pending", orderId, hint: syncHint });
        void followUpUntilPaid(orderId, router, fastFollowUp, (message, failed) => {
          if (failed) {
            setState({ phase: "failed", orderId, message });
            return;
          }
          setState({ phase: "pending", orderId, hint: message });
        });
      }
    }

    void run();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-tdev-anthracite px-5 py-16">
      <div className="w-full max-w-md">
        {state.phase === "waiting" && (
          <div className="flex flex-col items-center gap-4">
            <Spinner label="Vérification de ton paiement" />
            <p className="text-center text-sm text-[#b5b5b5]">
              Nous vérifions que ton paiement est bien enregistré. Cela prend en
              général quelques secondes.
            </p>
          </div>
        )}

        {state.phase === "pending" && (
          <div className="flex flex-col gap-4">
            <Alert title="Paiement en cours de confirmation" tone="info">
              {state.hint ??
                "Nous n'avons pas encore reçu la confirmation de ton paiement. Ta commande est enregistrée et ne sera débitée qu'une seule fois : tu peux fermer cette page sans risque."}
            </Alert>
            <Button
              variant="primary"
              size="lg"
              onClick={() =>
                router.push(
                  `/checkout/processing?orderId=${encodeURIComponent(state.orderId)}`,
                )
              }
            >
              Reprendre le paiement
            </Button>
            <p className="text-center text-xs text-[#8a8f91]">
              La page de confirmation s&apos;affichera dès que ton paiement sera
              validé.
            </p>
          </div>
        )}

        {state.phase === "failed" && (
          <div className="flex flex-col gap-4">
            <Alert
              title={
                state.message === PAYMENT_ABANDONED_MESSAGE
                  ? "Paiement annulé"
                  : state.message === PAYMENT_NOT_COMPLETED_MESSAGE
                    ? "Paiement non finalisé"
                    : "Paiement non abouti"
              }
              tone="error"
            >
              {state.message}
            </Alert>
            <Button
              variant="primary"
              size="lg"
              onClick={() =>
                router.push(
                  `/checkout/processing?orderId=${encodeURIComponent(state.orderId)}`,
                )
              }
            >
              Reprendre le paiement
            </Button>
            <Link
              href="/shop"
              className="text-center text-sm text-tdev-yellow"
            >
              Retourner à la boutique
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
