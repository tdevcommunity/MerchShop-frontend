import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="motion-scale-in flex flex-col items-start gap-3 border border-dashed border-tdev-anthracite bg-tdev-surface p-6">
      <h2 className="motion-enter font-headline text-xl text-tdev-anthracite">
        {title}
      </h2>
      <p className="motion-enter motion-delay-1 text-sm text-tdev-muted">
        {description}
      </p>
      {action ? <div className="motion-enter motion-delay-2">{action}</div> : null}
    </div>
  );
}
