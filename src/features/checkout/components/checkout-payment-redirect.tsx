"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/features/cart/hooks/use-cart";
import { beginVeltoCheckoutPipeline } from "@/features/checkout/utils/checkout-processing-session";
import { prepareCheckoutForVeltoPayment } from "@/features/checkout/utils/prepare-velto-payment";

/** Ancienne etape paiement : redirige vers l'ouverture Velto. */
export function CheckoutPaymentRedirect() {
  const router = useRouter();
  const cart = useCart();

  useEffect(() => {
    const draft = prepareCheckoutForVeltoPayment();
    beginVeltoCheckoutPipeline(draft, cart.items);
    router.replace("/checkout/processing");
  }, [router, cart.items]);

  return (
    <div className="flex min-h-40 items-center justify-center">
      <Spinner label="Redirection vers le paiement" />
    </div>
  );
}
