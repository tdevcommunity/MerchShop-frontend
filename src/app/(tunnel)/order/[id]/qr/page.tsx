import { DigitalQrPass } from "@/features/order/components/digital-qr-pass";
import { createMetadata } from "@/lib/seo/create-metadata";

type QrPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: QrPageProps) {
  const { id } = await params;
  return createMetadata({
    title: "QR Pass",
    path: `/order/${id}/qr`,
  });
}

export default async function OrderQrPage({ params }: QrPageProps) {
  const { id } = await params;
  return <DigitalQrPass orderId={id} />;
}
