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

import { motion } from "framer-motion";

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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className="relative overflow-hidden border-border/40 shadow-sm transition-shadow hover:shadow-premium-hover rounded-[1.5rem]">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {label}
              </p>
              <p className="text-3xl font-display font-black tracking-tight tabular-nums">
                {value}
              </p>
            </div>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50",
                iconColor
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              {hasDelta ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-bold",
                    positive && "bg-emerald-500/10 text-emerald-600",
                    negative && "bg-rose-500/10 text-rose-600",
                    neutral && "bg-muted text-muted-foreground"
                  )}
                >
                  {positive && <ArrowUpRight className="h-3 w-3" />}
                  {negative && <ArrowDownRight className="h-3 w-3" />}
                  {neutral && <Minus className="h-3 w-3" />}
                  {Math.abs(delta!).toFixed(1)}%
                </span>
              ) : (
                <span className="text-muted-foreground opacity-50">—</span>
              )}
              {helper && (
                <span className="text-[10px] font-medium text-muted-foreground italic">{helper}</span>
              )}
            </div>
            {trend && trend.length > 1 && (
              <div className={cn("opacity-40 hover:opacity-100 transition-opacity", trendColor)}>
                <Sparkline data={trend} color="currentColor" width={84} height={28} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
