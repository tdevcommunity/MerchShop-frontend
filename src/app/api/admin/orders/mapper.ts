export function mapLaravelOrder(order: Record<string, unknown>) {
  const customerName = String(order.customerName ?? "").trim().split(/\s+/);
  const items = Array.isArray(order.items) ? order.items : [];

  return {
    id: String(order.uuid ?? order.id ?? ""),
    reference: String(order.orderNumber ?? order.reference ?? ""),
    status: order.status,
    items: items.map((rawItem) => {
      const item = rawItem as Record<string, unknown>;
      return {
        productId: String(item.productUuid ?? ""),
        variantId: String(item.variantUuid ?? ""),
        productName: String(item.productName ?? ""),
        variantLabel: String(item.variantName ?? ""),
        size: typeof item.size === "string" ? item.size : null,
        color: typeof item.color === "string" ? item.color : null,
        quantity: Number(item.quantity ?? 0),
        unitPrice: Number(item.unitPrice ?? 0),
      };
    }),
    total: Number(order.total ?? 0),
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod ?? null,
    customer: {
      firstName: customerName[0] ?? "",
      lastName: customerName.slice(1).join(" "),
      email: "",
      phone: String(order.customerPhoneNumber ?? ""),
    },
    deliveryMethod: order.fulfillmentMethod,
    shippingAddress: order.shippingAddress ?? null,
    pickupLabel: order.pickupStatus ?? null,
    createdAt: String(order.createdAt ?? ""),
    pickupValidatedAt: order.pickupTime ?? null,
    pickupAgentId: null,
    pickupAgentEmail: null,
  };
}
