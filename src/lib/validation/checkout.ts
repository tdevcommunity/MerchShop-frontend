import type { CheckoutDraft, CustomerInfo } from "@/types/checkout";
import { DELIVERY_METHODS } from "@/types/delivery";
import type { ShippingAddress } from "@/types/delivery";
import { ValidationError } from "@/lib/api/errors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\s().-]{8,20}$/;

function phoneError(phone: string, required: boolean): string | undefined {
  const trimmed = phone.trim();
  if (!trimmed) {
    return required ? "Le téléphone est requis." : undefined;
  }
  if (!PHONE_PATTERN.test(trimmed)) {
    return "Le téléphone n'est pas valide.";
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
    return fields;
  }
  if (draft.paymentMethod === "mobile_money") {
    if (!draft.mobileOperator) {
      fields.mobileOperator = "Choisis ton opérateur Mobile Money.";
    }
  }
  const phone = phoneError(draft.customer.phone, true);
  if (phone) {
    fields.phone = phone;
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
