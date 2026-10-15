"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

/** Evite redirect() RSC (bug Performance.measure Turbopack sur cette route). */
export function CheckoutIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/checkout/fulfillment");
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-tdev-anthracite">
      <Spinner label="Ouverture du checkout" />
    </div>
  );
}
