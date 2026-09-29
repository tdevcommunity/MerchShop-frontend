"use client";

import { useEffect, useState } from "react";
import { getOrderById } from "@/features/order/services/order-service";
import { isNotFoundError, toUserMessage } from "@/lib/api/errors";
import type { Order } from "@/types/order";

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const nextOrder = await getOrderById(orderId);
        if (!cancelled) {
          setOrder(nextOrder);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        if (isNotFoundError(loadError)) {
          setNotFound(true);
        } else {
          setError(toUserMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return { order, error, notFound, isLoading };
}
