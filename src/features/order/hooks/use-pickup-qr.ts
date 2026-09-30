"use client";

import { useEffect, useState } from "react";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { getPickupQr } from "@/features/qr/services/qr-service";
import { toUserMessage } from "@/lib/api/errors";
import type { PickupQr } from "@/types/qr";

export function usePickupQr(orderId: string) {
  const [qr, setQr] = useState<PickupQr | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadQr() {
      try {
        const nextQr = await getPickupQr(orderId);
        if (!cancelled) {
          setQr(nextQr);
          track(analyticsEvents.qrDisplayed, { orderId });
        }
      } catch (loadError) {
        if (!cancelled) {
          setQrError(toUserMessage(loadError));
        }
      }
    }
    void loadQr();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return { qr, qrError };
}
