type AdminStateProps = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
};

export function AdminState({
  loading,
  error,
  empty,
  emptyTitle = "Aucune donnée",
  emptyHint,
}: AdminStateProps) {
  if (error) {
    return (
      <p role="alert" className="border border-tdev-orange bg-tdev-white p-4 text-sm text-tdev-orange">
        {error}
      </p>
    );
  }
  if (loading) {
    return <p className="text-sm text-tdev-muted">Chargement…</p>;
  }
  if (empty) {
    return (
      <div className="border border-dashed border-tdev-anthracite bg-tdev-white p-8">
        <p className="font-headline text-xl font-extrabold uppercase">{emptyTitle}</p>
        {emptyHint ? <p className="mt-2 text-sm text-tdev-muted">{emptyHint}</p> : null}
      </div>
    );
  }
  return null;
}
