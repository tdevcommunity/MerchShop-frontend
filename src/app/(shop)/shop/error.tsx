"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function ShopError({ reset }: { reset: () => void }) {
  return (
    <div className="px-5 py-10 lg:px-12">
      <ErrorState
        title="Catalogue indisponible"
        description="Impossible de charger les produits pour le moment."
        onRetry={reset}
      />
    </div>
  );
}
