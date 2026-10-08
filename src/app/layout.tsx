import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createMetadata } from "@/lib/seo/create-metadata";
import wordmark from "@/publics/tdev-wordmark-BAcPmZ98.png";
import "./globals.css";

export const metadata: Metadata = {
  ...createMetadata(),
  icons: {
    icon: wordmark.src,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
