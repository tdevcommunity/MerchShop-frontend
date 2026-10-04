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
  orders: "/api/v1/orders",
  orderById: (uuid: string) => `/api/v1/orders/${encodeURIComponent(uuid)}`,
  checkout: "/api/v1/orders",
  pickupQr: (uuid: string) => `/api/v1/orders/${encodeURIComponent(uuid)}/qr`,
  events: "/api/v1/events",
} as const;
