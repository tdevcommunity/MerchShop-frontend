import type { Metadata } from "next";
import { PaymentReturnView } from "@/features/checkout/components/payment-return-view";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Retour du paiement",
    path: "/checkout/payment-return",
  }),
  /*
   * Page de transition : ni contenu propre, ni identifiant de commande dans son
   * URL, et surtout rien a faire indexer. Elle existe parce que FedaPay y
   * redirige, parce que `PAYMENT_CALLBACK_URL` la designe cote backend.
   */
  robots: { index: false, follow: false, nocache: true },
};

export default function CheckoutPaymentReturnPage() {
  return <PaymentReturnView />;
}