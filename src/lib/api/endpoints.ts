export const apiEndpoints = {
  // Auth
  csrfToken: "/api/v1/auth/csrf-token",
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
  register: "/api/v1/auth/register",
  me: "/api/v1/auth/me",

  // Catalog
  categories: "/api/v1/categories",
  categoryById: (id: string) => `/api/v1/categories/${encodeURIComponent(id)}`,
  products: "/api/v1/products",
  productById: (id: string) => `/api/v1/products/${encodeURIComponent(id)}`,
  productBySlug: (slug: string) =>
    `/api/v1/products/by-slug/${encodeURIComponent(slug)}`,
  productVariants: (productId: string) =>
    `/api/v1/products/${encodeURIComponent(productId)}/variants`,

  // Orders
  orders: "/api/v1/orders",
  orderById: (id: string) => `/api/v1/orders/${encodeURIComponent(id)}`,
  orderCancel: (id: string) =>
    `/api/v1/orders/${encodeURIComponent(id)}/cancel`,
  orderReady: (id: string) => `/api/v1/orders/${encodeURIComponent(id)}/ready`,
  orderPickedUp: (id: string) =>
    `/api/v1/orders/${encodeURIComponent(id)}/picked-up`,
  pickupQr: (orderId: string) =>
    `/api/v1/orders/${encodeURIComponent(orderId)}/qr`,

  // Pickup counter
  pickupOrders: "/api/v1/pickup/orders",
  pickupScan: "/api/v1/pickup/scan",
} as const;

