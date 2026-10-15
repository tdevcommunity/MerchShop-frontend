import {
  mapLaravelOrderStatus,
  mapLaravelPaymentStatus,
} from "@/lib/api/mappers";
import type { LaravelNumericStatus } from "@/lib/api/types";

/**
 * Traduit une commande de l'API vers la forme lue par le back-office.
 *
 * La conversion des statuts vit ici, une seule fois. L'API expose `status` et
 * `paymentStatus` en entiers : les laisser passer tels quels ferait chercher a
 * l'ecran des chaines (`"paid"`, `"pending"`) dans des nombres, donc afficherait
 * « Inconnu » partout et rendrait `ORDER_TRANSITIONS[status]` indefini — ce qui
 * casse la fiche commande au lieu de simplement mal l'habiller.
 */
export function mapLaravelOrder(order: Record<string, unknown>) {
  const customerName = String(order.customerName ?? "").trim().split(/\s+/);
  const items = Array.isArray(order.items) ? order.items : [];
  const pickupAgent =
    order.pickupAgent && typeof order.pickupAgent === "object"
      ? (order.pickupAgent as { id?: string | null; email?: string | null })
      : null;

  return {
    id: String(order.uuid ?? order.id ?? ""),
    reference: String(order.orderNumber ?? order.reference ?? ""),
    status: mapLaravelOrderStatus(order.status as LaravelNumericStatus),
    items: items.map((rawItem) => {
      const item = rawItem as Record<string, unknown>;
      return {
        productId: String(item.productUuid ?? ""),
        variantId: String(item.variantUuid ?? ""),
        productName: String(item.productName ?? ""),
        variantLabel: String(item.variantName ?? ""),
        size: typeof item.size === "string" ? item.size : null,
        color: typeof item.color === "string" ? item.color : null,
        quantity: Number(item.quantity ?? 0),
        unitPrice: Number(item.unitPrice ?? 0),
      };
    }),
    total: Number(order.total ?? 0),
    paymentStatus: mapLaravelPaymentStatus(
      order.paymentStatus as LaravelNumericStatus | null | undefined,
    ),
    paymentMethod: order.paymentMethod ?? null,
    customer: {
      firstName: customerName[0] ?? "",
      lastName: customerName.slice(1).join(" "),
      email: "",
      phone: String(order.customerPhoneNumber ?? ""),
    },
    deliveryMethod:
      order.fulfillmentMethod === "pickup" ? "pickup_event" : "delivery",
    shippingAddress: order.shippingAddress ?? null,
    pickupLabel: order.pickupStatus ?? null,
    createdAt: String(order.createdAt ?? ""),
    pickupValidatedAt: order.pickupTime ?? null,
    pickupAgentId: pickupAgent?.id ?? null,
    pickupAgentEmail: pickupAgent?.email ?? null,
  };
}
