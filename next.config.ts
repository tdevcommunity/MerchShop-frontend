import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  images: {
    remotePatterns: [
      // Hosts d'images produits (Cloudinary / S3) à ajouter quand le backend est figé.
    ],
  },
};

export default nextConfig;
