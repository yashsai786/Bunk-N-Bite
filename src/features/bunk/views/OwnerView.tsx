import React, { useState } from "react";
import {
  Building2,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  IndianRupee,
  Mail,
  Phone,
  Search,
  ShoppingBag,
  Store,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmModal } from "../components/ConfirmModal";
import { MetricCard, MetricGrid } from "../components/MetricCard";
import { EmptyState } from "../components/States";
import { StatusBadge } from "../components/StatusBadge";
import { useBunk } from "../state";
import type { University, UniversityRequest } from "../types";

export function OwnerView() {
  const {
    activeTab,
    setActiveTab,
    universities,
    universityRequests,
    approveUniversityRequest,
    rejectUniversityRequest,
    orders,
  } = useBunk();

  const [searchQuery, setSearchQuery] = useState("");
  const [requestFilter, setRequestFilter] = useState<string>("All");
  const [selectedUnivDetail, setSelectedUnivDetail] = useState<University | null>(null);

  // Confirmation modal state for approving/rejecting
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    request: UniversityRequest;
  } | null>(null);

  const pendingRequests = universityRequests.filter((r) => r.status === "Pending");
  const activeCanteensCount = universities.reduce((sum, u) => sum + u.canteens, 0);

  const filteredUniversities = universities.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = universityRequests.filter((r) => {
    if (requestFilter === "All") return true;
    return r.status === requestFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW TAB */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Platform Overview
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Live multi-campus institutional dashboard.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("Requests")}
                className="rounded-full text-xs font-semibold"
              >
                View Requests ({pendingRequests.length})
              </Button>
            </div>
          </div>

          <MetricGrid>
            <MetricCard
              label="Universities"
              value={String(universities.length)}
              icon={Building2}
              delta="+1 this month"
              subtext="4 onboarded, 3 under review"
            />
            <MetricCard
              label="Pending Requests"
              value={String(pendingRequests.length)}
              icon={Clock}
              delta="Action required"
              subtext="Awaiting Owner Admin review"
            />
            <MetricCard
              label="Active Canteens"
              value={String(activeCanteensCount)}
              icon={Store}
              delta="+14.2%"
              subtext="Across all partner campuses"
            />
            <MetricCard
              label="Orders Today"
              value="4,286"
              icon={ShoppingBag}
              delta="+12.6%"
              subtext="₹4.82L Gross Platform GMV"
            />
          </MetricGrid>

          {/* Pending University Requests Queue */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  Incoming University Requests
                </h2>
                <p className="text-xs text-muted-foreground">
                  Institutions requesting onboarding access to BUNK N BITE.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("Requests")}
                className="text-xs font-semibold"
              >
                See all
              </Button>
            </div>

            {pendingRequests.length === 0 ? (
              <EmptyState title="No pending university requests" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="pb-3 font-semibold">University</th>
                      <th className="pb-3 font-semibold">Requested By</th>
                      <th className="pb-3 font-semibold">Campus Location</th>
                      <th className="pb-3 font-semibold">Est. Canteens</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {pendingRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 font-bold text-foreground">
                          {req.university}
                        </td>
                        <td className="py-3.5 text-muted-foreground">
                          <p className="font-semibold text-foreground">{req.requestedBy}</p>
                          <p className="text-[11px]">{req.email}</p>
                        </td>
                        <td className="py-3.5 text-muted-foreground">
                          {req.campusLocation}
                        </td>
                        <td className="py-3.5 font-semibold text-foreground">
                          {req.canteenCountEst} canteens
                        </td>
                        <td className="py-3.5">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                setConfirmAction({ type: "approve", request: req })
                              }
                              className="h-8 rounded-full bg-foreground text-background text-xs font-bold hover:bg-emerald-600 hover:text-white"
                            >
                              <Check className="mr-1 size-3.5" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setConfirmAction({ type: "reject", request: req })
                              }
                              className="h-8 rounded-full text-xs font-bold text-destructive hover:bg-destructive/10"
                            >
                              <X className="mr-1 size-3.5" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. UNIVERSITIES TAB */}
      {activeTab === "Universities" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Universities
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Authorized educational campuses on BUNK N BITE.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search university or city..."
                className="rounded-full pl-10 text-xs shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.map((univ) => (
              <div
                key={univ.id}
                className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:shadow-card"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid size-11 place-items-center rounded-2xl bg-muted font-black text-foreground">
                      {univ.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <StatusBadge status={univ.status} />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-foreground">
                    {univ.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {univ.location}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-muted/20 p-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Canteens
                      </span>
                      <p className="font-bold text-foreground text-sm">
                        {univ.canteens} outlets
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Students
                      </span>
                      <p className="font-bold text-foreground text-sm">
                        {univ.students}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="text-xs text-muted-foreground font-medium">
                    Admin: {univ.contactPerson}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUnivDetail(univ)}
                    className="h-8 rounded-full text-xs font-bold"
                  >
                    Open Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. REQUESTS TAB */}
      {activeTab === "Requests" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                University Requests
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Review and approve institutional onboarding applications.
              </p>
            </div>

            {/* Filter capsules */}
            <div className="flex gap-1 overflow-x-auto rounded-full border border-border/70 bg-card p-1 shadow-xs">
              {["All", "Pending", "Review", "Approved", "Rejected"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setRequestFilter(cat)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                    requestFilter === cat
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
            {filteredRequests.length === 0 ? (
              <EmptyState title={`No requests under '${requestFilter}' status`} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="pb-3 font-semibold">University</th>
                      <th className="pb-3 font-semibold">Requester</th>
                      <th className="pb-3 font-semibold">Contact</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5">
                          <p className="font-bold text-foreground">{req.university}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {req.campusLocation}
                          </p>
                        </td>
                        <td className="py-3.5 font-medium text-foreground">
                          {req.requestedBy}
                        </td>
                        <td className="py-3.5 text-muted-foreground text-[11px]">
                          <p>{req.email}</p>
                          <p>{req.phone}</p>
                        </td>
                        <td className="py-3.5 text-muted-foreground">{req.date}</td>
                        <td className="py-3.5">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={req.status === "Approved"}
                              onClick={() =>
                                setConfirmAction({ type: "approve", request: req })
                              }
                              className="h-8 rounded-full text-xs font-bold"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={req.status === "Rejected"}
                              onClick={() =>
                                setConfirmAction({ type: "reject", request: req })
                              }
                              className="h-8 rounded-full text-xs font-bold text-destructive hover:bg-destructive/10"
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ANALYTICS TAB */}
      {activeTab === "Analytics" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Platform Analytics
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Consolidated university campus transaction volume.
              </p>
            </div>
          </div>

          <MetricGrid>
            <MetricCard
              label="Gross GMV (Month)"
              value="₹48.2L"
              icon={IndianRupee}
              delta="+14.8%"
            />
            <MetricCard
              label="Total Orders"
              value="124,800"
              icon={ShoppingBag}
              delta="+8.2%"
            />
            <MetricCard
              label="Active Campuses"
              value="4"
              icon={Building2}
              delta="100% SLA"
            />
            <MetricCard
              label="Avg. Campus Order"
              value="₹184"
              icon={Store}
              delta="+4.1%"
            />
          </MetricGrid>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-border/70 bg-card p-6 lg:col-span-2 shadow-xs">
              <h3 className="font-bold text-foreground">Multi-Campus Order Volume (Last 12 Days)</h3>
              <p className="text-xs text-muted-foreground mt-1">Normalized daily campus checkouts.</p>

              {/* Minimalist modern bar chart */}
              <div className="mt-6 flex h-60 items-end gap-2.5 sm:gap-4 border-b border-border/60 pb-2">
                {[45, 62, 58, 80, 72, 94, 88, 100, 78, 89, 92, 85].map((val, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5 group">
                    <div
                      className="w-full rounded-t-lg bg-primary/75 transition-all group-hover:bg-primary"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">D{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-foreground">Top Performing Campuses</h3>
              <div className="divide-y divide-border/60 space-y-3">
                {universities.map((u, i) => (
                  <div key={u.id} className="pt-3 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <p className="font-bold text-foreground">{u.name}</p>
                      <p className="text-[11px] text-muted-foreground">{u.canteens} canteens</p>
                    </div>
                    <span className="font-extrabold text-foreground">
                      ₹{[18.4, 9.2, 14.1, 6.5][i]}L
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* University Detail Modal */}
      {selectedUnivDetail && (
        <Dialog open={!!selectedUnivDetail} onOpenChange={() => setSelectedUnivDetail(null)}>
          <DialogContent className="max-w-lg rounded-3xl p-6 shadow-card">
            <DialogHeader className="text-left border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold text-foreground">
                  {selectedUnivDetail.name}
                </DialogTitle>
                <StatusBadge status={selectedUnivDetail.status} />
              </div>
              <p className="text-xs text-muted-foreground">{selectedUnivDetail.location}</p>
            </DialogHeader>

            <div className="mt-4 space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Partner Since
                  </span>
                  <p className="font-bold text-foreground">{selectedUnivDetail.joinedDate}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Student Population
                  </span>
                  <p className="font-bold text-foreground">{selectedUnivDetail.students}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Active Canteens
                  </span>
                  <p className="font-bold text-foreground">{selectedUnivDetail.canteens}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Campus Admin
                  </span>
                  <p className="font-bold text-foreground">{selectedUnivDetail.contactPerson}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 p-4">
                <p className="text-xs font-bold text-foreground mb-1">Administrative Contact</p>
                <p className="text-xs text-muted-foreground">{selectedUnivDetail.contactEmail}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUnivDetail(null)}
                className="rounded-full text-xs font-semibold"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Modal for Approving / Rejecting */}
      {confirmAction && (
        <ConfirmModal
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={
            confirmAction.type === "approve"
              ? `Approve ${confirmAction.request.university}?`
              : `Reject request from ${confirmAction.request.university}?`
          }
          description={
            confirmAction.type === "approve"
              ? "The university will be granted official active status and can immediately onboard campus canteens and students."
              : "The requester will be notified of the rejection."
          }
          confirmLabel={confirmAction.type === "approve" ? "Approve University" : "Reject Request"}
          isDestructive={confirmAction.type === "reject"}
          onConfirm={() => {
            if (confirmAction.type === "approve") {
              approveUniversityRequest(confirmAction.request.id);
            } else {
              rejectUniversityRequest(confirmAction.request.id);
            }
          }}
        />
      )}
    </div>
  );
}
