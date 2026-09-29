import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-white/15 p-6">
      <h2 className="font-headline text-xl text-tdev-white">{title}</h2>
      <p className="text-sm text-white/70">{description}</p>
      {action}
    </div>
  );
}
