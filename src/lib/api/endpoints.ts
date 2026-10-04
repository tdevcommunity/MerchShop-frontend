export const apiEndpoints = {
  categories: "/api/v1/categories",
  products: "/api/v1/products",
  productByUuid: (uuid: string) => `/api/v1/products/${encodeURIComponent(uuid)}`,
  productBySlug: (slug: string) => `/api/v1/products/by-slug/${encodeURIComponent(slug)}`,
  orders: "/api/v1/orders",
  orderById: (uuid: string) => `/api/v1/orders/${encodeURIComponent(uuid)}`,
  checkout: "/api/v1/orders",
  pickupQr: (uuid: string) => `/api/v1/orders/${encodeURIComponent(uuid)}/qr`,
  events: "/api/v1/events",
}
