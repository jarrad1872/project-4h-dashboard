import { PLATFORM_COLORS, PLATFORM_LABELS, STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PlatformChip({ platform }: { platform: keyof typeof PLATFORM_LABELS }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: PLATFORM_COLORS[platform] }}
    >
      {PLATFORM_LABELS[platform]}
    </span>
  );
}

export function StatusChip({ status, className }: { status: string; className?: string }) {
  const color = STATUS_COLORS[status] ?? "#475569";

  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white", className)}
      style={{ backgroundColor: color }}
    >
      {status}
    </span>
  );
}
