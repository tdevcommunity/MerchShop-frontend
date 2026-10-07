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

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminRequest("/api/admin/login", {
        method: "POST",
        body: { email, password },
      });
      router.replace(searchParams.get("next") || "/admin/dashboard");
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
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? (
            <p role="alert" className="text-sm text-tdev-orange">
              {error}
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
