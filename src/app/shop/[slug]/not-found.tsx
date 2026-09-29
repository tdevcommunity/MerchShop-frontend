import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function ProductNotFound() {
  return (
    <EmptyState
      title="Produit introuvable"
      description="Cet article n'existe pas ou n'est plus au catalogue."
      action={
        <Link href="/shop" className={buttonClassName()}>
          Retour au catalogue
        </Link>
      }
    />
  );
}
