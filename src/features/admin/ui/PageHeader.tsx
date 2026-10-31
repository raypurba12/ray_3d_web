import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export const PageHeader = ({
  eyebrow = "CMS",
  title,
  description,
  action,
}: PageHeaderProps) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-acid">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-secondary">{description}</p>
      )}
    </div>
    {action}
  </div>
);
