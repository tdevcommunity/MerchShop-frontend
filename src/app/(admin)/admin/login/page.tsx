"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminRequest } from "@/features/admin/services/admin-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealPassword, setRevealPassword] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSucceeded(false);
    try {
      await adminRequest("/api/admin/login", {
        method: "POST",
        body: { email, password },
      });
      /*
       * Le message precede la redirection, qui n'est pas instantanee : sans lui,
       * une connexion reussie ne laisse aucune trace a l'ecran et donne
       * l'impression que le bouton n'a rien fait.
       */
      setSucceeded(true);
       const requestedNext = searchParams.get("next");
       const next =
         requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
           ? requestedNext
           : "/admin/dashboard";
       router.replace(next);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Connexion impossible.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-tdev-anthracite px-5">
      <form
        onSubmit={submit}
        aria-busy={loading}
        className="w-full max-w-md border border-[#33383a] bg-tdev-white p-5 shadow-[8px_8px_0_#155dfc] sm:p-8"
      >
        <BrandMark />
        <h1 className="mt-6 font-headline text-3xl font-extrabold uppercase">
          Back Office
        </h1>
        <p className="mt-2 text-sm text-tdev-muted">
          Accès réservé à l&apos;équipe organisatrice du TDEV Festival.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <Input
            name="email"
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            name="password"
            label="Mot de passe"
            type={revealPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error ?? undefined}
            trailing={
              <button
                type="button"
                onClick={() => setRevealPassword((visible) => !visible)}
                aria-pressed={revealPassword}
                aria-label={
                  revealPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                }
                className="min-h-11 px-2 text-xs font-extrabold uppercase tracking-[0.08em] text-tdev-muted hover:text-tdev-anthracite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tdev-blue"
              >
                {revealPassword ? "Masquer" : "Voir"}
              </button>
            }
          />
          {succeeded ? (
            <p role="status" className="text-sm font-bold text-tdev-blue">
              Connexion réussie — redirection…
            </p>
          ) : null}
          <Button type="submit" variant="brand" size="lg" disabled={loading}>
            {loading ? "Connexion…" : "Entrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
