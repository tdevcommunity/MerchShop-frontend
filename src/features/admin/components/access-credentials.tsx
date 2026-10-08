import { cn } from "@/lib/utils/cn";
import { ADMIN_ROLE_LABELS, type AdminInviteResult } from "@/types/admin";

/**
 * Les identifiants a transmettre, et une seule fois.
 *
 * Le mot de passe temporaire n'existe en clair que dans la reponse qui vient
 * d'etre recue : ce bloc le montre une fois, nomme son destinataire, et dit
 * comment le transmettre. Il sert a la fois a l'invitation et a la
 * reinitialisation — les deux actions produisent le meme objet, donc le meme
 * panneau, donc la meme consigne.
 */
export function AccessCredentials({
  access,
  className,
}: {
  access: AdminInviteResult;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "border border-tdev-blue bg-[#edf3ff] p-4 text-sm",
        className,
      )}
    >
      <p className="font-extrabold uppercase tracking-[0.08em] text-tdev-blue">
        Identifiants à transmettre
      </p>
      <p className="mt-2">
        {access.user.fullName} ({access.user.email}) ·{" "}
        {ADMIN_ROLE_LABELS[access.user.role]}
      </p>
      <p className="mt-2 font-mono text-base tracking-wide text-tdev-anthracite">
        {access.temporaryPassword}
      </p>
      <p className="mt-2 text-xs text-tdev-muted">
        Affiché une seule fois. Transmets-le hors de cette app (chat / SMS / main
        propre).
      </p>
    </div>
  );
}
