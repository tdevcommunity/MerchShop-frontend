"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { cartNoticeStore, type CartNotice } from "@/features/cart/notices";

const VISIBLE_MS = 7000;

export function CartNotices() {
  const notices = useSyncExternalStore(
    cartNoticeStore.subscribe,
    cartNoticeStore.getSnapshot,
    cartNoticeStore.getServerSnapshot,
  );

  if (notices.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(100%-2rem,24rem)] flex-col gap-3"
      aria-live="polite"
      aria-relevant="additions"
    >
      {notices.map((notice) => (
        <CartNoticeCard key={notice.id} notice={notice} />
      ))}
    </div>
  );
}

function CartNoticeCard({ notice }: { notice: CartNotice }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      cartNoticeStore.dismiss(notice.id);
    }, VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [notice.id]);

  return (
    <article className="motion-fade pointer-events-auto border-2 border-tdev-anthracite bg-tdev-white shadow-[4px_4px_0_0_#111]">
      <div className="flex items-start gap-3 border-l-4 border-tdev-yellow px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{notice.title}</p>
          {notice.detail ? (
            <p className="mt-1 text-sm text-tdev-muted">{notice.detail}</p>
          ) : null}
          {notice.hint ? (
            <p className="mt-2 text-sm">{notice.hint}</p>
          ) : null}
          {notice.href && notice.actionLabel ? (
            <Link
              href={notice.href}
              className="mt-3 inline-flex min-h-10 items-center bg-tdev-anthracite px-3 text-sm font-semibold text-tdev-white"
              onClick={() => cartNoticeStore.dismiss(notice.id)}
            >
              {notice.actionLabel}
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          className="flex size-8 shrink-0 items-center justify-center"
          onClick={() => cartNoticeStore.dismiss(notice.id)}
        >
          <CloseIcon className="size-4" />
          <span className="sr-only">Fermer</span>
        </button>
      </div>
    </article>
  );
}
