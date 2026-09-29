import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 px-5 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:px-12">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
  );
}
