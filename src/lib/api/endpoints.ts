export const apiEndpoints = {
  csrfToken: "/api/v1/auth/csrf-token",
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
  register: "/api/v1/auth/register",
  me: "/api/v1/auth/me",
  categories: "/api/v1/categories",
  categoryById: (id: string) => `/api/v1/categories/${encodeURIComponent(id)}`,
  products: "/api/v1/products",
  productByUuid: (uuid: string) => `/api/v1/products/${encodeURIComponent(uuid)}`,
  productBySlug: (slug: string) =>
    `/api/v1/products/by-slug/${encodeURIComponent(slug)}`,
  productVariants: (uuid: string) =>
    `/api/v1/products/${encodeURIComponent(uuid)}/variants`,
  orders: "/api/v1/orders",
  orderById: (uuid: string) => `/api/v1/orders/${encodeURIComponent(uuid)}`,
  checkout: "/api/v1/orders",
  /**
   * Ouverture du reglement chez l'operateur. Idempotente : la rappeler rend la
   * meme adresse de paiement sans ouvrir une seconde transaction.
   */
  payOrder: (uuid: string) => `/api/v1/orders/${encodeURIComponent(uuid)}/payment`,
  cancelOrder: (uuid: string) =>
    `/api/v1/orders/${encodeURIComponent(uuid)}/cancel`,
  markOrderReady: (uuid: string) =>
    `/api/v1/orders/${encodeURIComponent(uuid)}/ready`,
  markOrderPickedUp: (uuid: string) =>
    `/api/v1/orders/${encodeURIComponent(uuid)}/picked-up`,
  refundOrder: (uuid: string) =>
    `/api/v1/orders/${encodeURIComponent(uuid)}/refund`,
  pickupQr: (uuid: string) => `/api/v1/orders/${encodeURIComponent(uuid)}/qr`,
  pickupOrders: "/api/v1/pickup/orders",
  pickupScan: "/api/v1/pickup/scan",
  events: "/api/v1/events",
  health: "/api/v1/health",
} as const;