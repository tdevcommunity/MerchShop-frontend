"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

type AdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function AdminModal({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: AdminModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-tdev-anthracite/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className={cn(
          "relative z-10 flex max-h-[92dvh] w-full max-w-4xl flex-col border border-tdev-anthracite bg-tdev-white shadow-[8px_8px_0_#155dfc]",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-tdev-border px-5 py-4">
          <div>
            <h2
              id="admin-modal-title"
              className="font-headline text-xl font-extrabold uppercase tracking-tight"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-tdev-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-9 border border-tdev-anthracite px-3 text-[11px] font-extrabold uppercase tracking-[0.08em] hover:bg-tdev-surface"
          >
            Fermer
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
