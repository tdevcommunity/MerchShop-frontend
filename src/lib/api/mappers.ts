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
import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "@/types/payment";
import type {
  LaravelCategory,
  LaravelNumericStatus,
  LaravelOrder,
  LaravelOrderItem,
  LaravelPayment,
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

/**
 * Normalise un statut numerique venu de l'API.
 *
 * L'API melange deux representations pour le meme enum : `status` est expose
 * en entier, mais `paymentStatus` transite par une closure typee `?string` qui
 * le convertit en chaine. Comparer directement avec `case 1:` echouerait donc
 * sur la seconde forme et retomberait sur `unknown` ou `awaiting_payment`.
 */
function numericStatus(value: LaravelNumericStatus | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapLaravelOrderStatus(status: LaravelNumericStatus): OrderStatus {
  switch (numericStatus(status)) {
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
    case 7:
      // Remboursement demande, argent pas encore sorti : l'API expose cet
      // etat intermediaire, le confondre avec `refunded` annoncerait une
      // sortie qui n'a pas eu lieu.
      return "refund_pending";
    default:
      return "awaiting_payment";
  }
}

export function mapLaravelPaymentStatus(
  status: LaravelNumericStatus | null | undefined,
): PaymentStatus {
  switch (numericStatus(status)) {
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

/**
 * Mappe une tentative de paiement FedaPay vers le modele de domaine.
 *
 * `checkoutUrl` n'est pas porte par `Payment` : c'est une adresse de passage,
 * pas un etat. Elle se lit une fois, au moment ou l'on redirige le navigateur
 * chez l'operateur, et la relire ensuite n'aurait aucun sens.
 */
export function mapLaravelPaymentToPayment(payment: LaravelPayment): Payment {
  return {
    id: payment.uuid,
    orderId: payment.orderId ?? "",
    status: mapLaravelPaymentStatus(payment.status),
    method: (payment.method as PaymentMethod) || null,
    amount: payment.amount,
    providerRef: payment.transactionId,
  };
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

const EMPTY_CUSTOMER: CustomerInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

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
    /*
     * L'API n'expose pas l'identite de l'acheteur sur une commande : elle
     * n'est lue que par l'API, qui s'en sert pour le paiement et la livraison.
     * On restitue donc ce que l'acheteur a lui-meme saisi au checkout, mis en
     * cache a la creation, et rien d'autre. Inventer un nom, une adresse ni un
     * numero ferait afficher a l'acheteur une fausse commande comme si elle
     * etait la sienne ; vide vaut mieux qu'invente.
     */
    customer: cachedCustomer ?? EMPTY_CUSTOMER,
    deliveryMethod,
    shippingAddress: parseShippingAddress(order.shippingAddress),
    pickupLabel:
      deliveryMethod === "pickup_event"
        ? "Retrait au stand merch (Festival TDEV 2026)"
        : null,
    createdAt: order.createdAt,
  };
}
