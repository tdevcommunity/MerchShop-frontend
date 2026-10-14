import type { CheckoutDraft, CustomerInfo } from "@/types/checkout";
import { DELIVERY_METHODS } from "@/types/delivery";
import type { ShippingAddress } from "@/types/delivery";
import { ValidationError } from "@/lib/api/errors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOGO_COUNTRY = "228";
const TOGO_NATIONAL_LENGTH = 8;
const TOGO_INTERNATIONAL_PREFIX = "00";

/** Aligné sur la règle Laravel `PhoneNumber` (Togo, 8 chiffres). */
export function normaliseTogoPhone(value: string): string | null {
  let digits = value.replace(/\D+/g, "");
  if (digits.startsWith(TOGO_INTERNATIONAL_PREFIX)) {
    digits = digits.slice(TOGO_INTERNATIONAL_PREFIX.length);
  }
  if (
    digits.length > TOGO_NATIONAL_LENGTH &&
    digits.startsWith(TOGO_COUNTRY)
  ) {
    digits = digits.slice(TOGO_COUNTRY.length);
  }
  if (digits.length !== TOGO_NATIONAL_LENGTH) {
    return null;
  }
  if (new Set(digits.split("")).size === 1) {
    return null;
  }
  return digits;
}

const PHONE_INVALID_TOGO =
  "Ce numéro n’est pas un numéro togolais valide (8 chiffres, ex. 90123456, 64000061 ou +22890123456).";

function phoneError(phone: string, required: boolean): string | undefined {
  const trimmed = phone.trim();
  if (!trimmed) {
    return required
      ? "Le téléphone est requis pour te joindre concernant ta commande."
      : undefined;
  }
  if (normaliseTogoPhone(trimmed) === null) {
    return PHONE_INVALID_TOGO;
  }
  return undefined;
}

export function validateCustomer(customer: CustomerInfo): Record<string, string> {
  const fields: Record<string, string> = {};

  if (!customer.firstName.trim()) {
    fields.firstName = "Le prénom est requis.";
  }
  if (!customer.lastName.trim()) {
    fields.lastName = "Le nom est requis.";
  }
  const email = customer.email.trim();
  if (email && !EMAIL_PATTERN.test(email)) {
    fields.email = "L'email n'est pas valide.";
  }
  const phone = phoneError(customer.phone, true);
  if (phone) {
    fields.phone = phone;
  }

  return fields;
}

export function validateShippingAddress(
  address: ShippingAddress | null,
): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!address) {
    fields.shipping = "L'adresse de livraison est requise.";
    return fields;
  }

  if (address.source === "maps") {
    const hasCoords = address.lat != null && address.lng != null;
    const hasPlace = Boolean(address.line2?.trim());
    if (!hasCoords && !hasPlace) {
      fields.shipping = "Indique un lieu ou utilise ta position.";
    }
    return fields;
  }

  if (!address.country.trim()) {
    fields.country = "Le pays est requis.";
  }
  if (!address.city.trim()) {
    fields.city = "La ville est requise.";
  }
  if (!address.line1.trim()) {
    fields.line1 = "Le quartier est requis.";
  }
  return fields;
}

export function validateFulfillment(draft: CheckoutDraft): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!draft.deliveryMethod) {
    fields.deliveryMethod = "Choisis un mode de réception.";
    return fields;
  }
  if (draft.deliveryMethod === DELIVERY_METHODS.DELIVERY) {
    Object.assign(fields, validateShippingAddress(draft.shippingAddress));
  }
  return fields;
}

export function validateInformation(draft: CheckoutDraft): Record<string, string> {
  return validateCustomer(draft.customer);
}

export function validatePayment(draft: CheckoutDraft): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!draft.paymentMethod) {
    fields.paymentMethod = "Choisis un moyen de paiement.";
  }
  return fields;
}

export function validateCheckoutDraft(draft: CheckoutDraft): void {
  const fields = {
    ...validateFulfillment(draft),
    ...validateInformation(draft),
    ...validatePayment(draft),
  };

  if (Object.keys(fields).length > 0) {
    throw new ValidationError(fields);
  }
}

export function firstCheckoutValidationMessage(
  fields: Record<string, string>,
): string {
  const message = Object.values(fields).find(
    (value) => typeof value === "string" && value.trim() !== "",
  );
  return message ?? "Certaines informations sont incomplètes.";
}

export function checkoutPathForValidationFields(
  fields: Record<string, string>,
): "/checkout/fulfillment" | "/checkout/information" {
  const keys = Object.keys(fields);
  if (
    keys.some((key) =>
      [
        "deliveryMethod",
        "shipping",
        "country",
        "city",
        "line1",
        "fulfillment_method",
        "shipping_address",
      ].includes(key),
    )
  ) {
    return "/checkout/fulfillment";
  }
  return "/checkout/information";
}
