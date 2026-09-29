import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { buttonClassName } from "@/components/ui/button";

export function EmptyCheckout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-5 lg:max-w-lg">
      <Alert title="Panier vide" tone="info">
        Ajoute des articles avant de lancer le checkout.
      </Alert>
      <Link href="/shop" className={buttonClassName("brand", "lg")}>
        Voir le catalogue
      </Link>
    </div>
  );
}
