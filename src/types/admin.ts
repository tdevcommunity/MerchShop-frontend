import type { Product, ProductVariant } from "./catalog";
import type { Order, OrderStatus } from "./order";
import type { Payment } from "./payment";
import type { PickupQr } from "./qr";

export const ADMIN_ROLES = ["admin", "staff"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const INVENTORY_REASONS = [
  "reception",
  "correction",
  "damaged",
  "loss",
  "return",
  "inventory",
  "sale",
] as const;
export type InventoryReason = (typeof INVENTORY_REASONS)[number];

export const INVENTORY_LEVELS = [
  "available",
  "low",
  "out",
  "disabled",
] as const;
export type InventoryLevel = (typeof INVENTORY_LEVELS)[number];

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  passwordHash: string;
  active: boolean;
};

export type AdminUserPublic = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
};

export type AdminInviteResult = {
  user: AdminUserPublic;
  temporaryPassword: string;
};

export type AdminSessionUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  admin: "Admin",
  staff: "Staff",
};

export type AdminCategory = {
  id: string;
  slug: string;
  label: string;
  active: boolean;
  sortOrder: number;
};

export type AdminVariant = ProductVariant & {
  reservedQuantity: number;
  soldQuantity: number;
  lowStockThreshold: number;
  active: boolean;
};

export type AdminProduct = Omit<Product, "variants" | "category"> & {
  category: string;
  status: ProductStatus;
  featured: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
  variants: AdminVariant[];
};

export type InventoryLog = {
  id: string;
  createdAt: string;
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  previousStock: number;
  delta: number;
  nextStock: number;
  reason: InventoryReason;
  note: string;
  userId: string;
  userEmail: string;
};

export type AuditLog = {
  id: string;
  createdAt: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue: string | null;
  newValue: string | null;
};

export type AdminNotification = {
  id: string;
  createdAt: string;
  tone: "warning" | "success" | "info";
  message: string;
  read: boolean;
};

export type AdminPayment = Payment & {
  customerName: string;
  createdAt: string;
};

export type AdminOrder = Order & {
  pickupValidatedAt: string | null;
  pickupAgentId: string | null;
  pickupAgentEmail: string | null;
};

export type AdminPickup = {
  order: AdminOrder;
  qr: PickupQr | null;
};

/**
 * Transitions de statut, alignees sur `OrderService::TRANSITIONS` du backend.
 *
 * L'API reste la seule source de verite : `OrderResource` expose
 * `allowedActions` pour chaque commande, et c'est cette liste que le
 * back-office doit utiliser. Cette table n'existe que pour les statuts que le
 * frontend invente et que l'API ne produit pas (`draft`, `processing`,
 * `shipped`, `completed`, `expired`, `payment_failed`) : ils n'ont donc aucune
 * transition, plutot qu'un jeu de transitions qui n'existe pas cote serveur.
 *
 * Toute divergence ici se paie au guichet : l'API refuse la transition, et
 * l'echec n'apparait qu'apres avoir affiche un bouton possible.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // Backend : PENDING_PAYMENT -> PAID | CANCELLED
  awaiting_payment: ["paid", "cancelled"],
  // Backend : PAID -> READY_FOR_PICKUP | REFUND_PENDING | REFUNDED
  paid: ["ready_for_pickup", "refund_pending", "refunded"],
  // Backend : READY_FOR_PICKUP -> PICKED_UP | REFUND_PENDING | REFUNDED
  ready_for_pickup: ["picked_up", "refund_pending", "refunded"],
  // Backend : PICKED_UP -> REFUND_PENDING | REFUNDED
  picked_up: ["refund_pending", "refunded"],
  // Backend : REFUND_PENDING -> PAID | READY_FOR_PICKUP | PICKED_UP | REFUNDED
  refund_pending: ["paid", "ready_for_pickup", "picked_up", "refunded"],
  // Backend : CANCELLED et REFUNDED sont des etats terminaux.
  cancelled: [],
  refunded: [],

  // Statuts que l'API ne produit pas : aucune transition cote serveur.
  draft: [],
  processing: [],
  shipped: [],
  completed: [],
  expired: [],
  payment_failed: [],
};

export type DashboardSnapshot = {
  from: string;
  to: string;
  revenue: number;
  orders: number;
  paidOrders: number;
  pendingOrders: number;
  readyForPickup: number;
  pickedUp: number;
  activeProducts: number;
  lowStockProducts: number;
  salesByDay: Array<{ date: string; amount: number; count: number }>;
  topProducts: Array<{ name: string; quantity: number; amount: number }>;
  lowStock: Array<{
    productName: string;
    sku: string;
    stock: number;
    threshold: number;
  }>;
};
