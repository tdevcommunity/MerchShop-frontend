import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export function EmptyCart() {
  return (
    <EmptyState
      title="Ton panier est vide"
      description="Parcours le catalogue et ajoute des goodies TDEV pour continuer."
      action={
        <Link href="/shop" className={buttonClassName()}>
          Voir le catalogue
        </Link>
      }
    />
  );
}
