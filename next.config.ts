import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serveur Node autonome (.next/standalone) pour l'image Docker de production.
  output: "standalone",
  agentRules: false,
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
