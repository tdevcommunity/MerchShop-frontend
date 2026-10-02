import type {
  Category,
  Product,
  ProductVariant,
  TextileSize,
} from "@/types/catalog";
import { TEXTILE_SIZES } from "@/types/catalog";
import type { CustomerInfo } from "@/types/checkout";
import type { DeliveryMethod, ShippingAddress } from "@/types/delivery";
import type { Order, OrderItem, OrderStatus } from "@/types/order";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";
import type {
  LaravelCategory,
  LaravelOrder,
  LaravelOrderItem,
  LaravelProduct,
  LaravelVariant,
} from "@/lib/api/types";

export function mapLaravelCategoryToCategory(
  category: LaravelCategory,
): Category {
  return {
    slug: category.slug,
    label: category.name,
  };
}

export function mapLaravelVariantToProductVariant(
  variant: LaravelVariant,
  productId: string,
): ProductVariant {
  const isTextileSize =
    variant.size && (TEXTILE_SIZES as readonly string[]).includes(variant.size);

  return {
    id: variant.uuid,
    productId,
    size: isTextileSize ? (variant.size as TextileSize) : null,
    color: variant.color,
    sku: variant.sku,
    stockQuantity: variant.stock,
    unitPrice: variant.price,
  };
}

export function mapLaravelProductToProduct(product: LaravelProduct): Product {
  const variants = (product.variants || []).map((v) =>
    mapLaravelVariantToProductVariant(v, product.uuid),
  );

  return {
    id: product.uuid,
    slug: product.slug,
    name: product.name,
    description: product.description || "",
    category: product.category?.slug || "",
    categoryLabel: product.category?.name,
    imageUrl: product.imageUrl,
    badge: null,
    variants,
  };
}

export function mapLaravelOrderStatus(status: number): OrderStatus {
  switch (status) {
    case 1:
      return "awaiting_payment";
    case 2:
      return "paid";
    case 3:
      return "ready_for_pickup";
    case 4:
      return "picked_up";
    case 5:
      return "cancelled";
    case 6:
      return "refunded";
    default:
      return "awaiting_payment";
  }
}

export function mapLaravelPaymentStatus(status: number): PaymentStatus {
  switch (status) {
    case 1:
      return "pending";
    case 2:
      return "success";
    case 3:
      return "failed";
    case 4:
      return "refunded";
    default:
      return "unknown";
  }
}

export function parseShippingAddress(
  raw: string | null | undefined,
): ShippingAddress | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && "line1" in parsed) {
      return parsed as ShippingAddress;
    }
  } catch {
    // not JSON
  }
  return {
    line1: raw,
    city: "Lomé",
    country: "Togo",
    source: "manual",
  };
}

export function formatShippingAddress(
  address: ShippingAddress | null | undefined,
): string | null {
  if (!address) {
    return null;
  }
  return `${address.line1}${address.line2 ? `, ${address.line2}` : ""}, ${address.city}, ${address.country}`;
}

export function mapLaravelOrderItemToOrderItem(
  item: LaravelOrderItem,
): OrderItem {
  const isTextileSize =
    item.size && (TEXTILE_SIZES as readonly string[]).includes(item.size);

  return {
    productId: item.productUuid || item.uuid,
    variantId: item.variantUuid || item.uuid,
    productName: item.productName,
    variantLabel: item.variantName || item.productName,
    size: isTextileSize ? (item.size as TextileSize) : null,
    color: item.color ?? null,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  };
}

export function mapLaravelOrderToOrder(
  order: LaravelOrder,
  cachedCustomer?: CustomerInfo | null,
): Order {
  const deliveryMethod: DeliveryMethod =
    order.fulfillmentMethod === "pickup" ? "pickup_event" : "delivery";

  return {
    id: order.uuid,
    reference: order.orderNumber,
    status: mapLaravelOrderStatus(order.status),
    items: (order.items || []).map(mapLaravelOrderItemToOrderItem),
    total: order.total,
    paymentStatus: mapLaravelPaymentStatus(order.paymentStatus),
    paymentMethod: (order.paymentMethod as PaymentMethod) || null,
    customer: cachedCustomer || {
      firstName: "Participant",
      lastName: "TDEV",
      email: "contact@tdev.bj",
      phone: "+228 00 00 00 00",
    },
    deliveryMethod,
    shippingAddress: parseShippingAddress(order.shippingAddress),
    pickupLabel:
      deliveryMethod === "pickup_event"
        ? "Retrait au stand merch (Festival TDEV 2026)"
        : null,
    createdAt: order.createdAt,
  };
}
