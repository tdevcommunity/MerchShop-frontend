import { OrderConfirmation } from "@/features/order/components/order-confirmation";
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

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="font-headline text-3xl">Commande</h1>
      <OrderConfirmation orderId={id} />
    </div>
  );
}
