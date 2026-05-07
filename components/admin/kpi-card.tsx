import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/admin/charts";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number; // percentage change vs prior period
  icon: LucideIcon;
  iconColor?: string;
  trend?: number[];
  trendColor?: string;
  helper?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  trendColor,
  helper,
}: KpiCardProps) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const positive = hasDelta && delta! > 0;
  const negative = hasDelta && delta! < 0;
  const neutral = hasDelta && delta === 0;

  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {value}
            </p>
          </div>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg bg-muted",
              iconColor
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            {hasDelta ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
                  positive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  negative && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                  neutral && "bg-muted text-muted-foreground"
                )}
              >
                {positive && <ArrowUpRight className="h-3 w-3" />}
                {negative && <ArrowDownRight className="h-3 w-3" />}
                {neutral && <Minus className="h-3 w-3" />}
                {Math.abs(delta!).toFixed(1)}%
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
            {helper && (
              <span className="text-muted-foreground">{helper}</span>
            )}
          </div>
          {trend && trend.length > 1 && (
            <div className={cn("text-muted-foreground", trendColor)}>
              <Sparkline data={trend} color="currentColor" width={84} height={28} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
