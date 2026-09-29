import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { useMockApi } from "@/lib/config/env";
import type { PickupQr } from "@/types/qr";
import { getMockPickupQr } from "@/features/order/services/order-mock";

export async function getPickupQr(orderId: string): Promise<PickupQr> {
  if (useMockApi) {
    return (
      getMockPickupQr(orderId) ?? {
        orderId,
        status: "unavailable",
        imageUrl: null,
        alt: "QR de retrait indisponible",
      }
    );
  }

  return apiRequest<PickupQr>(apiEndpoints.pickupQr(orderId));
}
