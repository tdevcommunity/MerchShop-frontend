import { InformationForm } from "@/features/checkout/components/information-form";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "Informations",
  path: "/checkout/information",
});

export default function CheckoutInformationPage() {
  return <InformationForm />;
}
