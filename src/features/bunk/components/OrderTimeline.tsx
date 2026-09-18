import React from "react";
import { Check, Clock, PackageCheck, Store, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "../types";
import { StatusBadge } from "./StatusBadge";

const stages: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: "Placed", label: "Order Placed", icon: Check },
  { status: "Preparing", label: "In Kitchen", icon: Utensils },
  { status: "Ready", label: "Ready for Pickup", icon: Clock },
  { status: "Completed", label: "Completed", icon: PackageCheck },
];

export function OrderTimeline({ order }: { order: Order }) {
  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case "Placed":
        return 0;
      case "Preparing":
        return 1;
      case "Ready":
        return 2;
      case "Completed":
        return 3;
      case "Cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(order.status);
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              {order.id}
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
              {order.tokenNumber}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Placed {order.placedAt} • {order.paymentMethod} (Paid)
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Progress Timeline */}
      {!isCancelled ? (
        <div className="my-8">
          <div className="relative grid grid-cols-4 gap-2">
            {/* Background track line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 -translate-y-1/2 bg-border/80" />
            {/* Active filled line */}
            <div
              className="absolute top-4 left-6 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500"
              style={{
                width: `${Math.min(100, (currentIndex / 3) * 85)}%`,
              }}
            />

            {stages.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const Icon = stage.icon;

              return (
                <div key={stage.status} className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "grid size-8 place-items-center rounded-full border-2 transition-all duration-300 sm:size-9",
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground shadow-xs ring-4 ring-primary/20 scale-110"
                        : isPast
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    <Icon className="size-3.5 sm:size-4" />
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-[11px] font-medium tracking-tight sm:text-xs",
                      isCurrent
                        ? "font-bold text-foreground"
                        : isPast
                        ? "text-muted-foreground"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="my-6 rounded-2xl bg-destructive/10 p-4 text-center text-sm font-semibold text-destructive">
          This order was cancelled.
        </div>
      )}

      {/* Pickup counter highlight */}
      <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-card border border-border/70 text-foreground">
            <Store className="size-4.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Pickup Instructions
            </p>
            <p className="text-sm font-bold text-foreground">
              {order.canteenName} — {order.pickupCounter}
            </p>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="mt-5 space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Items Ordered
        </p>
        <div className="divide-y divide-border/50 rounded-2xl border border-border/70 bg-card p-3 sm:p-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 text-xs sm:text-sm">
              <span className="font-medium text-foreground">
                <span className="font-bold text-primary mr-2">{item.quantity}×</span>
                {item.name}
              </span>
              <span className="font-semibold text-foreground">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex items-center justify-between pt-1.5 text-xs text-muted-foreground">
            <span>Platform Tax (5%)</span>
            <span>₹{order.platformTax}</span>
          </div>
          <div className="flex items-center justify-between pt-2 text-sm font-black text-foreground">
            <span>Total Paid</span>
            <span className="text-base text-primary">₹{order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
