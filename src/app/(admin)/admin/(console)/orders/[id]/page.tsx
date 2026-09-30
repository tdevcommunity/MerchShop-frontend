import { redirect } from "next/navigation";

type OrderDetailRedirectProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: OrderDetailRedirectProps) {
  const { id } = await params;
  redirect(`/admin/orders?order=${encodeURIComponent(id)}`);
}
