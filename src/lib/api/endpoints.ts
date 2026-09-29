export const apiEndpoints = {
  products: "/api/v1/products",
  productBySlug: (slug: string) => `/api/v1/products/${encodeURIComponent(slug)}`,
  orders: "/api/v1/orders",
  orderById: (id: string) => `/api/v1/orders/${encodeURIComponent(id)}`,
  checkout: "/api/v1/checkout",
  payments: "/api/v1/payments",
  pickupQr: (orderId: string) =>
    `/api/v1/orders/${encodeURIComponent(orderId)}/pickup-qr`,
} as const;
