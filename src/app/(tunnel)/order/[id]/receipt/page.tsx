import { DigitalReceipt } from "@/features/order/components/digital-receipt";
import { createMetadata } from "@/lib/seo/create-metadata";

type ReceiptPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ReceiptPageProps) {
  const { id } = await params;
  return createMetadata({
    title: "Reçu digital",
    path: `/order/${id}/receipt`,
  });
}

export default async function OrderReceiptPage({ params }: ReceiptPageProps) {
  const { id } = await params;
  return <DigitalReceipt orderId={id} />;
}
