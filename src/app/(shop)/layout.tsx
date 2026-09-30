import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/site-shell";

export const dynamic = "force-dynamic";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
