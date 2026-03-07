"use client";

import Link from "next/link";
import { Card } from "@/components/ui";

const DEAL_STRUCTURE = [
  { tier: "Micro", followers: "5k–50k", flatFee: "$150–$300", commission: "20% recurring (~$8/mo)", promo: "First month free" },
  { tier: "Mid", followers: "50k–200k", flatFee: "$500–$1,500", commission: "20% recurring (~$8/mo)", promo: "First month free" },
  { tier: "Top", followers: "200k+", flatFee: "$2,000+", commission: "20% recurring (~$8/mo)", promo: "First month free + co-branded domain" },
];

const TRADE_PACKS = [
  { domain: "saw.city", trade: "Concrete Cutting", hook: "You're cutting concrete. Your phone is 30 feet away. A customer just called your competitor.", slug: "saw", tier: "flagship" },
  { domain: "eave.city", trade: "Roofing", hook: "A roofer on a 3-story pitch literally cannot answer their phone. Every unanswered call is a job gone.", slug: "eave", tier: "1" },
  { domain: "crimp.city", trade: "Electrical", hook: "Electricians are in panels, in crawl spaces, in conduit. They can't answer. The next electrician on Google can.", slug: "crimp", tier: "1" },
  { domain: "pipe.city", trade: "Plumbing", hook: "Plumbing emergencies don't wait — your customer called three companies and went with whoever answered first.", slug: "pipe", tier: "1" },
  { domain: "duct.city", trade: "HVAC", hook: "It's 100 degrees outside. Your customer's AC died. They called you, got voicemail, and hired someone else in 4 minutes.", slug: "duct", tier: "1" },
  { domain: "pave.city", trade: "Paving", hook: "You're running a crew, the roller's going, and your phone is in a 120° truck cab. Someone just wanted a quote.", slug: "pave", tier: "2" },
  { domain: "rooter.city", trade: "Drain / Rooter", hook: "Sewage backup. 3 AM. They called you first. You didn't answer. They called the next guy.", slug: "rooter", tier: "2" },
  { domain: "pest.city", trade: "Pest Control", hook: "Someone's got roaches in their kitchen. They're calling every pest control number they can find. Who picks up wins.", slug: "pest", tier: "1" },
  { domain: "prune.city", trade: "Tree Service", hook: "Storm took down a tree. Homeowner needs it gone today. You're running a chipper and can't hear your phone.", slug: "prune", tier: "2" },
  { domain: "haul.city", trade: "Hauling", hook: "Junk removal is a race. First to answer books the job. Your competitors all answer. Do you?", slug: "haul", tier: "2" },
  { domain: "wrench.city", trade: "Auto Mechanics", hook: "Car's dead in a parking lot. Customer needs a mechanic now. They're calling 4 shops. First one answers gets the job.", slug: "wrench", tier: "3" },
  { domain: "coat.city", trade: "Painting / Coatings", hook: "Painting quotes are competitive. The contractor who calls back first gets the walkthrough. The rest get ghosted.", slug: "coat", tier: "1" },
  { domain: "grade.city", trade: "Grading / Excavation", hook: "You're on a site. Equipment running. Phone's in the truck. GC just called with a change order opportunity.", slug: "grade", tier: "2" },
  { domain: "mow.city", trade: "Lawn Care", hook: "You've got 12 yards to do today. You can't answer every call. But your customer can call someone else in 10 seconds.", slug: "mow", tier: "1" },
  { domain: "detail.city", trade: "Auto Detailing", hook: "You're wrist-deep in a full detail. Both hands occupied. Customer wants a same-week booking — or they book someone else.", slug: "detail", tier: "3" },
  { domain: "plow.city", trade: "Snow Plowing", hook: "It's 3 AM, blizzard, and every property manager in town is calling for emergency plowing. You're in the cab. Who answers?", slug: "plow", tier: "2" },
  { domain: "wreck.city", trade: "Demolition", hook: "Demo contractors get called for quotes on a Tuesday. If you're on site and don't answer, the project manager moves on.", slug: "wreck", tier: "2" },
  { domain: "chimney.city", trade: "Chimney Service", hook: "It's fall. Everyone's firing up fireplaces. The calls are coming in fast. One unanswered call is a $300 inspection gone.", slug: "chimney", tier: "3" },
  { domain: "lockout.city", trade: "Locksmith", hook: "Someone's locked out of their car at 9 PM. They'll call 5 locksmiths. First to answer gets a $150 job in 15 minutes.", slug: "lockout", tier: "2" },
  { domain: "rinse.city", trade: "Pressure Washing", hook: "Spring cleaning season hit. Every homeowner wants their driveway done. You can't run a wand and answer your phone.", slug: "rinse", tier: "3" },
];

const CARRIERS = [
  { name: "AT&T", code: "**61*+1XXXXXXXXXX#", steps: "Settings > Phone > Call Forwarding > Forward When Unanswered" },
  { name: "Verizon", code: "*71 + number", steps: "My Verizon app > Account > Call Forwarding > No Answer" },
  { name: "T-Mobile", code: "**61*+1XXXXXXXXXX#", steps: "T-Mobile app > Account > Advanced Calling > Call Forwarding" },
  { name: "iPhone", code: "Via carrier settings", steps: "Settings > Phone > Call Forwarding (carrier-dependent)" },
  { name: "Android", code: "Via carrier settings", steps: "Phone app > ⋮ Menu > Settings > Calls > Call Forwarding > Forward When Unanswered" },
];

export default function InfluencerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm">← Back</Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 text-sm">Influencer Program</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-2">🤝 Influencer Campaign</h1>
        <p className="text-slate-400 text-sm">Launch: <span className="text-green-400 font-medium">March 15, 2026</span> · Manager: <span className="text-slate-300">Erin</span> · Price: <span className="text-green-400 font-medium">$39/mo</span></p>
      </div>

      {/* Strategy Banner */}
      <Card className="border-green-800/40 bg-green-950/20">
        <div className="space-y-2">
          <p className="text-green-400 font-semibold text-sm uppercase tracking-wide">Strategy</p>
          <p className="text-slate-200">
            Market each trade domain as if it's a <strong>custom-built solution for that trade</strong>. No answered.city branding externally.
            Erin finds and closes influencers — we give her everything to work with.
          </p>
          <div className="flex gap-4 pt-1 text-sm text-slate-400">
            <span>📁 <Link href="/creatives" className="text-blue-400 hover:underline">Existing Creatives</Link> — reuse for trade packs</span>
            <span>📋 <Link href="/approval" className="text-blue-400 hover:underline">Ad Approval Queue</Link></span>
          </div>
        </div>
      </Card>

      {/* Deal Structure */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">💰 Deal Structure</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-2 pr-6">Tier</th>
                <th className="pb-2 pr-6">Followers</th>
                <th className="pb-2 pr-6">Flat Fee</th>
                <th className="pb-2 pr-6">Commission</th>
                <th className="pb-2">Promo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {DEAL_STRUCTURE.map((row) => (
                <tr key={row.tier} className="text-slate-300">
                  <td className="py-2 pr-6 font-medium text-white">{row.tier}</td>
                  <td className="py-2 pr-6">{row.followers}</td>
                  <td className="py-2 pr-6 text-green-400">{row.flatFee}</td>
                  <td className="py-2 pr-6 text-blue-400">{row.commission}</td>
                  <td className="py-2 text-slate-400">{row.promo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-slate-500 text-xs">Recurring commission is the hook — influencers who drive 50 signups earn $400/mo passively. They keep promoting without being paid again.</p>
      </div>

      {/* Carrier Setup */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">📱 Carrier Setup (2-Minute Onboarding)</h2>
        <p className="text-slate-400 text-sm">User sets conditional call forwarding on no-answer to their assigned AI number. No porting. No new apps. 2 minutes max.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CARRIERS.map((c) => (
            <Card key={c.name} className="space-y-2">
              <p className="font-semibold text-white">{c.name}</p>
              <code className="text-xs text-green-400 bg-slate-900 px-2 py-1 rounded block">{c.code}</code>
              <p className="text-xs text-slate-400">{c.steps}</p>
            </Card>
          ))}
        </div>
        <p className="text-slate-500 text-xs">Full guides with screenshots in <code className="text-slate-400">projects/answered-city/influencer-package/carrier-setup-guides.md</code></p>
      </div>

      {/* Trade Content Packs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">🏗️ Trade Content Packs</h2>
          <span className="text-slate-500 text-sm">{TRADE_PACKS.length} trades ready</span>
        </div>
        <p className="text-slate-400 text-sm">Each pack includes: target influencer types, trade-specific hook, value prop, sample TikTok/IG caption, 30–60s video script, and hashtags.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TRADE_PACKS.map((t) => (
            <Card key={t.domain} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white text-sm">{t.trade}</p>
                  <p className="text-blue-400 text-xs">{t.domain}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                  t.tier === "flagship" ? "border-purple-600 text-purple-300 bg-purple-950/30" :
                  t.tier === "1" ? "border-green-700 text-green-300 bg-green-950/20" :
                  t.tier === "2" ? "border-blue-700 text-blue-300 bg-blue-950/20" :
                  "border-slate-600 text-slate-400"
                }`}>
                  {t.tier === "flagship" ? "★ Flagship" : `Tier ${t.tier}`}
                </span>
              </div>
              <p className="text-slate-400 text-xs italic">&ldquo;{t.hook}&rdquo;</p>
            </Card>
          ))}
        </div>
        <p className="text-slate-500 text-xs">Full packs in <code className="text-slate-400">projects/answered-city/influencer-package/trade-content-packs/</code></p>
      </div>

      {/* Docs */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">📄 Erin&apos;s Package</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: "Product Brief", desc: "What the product does, who it's for, pricing, how it works. Erin's pitch document.", file: "product-brief.md" },
            { title: "Influencer Brief Template", desc: "One-pager Erin sends to each influencer. Fill in [TRADE], [DOMAIN], [NAME].", file: "influencer-brief-template.md" },
            { title: "Carrier Setup Guides", desc: "Step-by-step for AT&T, Verizon, T-Mobile, iPhone, Android.", file: "carrier-setup-guides.md" },
            { title: "README", desc: "Package overview and how to use all the pieces.", file: "README.md" },
          ].map((doc) => (
            <Card key={doc.file} className="space-y-1">
              <p className="font-semibold text-white text-sm">{doc.title}</p>
              <p className="text-slate-400 text-xs">{doc.desc}</p>
              <code className="text-xs text-slate-500">influencer-package/{doc.file}</code>
            </Card>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <Card className="border-amber-700/40 bg-amber-950/20">
        <p className="text-amber-400 font-semibold text-sm uppercase tracking-wide mb-3">Next Steps</p>
        <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
          <li>Jarrad reviews content package — adjust anything before handing to Erin</li>
          <li>Share package with Erin (docs + creatives at /creatives)</li>
          <li>Erin identifies first 5–10 influencers per priority trades (pipe, eave, duct, crimp, mow)</li>
          <li>Jarrad approves deal structure per influencer before Erin closes</li>
          <li>Set up unique promo codes per influencer (track in Stripe + analytics)</li>
          <li>Finalize trade mapping spreadsheet → domain DNS wiring via GoDaddy + Vercel API</li>
          <li>🚀 Launch: March 15, 2026</li>
        </ol>
      </Card>
    </div>
  );
}
