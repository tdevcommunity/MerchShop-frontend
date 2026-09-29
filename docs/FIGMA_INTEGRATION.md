# Intégration Figma — Shop TDEV

Mapping des maquettes Wonder/Figma vers le frontend Next.js existant.
Les fichiers locaux de `ressources/` (gitignorés) restent une **référence visuelle**, pas du code d’application. Ils ne sont pas versionnés.

## Mapping Figma → routes

| Écran Figma | Route | Viewport de référence |
|---|---|---|
| Page - TDEV Shop Home | `/` | Desktop 1440 |
| Page - TDEV Catalog | `/shop` | Desktop 1440 |
| Page - TDEV Product Detail | `/shop/[slug]` | Desktop 1440 |
| Page - TDEV Cart | `/cart` | Desktop 1440 |
| Screen - Checkout Fulfillment | `/checkout/fulfillment` | Mobile 390 (source) + Desktop 1440 |
| Screen - Checkout Information | `/checkout/information` | Mobile 390 (source) + Desktop 1440 |
| Screen - Checkout Payment | `/checkout/payment` | Mobile 390 (source) + Desktop 1440 |
| Screen - Payment Processing | `/checkout/processing` | Mobile 390 (source) + Desktop 1440 |
| Screen - Order Confirmation | `/checkout/confirmation?orderId=` | Mobile 390 (source) + Desktop 1440 |
| Screen - Digital QR Pass | `/order/[id]/qr` | Mobile 390 (source) + Desktop 1440 |
| Screen - Digital Receipt | `/order/[id]/receipt` | Mobile 390 (source) + Desktop 1440 |

`/checkout` redirige vers `/checkout/fulfillment`. `/order/[id]` redirige vers la confirmation.

## Composants principaux

- Chrome Shop : `SiteHeader`, `SiteFooter`, `BrandMark`, `ProductCard`, `ProductImage`, `CategoryFilter`, `QuantityStepper`
- Checkout : `CheckoutShell`, `CheckoutStepper`, `CheckoutStepIntro`, `FulfillmentForm`, `InformationForm`, `PaymentForm`, `PaymentProcessingView`
- Post-commande : `TunnelHeader`, `OrderConfirmation`, `DigitalQrPass`, `PickupQrCard`, `DigitalReceipt`
- Données : services `catalog`, `checkout`, `order`, `qr` + mocks si `NEXT_PUBLIC_API_BASE_URL` est vide
- Panier : `features/cart/store/cart-store.ts` (localStorage)
- Draft checkout : `features/checkout/store/checkout-draft-store.ts` (sessionStorage)

## Données mockées

- Produits : `src/features/catalog/services/catalog-mock.ts`
- Commande + QR : `src/features/order/services/order-mock.ts` (sessionStorage)
- Paiement : `src/features/payment/services/mock-payment.ts` (délai, succès ou `?fail=1`)

Les pages consomment les services, pas des objets hardcodés.

## Écarts Figma justifiés

- Polices Archivo / Space Grotesk / Inter du export Wonder → **Stack Sans Headline / Notch** (charte TDEV du repo)
- Images produits Wonder CDN non livrées dans `public/` → placeholder « Visuel manquant »
- Code promo `FESTIVAL10` → non implémenté (règle métier / montant non définis côté backend)
- Paiement à la livraison → affiché comme option **provisoire désactivée**
- Checkout desktop : formulaire à gauche + récapitulatif sticky à droite (`lg`, ~24rem), barre d’action du mobile conservée sous `lg`
- Fulfillment / paiement desktop : tuiles égales + panneau de travail (pas un simple stretch mobile)
- Infos desktop : panneau identité + colonne « À retenir » ; email optionnel
- Paiement : téléphone demandé uniquement pour Mobile Money ; champs carte mockés, jamais persistés ni envoyés
- Livraison : localisation Maps **ou** saisie pays / ville / quartier (jamais les deux)
- Confirmation desktop : bandeau + dashboard `max-w-7xl` (détails | articles + CTA)
- Reçu desktop : facture `max-w-7xl` (en-tête, tableau, totaux) + PDF à droite
- Pass QR desktop : boarding pass (QR | titulaire) + consignes à droite
- Shop mobile : aucune maquette → empilement mobile-first des blocs desktop
- QR : image fournie par le mock/backend uniquement, pas de génération côté client
- PDF du reçu : bouton désactivé jusqu’au backend

## Assets manquants

Tous les visuels produits, catégories, QR PNG du fichier Wonder (`cdn.wonder.so`) sont absents de `public/`.
À remplacer par les visuels officiels (CMS / Cloudinary / S3) via `Product.imageUrl` et `PickupQr.imageUrl`.

## Points backend à brancher

- Products API (`GET /api/v1/products`, `GET /api/v1/products/{slug}`)
- Images produits
- Persistence panier serveur (aujourd’hui localStorage UX)
- Checkout API (`POST /api/v1/checkout`) — le frontend n’envoie pas un montant opposable
- Payment provider + webhooks
- Order API (`GET /api/v1/orders/{id}`)
- QR API (`GET /api/v1/orders/{id}/pickup-qr`) — hash / validité côté serveur
- Reçu PDF
