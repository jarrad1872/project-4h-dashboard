import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-slate-700 bg-slate-800 p-4", className)} {...props} />;
}

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300",
        className,
      )}
      {...props}
    />
  );
}

export function GhostButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-md border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700",
        className,
      )}
      {...props}
    />
  );
}
