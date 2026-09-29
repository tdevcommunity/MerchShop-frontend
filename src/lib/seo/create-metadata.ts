import type { Metadata } from "next";
import { env } from "@/lib/config/env";
import { siteConfig } from "@/lib/config/site";

type CreateMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
};

export function createMetadata({
  title,
  description = siteConfig.description,
  path = "/",
}: CreateMetadataInput = {}): Metadata {
  const pageTitle = title
    ? `${title} · ${siteConfig.shortName}`
    : `${siteConfig.name} · ${siteConfig.festival}`;
  const url = `${env.siteUrl}${path}`;

  return {
    title: pageTitle,
    description,
    metadataBase: new URL(env.siteUrl),
    alternates: { canonical: path },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: "fr_FR",
      type: "website",
    },
  };
}
