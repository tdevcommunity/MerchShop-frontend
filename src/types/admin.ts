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

export type AdminSessionUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
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

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["awaiting_payment", "cancelled"],
  awaiting_payment: ["paid", "payment_failed", "cancelled", "expired"],
  paid: ["processing", "ready_for_pickup", "cancelled", "refunded"],
  processing: ["ready_for_pickup", "shipped", "cancelled"],
  ready_for_pickup: ["picked_up", "completed", "shipped"],
  shipped: ["completed", "picked_up"],
  picked_up: [],
  completed: [],
  cancelled: [],
  expired: [],
  payment_failed: ["awaiting_payment", "cancelled"],
  refunded: [],
};

export type DashboardSnapshot = {
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
