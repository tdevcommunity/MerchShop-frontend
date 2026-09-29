"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Une erreur est survenue"
      description="Le Shop a rencontré un problème inattendu."
      onRetry={reset}
    />
  );
}
