import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

import { buttonDanger, buttonGhost, fieldErrorClass } from "./styles";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Hapus",
  busy = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-tertiary p-6 shadow-card"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
            <AlertTriangle size={18} />
          </span>
          <div>
            <h2
              id="confirm-dialog-title"
              className="font-display text-lg font-bold text-white"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm text-secondary">{description}</p>
          </div>
        </div>

        {error && <p className={`${fieldErrorClass} mt-4`}>{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            className={buttonGhost}
            onClick={onCancel}
            disabled={busy}
          >
            Batal
          </button>
          <button
            type="button"
            className={buttonDanger}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Menghapus..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
