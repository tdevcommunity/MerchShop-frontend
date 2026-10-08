type LaravelVariant = Record<string, unknown>;
type LaravelProduct = Record<string, unknown>;

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : Number(value ?? fallback);
}

export function mapLaravelProduct(product: LaravelProduct) {
  const category = (product.category ?? {}) as Record<string, unknown>;
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const image =
    typeof product.imageUrl === "string"
      ? product.imageUrl
      : typeof product.image_url === "string"
        ? product.image_url
        : null;

  return {
    id: String(product.uuid ?? product.id ?? ""),
    slug: String(product.slug ?? ""),
    name: String(product.name ?? ""),
    description: String(product.description ?? ""),
    category: String(category.slug ?? product.categorySlug ?? ""),
    categoryLabel: String(category.name ?? product.categoryLabel ?? ""),
    imageUrl: image,
    badge: null,
    status: product.status === 1 || product.status === "1" ? "published" : "draft",
    featured: false,
    images: image ? [image] : [],
    createdAt: String(product.createdAt ?? product.created_at ?? ""),
    updatedAt: String(product.updatedAt ?? product.updated_at ?? ""),
    variants: variants.map((variant) => {
      const item = variant as LaravelVariant;
      return {
        id: String(item.uuid ?? item.id ?? ""),
        productId: String(product.uuid ?? product.id ?? ""),
        size: (item.size as string | null) ?? null,
        color: (item.color as string | null) ?? null,
        sku: String(item.sku ?? ""),
        stockQuantity: asNumber(item.stock ?? item.stock_quantity),
        unitPrice: asNumber(item.price ?? item.unit_price),
        reservedQuantity: asNumber(item.reservedQuantity ?? item.reserved_quantity),
        soldQuantity: asNumber(item.soldQuantity ?? item.sold_quantity),
        lowStockThreshold: asNumber(item.lowStockThreshold ?? item.low_stock_threshold, 5),
        active: item.status === undefined || item.status === 1 || item.status === "1",
      };
    }),
  };
}
