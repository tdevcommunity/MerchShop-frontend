export const DELIVERY_METHODS = {
  PICKUP_EVENT: "pickup_event",
  DELIVERY: "delivery",
} as const;

export type DeliveryMethod =
  (typeof DELIVERY_METHODS)[keyof typeof DELIVERY_METHODS];

export type PickupInfo = {
  method: typeof DELIVERY_METHODS.PICKUP_EVENT;
  eventLabel: string;
};

export type ShippingAddress = {
  /** Quartier / zone de livraison (saisie manuelle). */
  line1: string;
  /** Adresse formatée Maps, si le lieu vient de la localisation. */
  line2?: string;
  city: string;
  postalCode?: string;
  country: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  /** Localisation XOR saisie manuelle. */
  source?: "maps" | "manual";
};

export type DeliveryInfo = {
  method: typeof DELIVERY_METHODS.DELIVERY;
  address: ShippingAddress;
};
