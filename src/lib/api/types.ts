export type LaravelCategory = {
  uuid: string;
  name: string;
  description: string | null;
  slug: string;
  status: string;
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type LaravelVariant = {
  uuid: string;
  sku: string;
  name: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
  status: string;
  isAvailable: boolean;
};

export type LaravelProduct = {
  uuid: string;
  name: string;
  description: string;
  imageUrl: string | null;
  slug: string;
  status: string;
  category: {
    uuid: string;
    name: string;
    slug: string;
  } | null;
  variants?: LaravelVariant[];
  variantsCount?: number | null;
  priceFrom?: number | null;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LaravelOrderItem = {
  uuid: string;
  productUuid?: string;
  variantUuid?: string;
  productName: string;
  productCategory?: string | null;
  size?: string | null;
  color?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

/**
 * Statut numerique d'une commande tel que renvoye par l'API.
 *
 * L'API oppose deux representations pour le meme enum : `OrderResource`
 * expose `status` directement, tandis que `paymentStatus` passe par une closure
 * typee `?string` qui convertit l'entier en chaine. On accepte donc les deux
 * formes et on normalise, plutot que de dependre d'un cote ou de l'autre.
 */
export type LaravelNumericStatus = number | string;

export type LaravelPayment = {
  uuid: string;
  orderId: string | null;
  participantId: string | null;
  currency: string | null;
  amount: number;
  method: string;
  provider: string | null;
  status: LaravelNumericStatus;
  transactionId: string | null;
  failureReason: string | null;
  /** Adresse de reglement chez l'operateur ; presente des l'ouverture. */
  checkoutUrl: string | null;
  createdAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
};

export type LaravelOrder = {
  uuid: string;
  orderNumber: string;
  status: LaravelNumericStatus;
  fulfillmentMethod: "pickup" | "delivery";
  /** Statut de retrait : chaine (`pending`, ...) et non numerique. */
  pickupStatus: string | null;
  pickupTime: string | null;
  participantId: string | null;
  subTotal: number;
  discount: number;
  deliveryFee: number;
  currency: string;
  total: number;
  paymentStatus: LaravelNumericStatus | null;
  paymentMethod: string | null;
  shippingAddress: string | null;
  items: LaravelOrderItem[];
  payments?: LaravelPayment[];
  guestAccessToken?: string | null;
  /** Contenu encode du QR, expose quand la commande a un droit de retrait. */
  pickupQrPayload?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LaravelUser = {
  uuid: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  emailVerifiedAt?: string | null;
  createdAt?: string;
};

export type LaravelPaginatedResponse<T> = {
  data: T[];
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
};

export type LaravelSingleResponse<T> = {
  data: T;
};

export type LaravelErrorResponse = {
  error?: {
    code?: string;
    message?: string;
    details?: {
      fields?: Record<string, string[]>;
      [key: string]: unknown;
    };
  };
  message?: string;
  errors?: Record<string, string[]>;
};
