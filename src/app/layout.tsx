import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { createMetadata } from "@/lib/seo/create-metadata";
import "./globals.css";

export const metadata: Metadata = createMetadata();

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
