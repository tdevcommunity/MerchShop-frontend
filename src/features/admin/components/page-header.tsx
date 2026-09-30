import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-headline text-3xl font-extrabold uppercase">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-tdev-muted">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
