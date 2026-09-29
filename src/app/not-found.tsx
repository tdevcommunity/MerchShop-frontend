import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <div className="px-5 py-16 lg:px-12">
      <EmptyState
        title="Page introuvable"
        description="Cette URL ne correspond à aucune page du Shop."
        action={
          <Link href="/shop" className={buttonClassName("brand")}>
            Retour au catalogue
          </Link>
        }
      />
    </div>
  );
}
