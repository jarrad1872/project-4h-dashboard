"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/gtm", label: "GTM Board" },
  { href: "/ads", label: "Ads" },
  { href: "/workflow", label: "Workflow" },
  { href: "/creatives", label: "Creatives" },
  { href: "/assets", label: "Trade Assets" },
  { href: "/templates", label: "Templates" },
  { href: "/generate", label: "AI Studio" },
  { href: "/approval", label: "Approval" },
  { href: "/lifecycle", label: "Lifecycle" },
  { href: "/scorecard", label: "Scorecard" },
  { href: "/budget", label: "Budget" },
  { href: "/launch", label: "Launch" },
  { href: "/settings", label: "Settings" },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/60 hover:text-white",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <aside className="fixed left-0 top-0 hidden h-screen w-60 border-r border-slate-700 bg-slate-800 p-4 md:block">
        <p className="mb-6 text-lg font-bold text-green-400">Project 4H</p>
        <SidebarNav />
      </aside>

      <div className="border-b border-slate-700 bg-slate-800 p-3 md:hidden">
        <div className="flex items-center justify-between">
          <p className="font-bold text-green-400">Project 4H</p>
          <button
            type="button"
            className="rounded-md border border-slate-600 p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {open && (
          <div className="mt-3 rounded-md border border-slate-700 bg-slate-800 p-2">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>

      <main className="p-4 md:ml-60 md:p-8">{children}</main>
    </div>
  );
}
