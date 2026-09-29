import type { CheckoutDraft, CustomerInfo } from "@/types/checkout";
import { DELIVERY_METHODS } from "@/types/delivery";
import type { ShippingAddress } from "@/types/delivery";
import { ValidationError } from "@/lib/api/errors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\s().-]{8,20}$/;

export function validateCustomer(customer: CustomerInfo): Record<string, string> {
  const fields: Record<string, string> = {};

  if (!customer.firstName.trim()) {
    fields.firstName = "Le prénom est requis.";
  }
  if (!customer.lastName.trim()) {
    fields.lastName = "Le nom est requis.";
  }
  if (!EMAIL_PATTERN.test(customer.email.trim())) {
    fields.email = "L'email n'est pas valide.";
  }
  if (!PHONE_PATTERN.test(customer.phone.trim())) {
    fields.phone = "Le téléphone n'est pas valide.";
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
  if (!address.line1.trim()) {
    fields.line1 = "L'adresse est requise.";
  }
  if (!address.city.trim()) {
    fields.city = "La ville est requise.";
  }
  if (!address.country.trim()) {
    fields.country = "Le pays est requis.";
  }
  return fields;
}

export function validateCheckoutDraft(draft: CheckoutDraft): void {
  const fields = { ...validateCustomer(draft.customer) };

  if (!draft.deliveryMethod) {
    fields.deliveryMethod = "Choisis un mode de réception.";
  }

  if (draft.deliveryMethod === DELIVERY_METHODS.DELIVERY) {
    Object.assign(fields, validateShippingAddress(draft.shippingAddress));
  }

  if (Object.keys(fields).length > 0) {
    throw new ValidationError(fields);
  }
}
