import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { mockProducts } from "@/features/catalog/services/catalog-mock";
import { hashPassword } from "@/server/password";
import type {
  AdminCategory,
  AdminNotification,
  AdminOrder,
  AdminPayment,
  AdminProduct,
  AdminUser,
  AdminVariant,
  AuditLog,
  DashboardSnapshot,
  InventoryLog,
  InventoryReason,
  ProductStatus,
} from "@/types/admin";
import { ORDER_TRANSITIONS } from "@/types/admin";
import type { Product } from "@/types/catalog";
import type { Order, OrderStatus } from "@/types/order";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";
import type { PickupQr } from "@/types/qr";
import { env } from "@/lib/config/env";

export type ShopState = {
  users: AdminUser[];
  categories: AdminCategory[];
  products: AdminProduct[];
  orders: AdminOrder[];
  payments: AdminPayment[];
  qrs: PickupQr[];
  inventoryLogs: InventoryLog[];
  auditLogs: AuditLog[];
  notifications: AdminNotification[];
};

const globalStore = globalThis as { __tdevShopStore?: ShopState };

function dataFile(): string {
  return join(process.cwd(), ".data", "shop-store.json");
}

function nowIso(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function toAdminVariant(variant: Product["variants"][number]): AdminVariant {
  return {
    ...variant,
    reservedQuantity: 0,
    soldQuantity: 0,
    lowStockThreshold: 5,
    active: true,
  };
}

function seedProducts(): AdminProduct[] {
  const createdAt = "2026-01-15T09:00:00.000Z";
  return mockProducts.map((product) => ({
    ...product,
    status: "published" as const,
    featured: product.badge === "bestseller",
    images: product.imageUrl ? [product.imageUrl] : [],
    createdAt,
    updatedAt: createdAt,
    variants: product.variants.map(toAdminVariant),
  }));
}

function seedUsers(): AdminUser[] {
  const adminPassword =
    process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "TdevAdmin2026!";
  const staffPassword =
    process.env.STAFF_BOOTSTRAP_PASSWORD ?? "TdevStaff2026!";
  return [
    {
      id: "usr_admin",
      email: "admin@tdev.tg",
      name: "Admin TDEV",
      role: "admin",
      passwordHash: hashPassword(adminPassword, "tdev-admin-salt"),
      active: true,
    },
    {
      id: "usr_staff",
      email: "staff@tdev.tg",
      name: "Staff Stand",
      role: "staff",
      passwordHash: hashPassword(staffPassword, "tdev-staff-salt"),
      active: true,
    },
  ];
}

function seedState(): ShopState {
  return {
    users: seedUsers(),
    categories: [
      { id: "cat_textile", slug: "textile", label: "Textile", active: true, sortOrder: 1 },
      {
        id: "cat_accessories",
        slug: "accessories",
        label: "Accessoires & Bureau",
        active: true,
        sortOrder: 2,
      },
      {
        id: "cat_bagagerie",
        slug: "bagagerie",
        label: "Bagagerie & Goodies",
        active: true,
        sortOrder: 3,
      },
    ],
    products: seedProducts(),
    orders: [],
    payments: [],
    qrs: [],
    inventoryLogs: [],
    auditLogs: [],
    notifications: [
      {
        id: "ntf_welcome",
        createdAt: nowIso(),
        tone: "info",
        message: "Back Office prêt. Les produits publiés alimentent le Shop public.",
        read: false,
      },
    ],
  };
}

function useFileStore() {
  return env.appEnv !== "production" && env.appEnv !== "test" && !process.env.VITEST;
}

function persist(state: ShopState) {
  if (!useFileStore()) {
    return;
  }
  try {
    const file = dataFile();
    mkdirSync(join(process.cwd(), ".data"), { recursive: true });
    const safe = {
      ...state,
      users: state.users.map((user) => ({ ...user, passwordHash: user.passwordHash })),
    };
    writeFileSync(file, JSON.stringify(safe, null, 2), "utf8");
  } catch {
    // filesystem may be read-only (CI / serverless)
  }
}

function loadState(): ShopState {
  if (useFileStore()) {
    try {
      const file = dataFile();
      if (existsSync(file)) {
        const parsed = JSON.parse(readFileSync(file, "utf8")) as ShopState;
        globalStore.__tdevShopStore = parsed;
        return parsed;
      }
    } catch {
      // ignore corrupt store
    }
  }
  if (globalStore.__tdevShopStore) {
    return globalStore.__tdevShopStore;
  }
  const seeded = seedState();
  globalStore.__tdevShopStore = seeded;
  persist(seeded);
  return seeded;
}

function mutate<T>(fn: (state: ShopState) => T): T {
  const state = loadState();
  const result = fn(state);
  persist(state);
  return result;
}

function notify(state: ShopState, tone: AdminNotification["tone"], message: string) {
  state.notifications.unshift({
    id: id("ntf"),
    createdAt: nowIso(),
    tone,
    message,
    read: false,
  });
}

export function toPublicProduct(product: AdminProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: product.category,
    categoryLabel:
      loadState().categories.find((category) => category.slug === product.category)?.label ??
      product.category,
    imageUrl: product.images[0] ?? product.imageUrl,
    badge: product.featured ? "bestseller" : product.badge,
    variants: product.variants
      .filter((variant) => variant.active)
      .map((variant) => ({
        id: variant.id,
        productId: variant.productId,
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex ?? null,
        sku: variant.sku,
        stockQuantity: variant.stockQuantity,
        unitPrice: variant.unitPrice,
      })),
  };
}

export function listPublishedProducts(): Product[] {
  return loadState()
    .products.filter((product) => product.status === "published")
    .map(toPublicProduct);
}

export function findPublishedProduct(slug: string): Product | undefined {
  const product = loadState().products.find(
    (item) => item.slug === slug && item.status === "published",
  );
  return product ? toPublicProduct(product) : undefined;
}

export function findUserByEmail(email: string): AdminUser | undefined {
  return loadState().users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.active,
  );
}

export function listAdminProducts() {
  return loadState().products;
}

export function listAdminUsers() {
  return loadState().users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
  }));
}

export function getAdminProduct(idValue: string) {
  return loadState().products.find((product) => product.id === idValue);
}

export function listCategories() {
  return [...loadState().categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function listPublicCategories() {
  return listCategories()
    .filter((category) => category.active)
    .map((category) => ({ slug: category.slug, label: category.label }));
}

export function createCategory(
  user: { id: string; email: string },
  input: { slug: string; label: string },
) {
  return mutate((state) => {
    const slug = slugify(input.slug || input.label);
    if (state.categories.some((category) => category.slug === slug)) {
      throw new Error(`La catégorie "${slug}" existe déjà.`);
    }
    const category: AdminCategory = {
      id: id("cat"),
      slug,
      label: input.label.trim(),
      active: true,
      sortOrder: state.categories.length + 1,
    };
    state.categories.push(category);
    writeAudit(user, state, "category.create", "category", category.id, null, category.label);
    return category;
  });
}

export function updateCategory(
  user: { id: string; email: string },
  idValue: string,
  patch: Partial<Pick<AdminCategory, "label" | "active" | "sortOrder">>,
) {
  return mutate((state) => {
    const category = state.categories.find((item) => item.id === idValue);
    if (!category) {
      throw new Error("Catégorie introuvable.");
    }
    const previous = { ...category };
    Object.assign(category, patch);
    writeAudit(
      user,
      state,
      "category.update",
      "category",
      category.id,
      JSON.stringify(previous),
      JSON.stringify(category),
    );
    return category;
  });
}

export function createProduct(
  user: { id: string; email: string },
  input: {
    name: string;
    slug?: string;
    description: string;
    category: string;
    status?: ProductStatus;
    featured?: boolean;
    images?: string[];
    variants: Array<{
      size: AdminVariant["size"];
      color: string | null;
      colorHex?: string | null;
      sku: string;
      stockQuantity: number;
      unitPrice: number;
      lowStockThreshold?: number;
    }>;
  },
) {
  return mutate((state) => {
    const slug = slugify(input.slug || input.name);
    if (state.products.some((product) => product.slug === slug)) {
      throw new Error(`Le slug "${slug}" existe déjà.`);
    }
    const skus = input.variants.map((variant) => variant.sku.trim().toUpperCase());
    if (new Set(skus).size !== skus.length) {
      throw new Error("Deux variantes ne peuvent pas partager le même SKU.");
    }
    for (const sku of skus) {
      if (state.products.some((product) => product.variants.some((variant) => variant.sku === sku))) {
        throw new Error(`Le SKU "${sku}" existe déjà.`);
      }
      if (sku.length < 3) {
        throw new Error("Le SKU doit contenir au moins 3 caractères.");
      }
    }
    const productId = id("prod");
    const product: AdminProduct = {
      id: productId,
      slug,
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category,
      imageUrl: input.images?.[0] ?? null,
      badge: input.featured ? "bestseller" : null,
      status: input.status ?? "draft",
      featured: Boolean(input.featured),
      images: input.images ?? [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      variants: input.variants.map((variant, index) => ({
        id: id(`var_${index}`),
        productId,
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex ?? null,
        sku: variant.sku.trim().toUpperCase(),
        stockQuantity: Math.max(0, Math.floor(variant.stockQuantity)),
        unitPrice: variant.unitPrice,
        reservedQuantity: 0,
        soldQuantity: 0,
        lowStockThreshold: variant.lowStockThreshold ?? 5,
        active: true,
      })),
    };
    if (product.variants.some((variant) => variant.unitPrice <= 0)) {
      throw new Error("Le prix doit être strictement positif.");
    }
    state.products.unshift(product);
    writeAudit(user, state, "product.create", "product", product.id, null, product.name);
    if (product.status === "published") {
      notify(state, "success", `Produit publié : ${product.name}`);
    }
    return product;
  });
}

export function updateProduct(
  user: { id: string; email: string },
  idValue: string,
  patch: Partial<
    Pick<
      AdminProduct,
      "name" | "slug" | "description" | "category" | "status" | "featured" | "images" | "badge"
    >
  > & { variants?: AdminVariant[] },
) {
  return mutate((state) => {
    const product = state.products.find((item) => item.id === idValue);
    if (!product) {
      throw new Error("Produit introuvable.");
    }
    const previous = JSON.stringify({
      status: product.status,
      name: product.name,
    });
    if (patch.slug && patch.slug !== product.slug) {
      const slug = slugify(patch.slug);
      if (state.products.some((item) => item.id !== product.id && item.slug === slug)) {
        throw new Error(`Le slug "${slug}" existe déjà.`);
      }
      product.slug = slug;
    }
    if (patch.name) product.name = patch.name.trim();
    if (patch.description !== undefined) product.description = patch.description;
    if (patch.category) product.category = patch.category;
    if (patch.status) product.status = patch.status;
    if (patch.featured !== undefined) product.featured = patch.featured;
    if (patch.images) {
      product.images = patch.images;
      product.imageUrl = patch.images[0] ?? null;
    }
    if (patch.badge !== undefined) product.badge = patch.badge;
    if (patch.variants) product.variants = patch.variants;
    product.updatedAt = nowIso();
    writeAudit(user, state, "product.update", "product", product.id, previous, product.status);
    return product;
  });
}

export function duplicateProduct(user: { id: string; email: string }, idValue: string) {
  const current = getAdminProduct(idValue);
  if (!current) {
    throw new Error("Produit introuvable.");
  }
  return createProduct(user, {
    name: `${current.name} (copie)`,
    slug: `${current.slug}-copie`,
    description: current.description,
    category: current.category,
    status: "draft",
    featured: false,
    images: current.images,
    variants: current.variants.map((variant) => ({
      size: variant.size,
      color: variant.color,
      sku: `${variant.sku}-COPY`,
      stockQuantity: variant.stockQuantity,
      unitPrice: variant.unitPrice,
      lowStockThreshold: variant.lowStockThreshold,
    })),
  });
}

export function adjustInventory(
  user: { id: string; email: string },
  variantId: string,
  delta: number,
  reason: InventoryReason,
  note = "",
) {
  return mutate((state) => {
    const product = state.products.find((item) =>
      item.variants.some((variant) => variant.id === variantId),
    );
    const variant = product?.variants.find((item) => item.id === variantId);
    if (!product || !variant) {
      throw new Error("Variante introuvable.");
    }
    if (!Number.isInteger(delta)) {
      throw new Error("La variation de stock doit être un entier.");
    }
    const next = variant.stockQuantity + delta;
    if (next < 0) {
      throw new Error("Le stock ne peut pas devenir négatif.");
    }
    const previous = variant.stockQuantity;
    variant.stockQuantity = next;
    const log: InventoryLog = {
      id: id("stk"),
      createdAt: nowIso(),
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      sku: variant.sku,
      previousStock: previous,
      delta,
      nextStock: next,
      reason,
      note,
      userId: user.id,
      userEmail: user.email,
    };
    state.inventoryLogs.unshift(log);
    writeAudit(
      user,
      state,
      "inventory.adjust",
      "variant",
      variant.id,
      String(previous),
      String(next),
    );
    if (next <= variant.lowStockThreshold) {
      notify(
        state,
        "warning",
        `Stock faible : ${product.name} (${variant.sku}) · ${next} restant(s)`,
      );
    }
    return log;
  });
}

export function listInventory() {
  return loadState().products.flatMap((product) =>
    product.variants.map((variant) => ({
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      stock: variant.stockQuantity,
      reserved: variant.reservedQuantity,
      sold: variant.soldQuantity,
      threshold: variant.lowStockThreshold,
      active: variant.active,
      level: inventoryLevel(variant),
    })),
  );
}

export function listInventoryLogs() {
  return loadState().inventoryLogs;
}

export function recordPaidOrder(order: Order, paymentMethod: PaymentMethod | null) {
  return mutate((state) => {
    const adminOrder: AdminOrder = {
      ...order,
      status: order.status === "paid" ? "paid" : order.status,
      pickupValidatedAt: null,
      pickupAgentId: null,
      pickupAgentEmail: null,
    };
    state.orders.unshift(adminOrder);
    const payment: AdminPayment = {
      id: id("pay"),
      orderId: order.id,
      status: order.paymentStatus,
      method: paymentMethod,
      amount: order.total,
      providerRef: `TX-${order.reference}`,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
      createdAt: order.createdAt,
    };
    state.payments.unshift(payment);
    const qr: PickupQr = {
      orderId: order.id,
      status: "ready",
      imageUrl: null,
      alt: `QR de retrait ${order.reference}`,
    };
    state.qrs.unshift(qr);
    for (const item of order.items) {
      const product = state.products.find((entry) => entry.id === item.productId);
      const variant = product?.variants.find((entry) => entry.id === item.variantId);
      if (variant) {
        const previous = variant.stockQuantity;
        variant.stockQuantity = Math.max(0, variant.stockQuantity - item.quantity);
        variant.soldQuantity += item.quantity;
        state.inventoryLogs.unshift({
          id: id("stk"),
          createdAt: nowIso(),
          productId: item.productId,
          productName: item.productName,
          variantId: item.variantId,
          sku: variant.sku,
          previousStock: previous,
          delta: -item.quantity,
          nextStock: variant.stockQuantity,
          reason: "sale",
          note: `Commande ${order.reference}`,
          userId: "system",
          userEmail: "system@tdev.tg",
        });
      }
    }
    notify(state, "success", `Paiement confirmé · ${order.reference}`);
    notify(state, "info", `Nouvelle commande ${order.reference}`);
    return adminOrder;
  });
}

export function getAdminOrder(idValue: string) {
  return loadState().orders.find((order) => order.id === idValue);
}

export function listAdminOrders() {
  return loadState().orders;
}

export function listPayments() {
  return loadState().payments;
}

export function getPickupQrFromStore(orderId: string) {
  return loadState().qrs.find((qr) => qr.orderId === orderId);
}

export function changeOrderStatus(
  user: { id: string; email: string },
  orderId: string,
  next: OrderStatus,
) {
  return mutate((state) => {
    const order = state.orders.find((item) => item.id === orderId);
    if (!order) {
      throw new Error("Commande introuvable.");
    }
    const allowed = ORDER_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(next)) {
      throw new Error(
        `Impossible de modifier cette commande. Transition ${order.status} → ${next} interdite.`,
      );
    }
    const previous = order.status;
    order.status = next;
    if (next === "refunded") {
      const payment = state.payments.find((item) => item.orderId === order.id);
      if (payment) {
        payment.status = "refunded" as PaymentStatus;
      }
      order.paymentStatus = "refunded" as PaymentStatus;
    }
    writeAudit(user, state, "order.status", "order", order.id, previous, next);
    if (next === "ready_for_pickup") {
      notify(state, "success", `Commande prête au retrait · ${order.reference}`);
    }
    return order;
  });
}

export function validatePickup(user: { id: string; email: string }, orderId: string) {
  return mutate((state) => {
    const order = state.orders.find((item) => item.id === orderId);
    if (!order) {
      throw new Error("Commande introuvable.");
    }
    if (order.status === "picked_up" || order.status === "completed") {
      throw new Error("Impossible de modifier cette commande. Elle a déjà été retirée.");
    }
    if (order.status !== "ready_for_pickup" && order.status !== "paid" && order.status !== "processing") {
      throw new Error("Cette commande n'est pas prête pour un retrait.");
    }
    if (order.status !== "ready_for_pickup" && !ORDER_TRANSITIONS[order.status].includes("ready_for_pickup")) {
      if (!ORDER_TRANSITIONS[order.status].includes("picked_up")) {
        throw new Error("Cette commande ne peut pas être retirée.");
      }
    }
    if (order.status !== "ready_for_pickup") {
      if (ORDER_TRANSITIONS[order.status].includes("ready_for_pickup")) {
        order.status = "ready_for_pickup";
      }
    }
    if (!ORDER_TRANSITIONS[order.status].includes("picked_up")) {
      throw new Error("Cette commande ne peut pas être marquée comme retirée.");
    }
    order.status = "picked_up";
    order.pickupValidatedAt = nowIso();
    order.pickupAgentId = user.id;
    order.pickupAgentEmail = user.email;
    writeAudit(user, state, "pickup.validate", "order", order.id, "ready_for_pickup", "picked_up");
    notify(state, "success", `Retrait validé · ${order.reference}`);
    return order;
  });
}

export function listPickups() {
  const state = loadState();
  return state.orders
    .filter((order) =>
      ["paid", "processing", "ready_for_pickup", "picked_up"].includes(order.status),
    )
    .map((order) => ({
      order,
      qr: state.qrs.find((qr) => qr.orderId === order.id) ?? null,
    }));
}

export function dashboardSnapshot(): DashboardSnapshot {
  const state = loadState();
  const paid = state.orders.filter((order) =>
    ["paid", "processing", "ready_for_pickup", "picked_up", "completed", "shipped"].includes(
      order.status,
    ),
  );
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const dayOrders = paid.filter((order) => order.createdAt.slice(0, 10) === key);
    return {
      date: key,
      amount: dayOrders.reduce((sum, order) => sum + order.total, 0),
      count: dayOrders.length,
    };
  });
  const sales = new Map<string, { quantity: number; amount: number }>();
  for (const order of paid) {
    for (const item of order.items) {
      const current = sales.get(item.productName) ?? { quantity: 0, amount: 0 };
      current.quantity += item.quantity;
      current.amount += item.unitPrice * item.quantity;
      sales.set(item.productName, current);
    }
  }
  const inventory = listInventory();
  return {
    revenue: paid.reduce((sum, order) => sum + order.total, 0),
    orders: state.orders.length,
    paidOrders: paid.length,
    pendingOrders: state.orders.filter((order) =>
      ["awaiting_payment", "payment_failed"].includes(order.status),
    ).length,
    readyForPickup: state.orders.filter((order) => order.status === "ready_for_pickup").length,
    pickedUp: state.orders.filter((order) =>
      ["picked_up", "completed"].includes(order.status),
    ).length,
    activeProducts: state.products.filter((product) => product.status === "published").length,
    lowStockProducts: new Set(
      inventory.filter((row) => row.level === "low" || row.level === "out").map((row) => row.productId),
    ).size,
    salesByDay: days,
    topProducts: [...sales.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5),
    lowStock: inventory
      .filter((row) => row.level === "low" || row.level === "out")
      .slice(0, 6)
      .map((row) => ({
        productName: row.productName,
        sku: row.sku,
        stock: row.stock,
        threshold: row.threshold,
      })),
  };
}

export function searchStore(query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    return { products: [], orders: [], payments: [] };
  }
  const state = loadState();
  return {
    products: state.products.filter((product) =>
      [product.name, product.slug, ...product.variants.map((variant) => variant.sku)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    ),
    orders: state.orders.filter((order) =>
      [
        order.id,
        order.reference,
        order.customer.firstName,
        order.customer.lastName,
        order.customer.email,
        order.customer.phone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    ),
    payments: state.payments.filter((payment) =>
      [payment.id, payment.orderId, payment.providerRef, payment.customerName]
        .join(" ")
        .toLowerCase()
        .includes(q),
    ),
  };
}

export function listAuditLogs() {
  return loadState().auditLogs;
}

export function listNotifications() {
  return loadState().notifications;
}

export function markNotificationsRead() {
  return mutate((state) => {
    state.notifications.forEach((item) => {
      item.read = true;
    });
    return state.notifications;
  });
}

export function resetShopStore() {
  const seeded = seedState();
  globalStore.__tdevShopStore = seeded;
  persist(seeded);
  return seeded;
}

function inventoryLevel(variant: AdminVariant) {
  if (!variant.active) return "disabled" as const;
  if (variant.stockQuantity <= 0) return "out" as const;
  if (variant.stockQuantity <= variant.lowStockThreshold) return "low" as const;
  return "available" as const;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function writeAudit(
  user: { id: string; email: string },
  state: ShopState,
  action: string,
  resource: string,
  resourceId: string,
  oldValue: string | null,
  newValue: string | null,
) {
  state.auditLogs.unshift({
    id: id("aud"),
    createdAt: nowIso(),
    userId: user.id,
    userEmail: user.email,
    action,
    resource,
    resourceId,
    oldValue,
    newValue,
  });
}
