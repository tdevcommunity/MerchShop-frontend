import { Skeleton } from "@/components/ui/skeleton";

export default function OrderLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
