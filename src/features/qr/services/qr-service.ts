import { apiRequestRaw } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { useMockApi } from "@/lib/config/env";
import type { PickupQr } from "@/types/qr";
import { getMockPickupQr } from "@/features/order/services/order-mock";
import {
  cachePickupQr,
  readCachedPickupQr,
} from "@/features/order/store/order-cache";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

export async function getPickupQr(orderId: string): Promise<PickupQr> {
  if (useMockApi) {
    return (
      (await getMockPickupQr(orderId)) ?? {
        orderId,
        status: "unavailable",
        imageUrl: null,
        alt: "QR de retrait indisponible",
      }
    );
  }

  const cached = readCachedPickupQr(orderId);
  if (cached?.imageUrl) {
    return cached;
  }

  try {
    const response = await apiRequestRaw(apiEndpoints.pickupQr(orderId), {
      headers: {
        Accept: "image/png, application/json",
      },
    });

    if (!response.ok) {
      return {
        orderId,
        status: "unavailable",
        imageUrl: null,
        alt: "QR de retrait indisponible",
      };
    }

    const contentType = response.headers.get("content-type") || "";

    let imageUrl: string;
    if (contentType.includes("application/json")) {
      const json = (await response.json()) as {
        imageUrl?: string;
        data?: { imageUrl?: string };
      };
      imageUrl = json.imageUrl || json.data?.imageUrl || "";
    } else {
      // Binary PNG
      const buffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);
      imageUrl = `data:image/png;base64,${base64}`;
    }

    const qr: PickupQr = {
      orderId,
      status: imageUrl ? "ready" : "unavailable",
      imageUrl: imageUrl || null,
      alt: `Pass QR de retrait — Commande ${orderId}`,
    };

    if (qr.imageUrl) {
      cachePickupQr(qr);
    }

    return qr;
  } catch {
    return {
      orderId,
      status: "unavailable",
      imageUrl: null,
      alt: "QR de retrait indisponible",
    };
  }
}
