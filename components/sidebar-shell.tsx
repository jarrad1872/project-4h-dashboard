import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Command" },
  { href: "/influencer", label: "Creators" },
  { href: "/assets", label: "Creative Lab" },
  { href: "/scorecard", label: "Scorecard" },
  { href: "/approval", label: "Approval" },
  { href: "/generate", label: "AI Studio" },
  { href: "/ads", label: "Ad Archive" },
  { href: "/launch", label: "Launch" },
  { href: "/budget", label: "Budget" },
  { href: "/gtm", label: "Legacy GTM" },
  { href: "/settings", label: "Settings" },
];

function SidebarNav() {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "text-slate-300 hover:bg-slate-700/60 hover:text-white",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function SidebarShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <aside className="fixed left-0 top-0 hidden h-screen w-60 border-r border-slate-700 bg-slate-800 p-4 md:block">
        <p className="mb-1 text-lg font-bold text-emerald-300">Project 4H</p>
        <p className="mb-6 text-xs uppercase tracking-wide text-slate-500">Answered.City growth OS</p>
        <SidebarNav />
      </aside>

      <div className="border-b border-slate-700 bg-slate-800 p-3 md:hidden">
        <p className="font-bold text-emerald-300">Project 4H</p>
        <div className="mt-3 rounded-md border border-slate-700 bg-slate-800 p-2">
          <SidebarNav />
        </div>
      </div>

      <main className="p-4 md:ml-60 md:p-8">{children}</main>
    </div>
  );
}
