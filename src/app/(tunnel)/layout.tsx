import type { ReactNode } from "react";

export default function TunnelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-tdev-white text-tdev-anthracite">{children}</div>
  );
}
