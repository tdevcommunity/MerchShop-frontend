import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function ProductNotFound() {
  return (
    <div className="px-5 py-16 lg:px-12">
      <EmptyState
        title="Produit introuvable"
        description="Cet article n'existe pas ou n'est plus au catalogue."
        action={
          <Link href="/shop" className={buttonClassName("brand")}>
            Retour au catalogue
          </Link>
        }
      />
    </div>
  );
}
