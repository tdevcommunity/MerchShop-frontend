export const analyticsEvents = {
  pageView: "page_view",
  productView: "product_view",
  productVariantSelected: "product_variant_selected",
  addToCart: "add_to_cart",
  removeFromCart: "remove_from_cart",
  checkoutStarted: "checkout_started",
  deliveryMethodSelected: "delivery_method_selected",
  paymentStarted: "payment_started",
  paymentSuccess: "payment_success",
  paymentFailed: "payment_failed",
  orderCompleted: "order_completed",
  qrDisplayed: "qr_displayed",
} as const;

export type AnalyticsEventName =
  (typeof analyticsEvents)[keyof typeof analyticsEvents];

export type AnalyticsPayload = Record<string, string | number | boolean | null>;
