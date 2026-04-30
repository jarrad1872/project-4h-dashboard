import Link from "next/link";
import { Card } from "@/components/ui";
import { PIPE_CITY_DEMO_LINE, salesReps } from "@/lib/sales-rep-pipeline";
import { DemoCallButton } from "./demo-call-button";

export default async function DustinFieldLanding({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rep = salesReps[0];
  const tracked = params.tracked === "1";
  const card = typeof params.card === "string" ? params.card : "dustin-pipe-proof-sheet";
  const telHref = `tel:${PIPE_CITY_DEMO_LINE.replace(/[^0-9]/g, "")}`;

  return (
    <div className="mx-auto max-w-3xl space-y-5" data-testid="dustin-field-landing">
      <Card className="border-amber-900/60 bg-amber-950/10">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">pipe.city Arizona demo</p>
        <h1 className="mt-2 text-3xl font-black text-white">Call the plumbing AI Agent demo line.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Hear the agent answer a plumbing call, capture the job details, and text the owner summary while the crew keeps
          working.
        </p>
        <DemoCallButton phoneLabel={PIPE_CITY_DEMO_LINE} telHref={telHref} />
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
          <p className="font-semibold text-white">{rep.name}</p>
          <p>{rep.role}</p>
          <p>{rep.phone}</p>
          <p>{rep.email}</p>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What this logs</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {tracked
            ? "This card scan was logged for field-sales attribution."
            : "Use the tracked card URL or QR path to log this visit before the owner lands here."}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Card: {card}. The demo button logs demo-call intent, then opens the phone dialer. No outreach, billing, ad
          launch, or webhook runs from this page.
        </p>
      </Card>

      <Link href="/sales" className="inline-flex text-sm font-semibold text-emerald-300 hover:text-emerald-200">
        Back to Sales
      </Link>
    </div>
  );
}
