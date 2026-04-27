import Link from "next/link";
import { getLegacyRouteBanner, type LegacyRouteBannerConfig } from "@/lib/navigation";
import { Card } from "@/components/ui";

export function RouteDispositionBanner({ config }: { config: LegacyRouteBannerConfig }) {
  return (
    <Card className="border-amber-800/60 bg-amber-950/20" data-testid={`legacy-route-banner-${config.route.replace("/", "")}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-300">{config.eyebrow}</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{config.title}</h2>
          <p className="mt-1 max-w-4xl text-sm text-slate-300">{config.description}</p>
          <p className="mt-2 text-xs text-amber-200">
            This page is not an external-action control and does not launch campaigns, upload ads, send outreach, create webhooks, move money, or change billing.
          </p>
        </div>
        <Link
          href={config.replacementHref}
          className="inline-flex shrink-0 items-center justify-center rounded-md border border-amber-700 px-3 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-900/40"
        >
          {config.replacementLabel}
        </Link>
      </div>
    </Card>
  );
}

export function LegacyRouteBanner({ route }: { route: string }) {
  const config = getLegacyRouteBanner(route);
  if (!config) return null;
  return <RouteDispositionBanner config={config} />;
}
