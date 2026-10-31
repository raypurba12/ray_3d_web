import type { ReactNode } from "react";

import { buttonGhost, panelClass } from "./styles";

export const ListSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="mt-8 space-y-4">
    {Array.from({ length: rows }, (_, index) => (
      <div
        key={index}
        className="h-28 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]"
      />
    ))}
  </div>
);

export const ListError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className={`${panelClass} mt-8 p-6 text-center`}>
    <p className="text-sm text-red-300">{message}</p>
    <button type="button" className={`${buttonGhost} mt-4`} onClick={onRetry}>
      Coba lagi
    </button>
  </div>
);

export const ListEmpty = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className={`${panelClass} mt-8 p-10 text-center`}>
    <p className="font-display text-lg font-bold text-white">{title}</p>
    <p className="mt-2 text-sm text-secondary">{description}</p>
    {action && <div className="mt-6 flex justify-center">{action}</div>}
  </div>
);
