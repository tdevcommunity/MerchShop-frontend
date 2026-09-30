import type { ReactNode } from "react";
import { AdminShell } from "@/features/admin/components/admin-shell";

export default function AdminConsoleLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
