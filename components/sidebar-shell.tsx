import Link from "next/link";
import { legacyNavigationItems, navigationGroups } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function SidebarNav() {
  return (
    <nav className="space-y-5" data-testid="primary-sidebar-nav">
      {navigationGroups.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{group.label}</p>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                "text-slate-200 hover:bg-slate-700/60 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}

      <details className="px-3 text-xs text-slate-500" data-testid="legacy-sidebar-nav">
        <summary className="cursor-pointer select-none font-semibold uppercase tracking-wide hover:text-slate-300">
          Reference Shelf
        </summary>
        <div className="mt-2 space-y-1 border-l border-slate-700 pl-3">
          {legacyNavigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-700/50 hover:text-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </details>
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
