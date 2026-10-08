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

/**
 * Un compte du back-office, tel que `BackofficeUserResource` le renvoie.
 *
 * Les champs ne sont pas ceux d'un profil « id + name + active » invente pour
 * l'ecran : ce sont ceux de la ressource, qui est le contrat. `uuid` et non
 * `id` — les identifiants publics sont des UUID. `status` en entier et non un
 * booleen — la base distingue un compte desactive d'un compte qui n'a jamais
 * existe, et un booleen ferait disparaître cette difference.
 */
export type AdminUserPublic = {
  uuid: string;
  firstname: string;
  lastname: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: AdminRole;
  /** `0` inactif, `1` actif — l'entier de la nomenclature, tel quel. */
  status: number;
  canOperate: boolean;
  permissions: {
    manageCatalog: boolean;
    adjustStock: boolean;
    changeOrderStatus: boolean;
    manageUsers: boolean;
    viewAudit: boolean;
  };
};

/**
 * La reponse de `POST /admin/users` : le compte, plus le mot de passe.
 *
 * L'enveloppe `data` est celle de l'API, et le mot de passe temporaire est son
 * voisin — il n'est jamais dans le compte, puisqu'un compte n'a aucun champ de
 * mot de passe. Il n'appartient qu'a cette reponse, et une seule fois.
 */
export type AdminUserCreated = {
  data: AdminUserPublic;
  temporaryPassword: string;
};

/**
 * Ce que l'ecran affiche apres une invitation ou une reinitialisation.
 *
 * Le compte y revient a plat parce que l'ecran ne gere ni enveloppe ni
 * resource : il affiche un nom, une adresse, un rôle et le mot de passe a
 * transmettre hors de l'application.
 */
export type AdminInviteResult = {
  user: AdminUserPublic;
  temporaryPassword: string;
};

/**
 * Le compte connecte, tel que `GET /auth/me` le decrit.
 *
 * `fullName` et non `name` : le prénom et le nom sont deux colonnes, et la
 * ressource les rend deja assembles.
 */
export type AdminSessionUser = {
  uuid: string;
  email: string;
  fullName: string;
  role: AdminRole;
  active: boolean;
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

/**
 * Une declinaison de stock, telle que `VariantResource` la renvoie
 * (`GET /admin/inventory`).
 *
 * Les noms sont ceux de la ressource, pas ceux d'un ecran : `uuid` et non
 * `variantId` (les identifiants publics sont des UUID), `lowStockThreshold` et
 * non `threshold`, `stockLevel` / `stockLevelLabel` et non `level`. Inventer un
 * second vocabulaire oblige a maintenir une table de correspondance, et c'est
 * exactement ce decalage qui faisait afficher des colonnes vides.
 *
 * Il n'y a ni `reserved` ni `sold` : la ressource ne les expose pas, et l'ecran
 * ne doit donc pas offrir de colonnes qu'aucune donnee ne remplit.
 */
export type InventoryVariant = {
  uuid: string;
  sku: string;
  name: string;
  size: string | null;
  color: string | null;
  imageUrl: string | null;
  colorHex: string | null;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: number;
  isAvailable: boolean;
  stockLevel: InventoryLevel;
  stockLevelLabel: string;
};

/**
 * Un mouvement de stock, tel que `InventoryAdjustmentResource` le renvoie
 * (`GET /admin/inventory/adjustments`).
 *
 * `reasonLabel` vient de la ressource et `direction` en est deduite : le signe
 * d'un nombre ne se lit pas dans un tableau, donc « entree / sortie » est
 * exposee plutot que recalculee ici.
 */
export type InventoryLog = {
  uuid: string;
  sku: string;
  productName: string;
  productId: string | null;
  variantId: string | null;
  previousStock: number;
  delta: number;
  nextStock: number;
  direction: "in" | "out";
  reason: InventoryReason;
  reasonLabel: string;
  note: string;
  userId: string | null;
  userEmail: string;
  createdAt: string;
};

/**
 * Ce que l'API renvoie dans `oldValue` / `newValue`.
 *
 * La colonne est un JSON en base : un ajustement de stock revient sous forme
 * d'objet (`{"stock":28}`), une creation de compte sous forme de `null`, et une
 * action plus ancienne peut revenir en chaîne. Le rendu doit donc passer par
 * `formatAuditValue` : afficher l'objet tel quel ferait planter React
 * (« Objects are not valid as a React child ») et emporter la page entière.
 */
export type AuditValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>;

export type AuditLog = {
  /** L'API renvoie `uuid` et non `id` (les identifiants publics sont des UUID). */
  uuid: string;
  createdAt: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue: AuditValue;
  newValue: AuditValue;
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
