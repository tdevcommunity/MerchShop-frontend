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

export type LaravelOrder = {
  uuid: string;
  orderNumber: string;
  status: number;
  fulfillmentMethod: "pickup" | "delivery";
  pickupStatus?: string | null;
  pickupTime?: string | null;
  participantId?: string | null;
  subTotal: number;
  discount: number;
  deliveryFee: number;
  currency: string;
  total: number;
  paymentStatus: number;
  paymentMethod: "mobile_money" | "card" | null;
  shippingAddress: string | null;
  items: LaravelOrderItem[];
  guestAccessToken?: string | null;
  allowedActions?: string[];
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
