import { siteConfig } from "@/lib/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-white/50">
        <p>
          {siteConfig.name} — {siteConfig.festival}
        </p>
        <p>
          Les montants et QR affichés ici restent indicatifs tant que le backend
          n&apos;est pas branché.
        </p>
      </div>
    </footer>
  );
}
