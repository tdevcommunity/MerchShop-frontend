import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { createMetadata } from "@/lib/seo/create-metadata";
import "./globals.css";

export const metadata: Metadata = createMetadata();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        {/* Statistiques de visite (Umami, auto-heberge, sans cookies). data-domains : rien n'est compte en local. */}
        <Script
          src="https://admin-stats.ourtdev.com/script.js"
          data-website-id="e929b47e-8100-4aac-bb4b-5f97fa2042ad"
          data-domains="shop.ourtdev.com"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
