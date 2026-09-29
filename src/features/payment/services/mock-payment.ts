import type { PaymentStatus } from "@/types/payment";

const MOCK_DELAY_MS = 1600;

/**
 * Simule un traitement de paiement. Aucun provider, aucun secret.
 * `fail=true` permet de tester l'état d'erreur du parcours.
 */
export async function simulateMockPayment(fail = false): Promise<PaymentStatus> {
  await new Promise((resolve) => {
    setTimeout(resolve, MOCK_DELAY_MS);
  });
  return fail ? "failed" : "success";
}
