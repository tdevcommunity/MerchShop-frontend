import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-3 border border-dashed border-tdev-anthracite bg-tdev-surface p-6">
      <h2 className="font-headline text-xl text-tdev-anthracite">{title}</h2>
      <p className="text-sm text-tdev-muted">{description}</p>
      {action}
    </div>
  );
}
