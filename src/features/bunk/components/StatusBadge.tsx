import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let colorStyles = "bg-muted text-muted-foreground border-border";

  switch (status) {
    case "Active":
    case "Open":
    case "Available":
    case "Completed":
    case "Approved":
    case "Paid":
      colorStyles = "bg-success-soft text-success border-success/20";
      break;
    case "Pending":
    case "Preparing":
    case "Busy":
    case "Review":
      colorStyles = "bg-warning-soft text-warning border-warning/20";
      break;
    case "Placed":
      colorStyles = "bg-info-soft text-info border-info/20";
      break;
    case "Ready":
      colorStyles = "bg-accent text-accent-foreground border-accent-foreground/20 font-semibold";
      break;
    case "Cancelled":
    case "Rejected":
    case "Closed":
    case "Suspended":
    case "Unavailable":
      colorStyles = "bg-destructive/10 text-destructive border-destructive/20";
      break;
    default:
      colorStyles = "bg-secondary text-secondary-foreground border-border";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight transition-colors",
        colorStyles,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-75" />
      {status}
    </span>
  );
}
