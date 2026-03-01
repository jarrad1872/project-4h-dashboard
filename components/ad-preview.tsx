import type { AdPlatform } from "@/lib/types";

export function AdPreview({
  platform,
  headline,
  primaryText,
  cta,
  appName,
}: {
  platform: AdPlatform;
  headline: string;
  primaryText: string;
  cta: string;
  appName?: string;
}) {
  if (platform === "youtube") {
    return (
      <div className="rounded-xl border border-slate-700 bg-black p-4">
        <div className="relative h-56 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300">YouTube Ad</p>
          <p className="mt-3 max-w-xs text-xl font-semibold text-white">{headline || "Your headline appears here"}</p>
          <p className="mt-2 max-w-sm text-sm text-slate-200">{primaryText || "Primary ad text preview"}</p>
          <div className="absolute bottom-4 right-4 rounded bg-black/70 px-3 py-1 text-xs text-white">Skip Ad</div>
          <button className="absolute bottom-4 left-4 rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white">{cta || "Learn More"}</button>
        </div>
      </div>
    );
  }

  if (platform === "facebook" || platform === "instagram") {
    return (
      <div className="mx-auto w-full max-w-[360px] rounded-2xl border border-slate-700 bg-slate-950 p-3">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-slate-600" />
          <div>
            <p className="text-sm font-semibold">{appName ?? "Saw.City"}</p>
            <p className="text-xs text-slate-400">Sponsored</p>
          </div>
        </div>
        <p className="mb-3 text-sm text-slate-100">{primaryText || "Primary ad text preview"}</p>
        <div className="mb-2 h-40 rounded-lg bg-gradient-to-br from-blue-900 to-slate-800" />
        <p className="text-sm font-semibold text-white">{headline || "Your headline appears here"}</p>
        <button className="mt-3 w-full rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white">{cta || "Learn More"}</button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-600 bg-white p-4 text-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-9 w-9 rounded-full bg-slate-300" />
        <div>
          <p className="text-sm font-semibold">{appName ?? "Saw.City"}</p>
          <p className="text-xs text-slate-500">Sponsored</p>
        </div>
      </div>
      <p className="text-sm">{primaryText || "Primary ad text preview"}</p>
      <div className="mt-3 rounded border border-slate-200 p-3">
        <p className="text-sm font-semibold">{headline || "Your headline appears here"}</p>
        <button className="mt-2 rounded bg-blue-700 px-3 py-1 text-xs font-semibold text-white">{cta || "Start now"}</button>
      </div>
    </div>
  );
}
