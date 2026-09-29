const messages = [
  "Livraison partout au pays",
  "Retrait jour J au festival",
  "Paiement Mobile Money",
  "Editions limitees",
  "Paiement securise",
];

export function HomeMarquee() {
  return (
    <div className="flex h-14 items-center gap-10 overflow-hidden border-b border-tdev-anthracite bg-tdev-yellow px-5 lg:px-12">
      <ul className="flex min-w-max items-center gap-10">
        {[...messages, ...messages].map((message, index) => (
          <li key={`${message}-${index}`} className="flex items-center gap-10">
            <span className="font-headline text-sm font-extrabold uppercase tracking-[0.35px] whitespace-nowrap">
              {message}
            </span>
            <span className="size-2 rotate-45 bg-tdev-anthracite" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </div>
  );
}
