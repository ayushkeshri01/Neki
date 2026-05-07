"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const RANGES = [
  { label: "7D", value: "7" },
  { label: "30D", value: "30" },
  { label: "90D", value: "90" },
  { label: "1Y", value: "365" },
];

export function DashboardFilters({ currentRange }: { currentRange: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setRange(value: string) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("range", value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span className="font-medium text-foreground">Date range</span>
        {pending && <Loader2 className="h-3 w-3 animate-spin" />}
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-md border bg-background p-0.5">
          {RANGES.map((r) => {
            const active = currentRange === r.value;
            return (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                disabled={pending}
                className={cn(
                  "rounded px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
        <ThemeToggle variant="outline" />
      </div>
    </div>
  );
}
