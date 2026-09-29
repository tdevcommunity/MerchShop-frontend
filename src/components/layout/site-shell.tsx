import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-tdev-black text-tdev-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
