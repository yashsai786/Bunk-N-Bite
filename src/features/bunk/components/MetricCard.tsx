import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: string;
  subtext?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  delta,
  subtext,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:border-border hover:shadow-sm sm:p-5",
        className
      )}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-semibold tracking-tight uppercase text-muted-foreground/90">
          {label}
        </span>
        <div className="grid size-8 place-items-center rounded-xl bg-muted/60 text-foreground/80">
          <Icon className="size-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          {value}
        </span>
        {delta && (
          <span className="inline-flex items-center text-xs font-semibold text-success">
            {delta}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-[11px] text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {children}
    </div>
  );
}
