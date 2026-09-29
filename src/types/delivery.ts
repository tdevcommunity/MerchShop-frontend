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
  line1: string;
  line2?: string;
  city: string;
  postalCode?: string;
  country: string;
};

export type DeliveryInfo = {
  method: typeof DELIVERY_METHODS.DELIVERY;
  address: ShippingAddress;
};
