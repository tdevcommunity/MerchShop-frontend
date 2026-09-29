import { redirect } from "next/navigation";
import { createMetadata } from "@/lib/seo/create-metadata";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: OrderPageProps) {
  const { id } = await params;
  return createMetadata({
    title: "Commande",
    path: `/order/${id}`,
  });
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  redirect(`/checkout/confirmation?orderId=${encodeURIComponent(id)}`);
}
