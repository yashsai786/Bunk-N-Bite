import React, { useState } from "react";
import { toast } from "sonner";
import {
  CardGridSkeleton,
  EmptyState,
  ErrorState,
  PermissionState,
  TableSkeleton,
} from "../components/States";

export function StateGalleryView() {
  const [selectedState, setSelectedState] = useState<
    "loading" | "empty" | "error" | "restricted"
  >("loading");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            System State Gallery
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Production UI states: Skeletons, Empty, Error, and Permission boundaries.
          </p>
        </div>

        {/* State selection pills */}
        <div className="flex gap-1 rounded-full border border-border/70 bg-card p-1 shadow-xs">
          {(["loading", "empty", "error", "restricted"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold capitalize transition-colors ${
                selectedState === st
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {selectedState === "loading" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Card Grid Skeleton
              </h3>
              <CardGridSkeleton count={4} />
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Data Table Skeleton
              </h3>
              <TableSkeleton rows={4} />
            </div>
          </div>
        )}

        {selectedState === "empty" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EmptyState
              title="No active live orders"
              description="New student meal orders will appear in real-time as tickets are placed."
            />
            <EmptyState
              title="No canteen requests pending"
              description="All partner university onboarding applications have been processed."
            />
          </div>
        )}

        {selectedState === "error" && (
          <ErrorState
            title="Service temporarily unavailable"
            description="Unable to synchronize live kitchen updates. Please verify campus Wi-Fi connectivity."
            onRetry={() => toast.success("Connected to campus kitchen gateway.")}
          />
        )}

        {selectedState === "restricted" && (
          <PermissionState
            title="Administrative Access Restricted"
            description="Only designated Owner Admins may approve or reject university institutional charters."
          />
        )}
      </div>
    </div>
  );
}
