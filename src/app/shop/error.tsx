"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function ShopError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="Catalogue indisponible"
      description="Impossible de charger les produits pour le moment."
      onRetry={reset}
    />
  );
}
