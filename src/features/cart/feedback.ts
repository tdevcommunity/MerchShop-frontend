import { cartNoticeStore } from "@/features/cart/notices";

export function notifyAddedToCart(productName: string, variantLabel: string): void {
  const detail = variantLabel ? `${productName} · ${variantLabel}` : productName;
  cartNoticeStore.push({
    key: "cart-add",
    title: "Ajout au panier effectué avec succès.",
    detail,
    hint: "Pour voir ta commande, ouvre le panier en haut à droite.",
    href: "/cart",
    actionLabel: "Voir le panier",
  });
}

export function notifyRemovedFromCart(productName: string, variantId: string): void {
  cartNoticeStore.push({
    key: `cart-remove:${variantId}`,
    title: "Article retiré du panier.",
    detail: productName,
    hint: "Le panier, en haut à droite, montre ce qu'il reste.",
    href: "/cart",
    actionLabel: "Voir le panier",
  });
}

export function notifyQuantityUpdated(
  productName: string,
  variantId: string,
  quantity: number,
): void {
  const articles = quantity > 1 ? "articles" : "article";
  cartNoticeStore.push({
    key: `cart-qty:${variantId}`,
    title: "Quantité mise à jour.",
    detail: `${productName} · ${quantity} ${articles}`,
  });
}
