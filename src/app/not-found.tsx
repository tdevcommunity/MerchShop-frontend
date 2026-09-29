import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      title="Page introuvable"
      description="Cette URL ne correspond à aucune page du Shop."
      action={
        <Link href="/shop" className={buttonClassName()}>
          Retour au catalogue
        </Link>
      }
    />
  );
}
