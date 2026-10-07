"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="px-5 py-10 lg:px-12">
      <ErrorState
        title="Une erreur est survenue"
        description="Le Shop a rencontré un problème inattendu."
        onRetry={reset}
      />
    </div>
  );
}
