import React, { useState } from "react";
import {
  Building2,
  Calendar,
  Check,
  Clock,
  Copy,
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
import { toast } from "sonner";
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

  // Success dialog displaying generated campus code upon approval
  const [newlyApprovedCode, setNewlyApprovedCode] = useState<{
    univName: string;
    code: string;
  } | null>(null);

  const pendingRequests = universityRequests.filter((r) => r.status === "Pending");
  const activeCanteensCount = universities.reduce((sum, u) => sum + u.canteens, 0);
  const totalPlatformRevenue = orders.reduce(
    (sum, o) => sum + (o.paymentStatus === "Paid" ? o.total : 0),
    0
  );
  const totalOrdersCount = orders.length;

  const filteredUniversities = universities.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = universityRequests.filter((r) => {
    if (requestFilter === "All") return true;
    return r.status === requestFilter;
  });

  return (
    <div className="space-y-5">
      {/* 1. OVERVIEW TAB */}
      {activeTab === "Overview" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Platform Operations
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Central multi-campus platform monitoring & institutional governance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("Requests")}
                className="rounded-lg text-xs font-semibold h-8"
              >
                Onboarding Requests ({pendingRequests.length})
              </Button>
            </div>
          </div>

          {/* Platform Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <MetricCard
              label="Universities"
              value={String(universities.length)}
              icon={Building2}
              delta="+1 this month"
              subtext="4 active campuses"
            />
            <MetricCard
              label="Pending Requests"
              value={String(pendingRequests.length)}
              icon={Clock}
              delta="Action required"
              subtext="Awaiting verification"
            />
            <MetricCard
              label="Active Canteens"
              value={String(activeCanteensCount)}
              icon={Store}
              delta="+14.2%"
              subtext="Food outlets enabled"
            />
            <MetricCard
              label="Orders Total"
              value={String(totalOrdersCount)}
              icon={ShoppingBag}
              delta={totalOrdersCount > 0 ? `${totalOrdersCount} recorded` : "Zero orders"}
              subtext={`₹${totalPlatformRevenue.toLocaleString("en-IN")} Platform GMV`}
            />
          </div>

          {/* Pending University Requests Review Queue */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-foreground sm:text-base">
                  Incoming University Onboarding Requests
                </h2>
                <p className="text-xs text-muted-foreground">
                  New higher-ed institutions requesting admission to the platform.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("Requests")}
                className="text-xs font-semibold text-primary hover:text-primary/90 h-8"
              >
                All Requests ({universityRequests.length})
              </Button>
            </div>

            {pendingRequests.length === 0 ? (
              <EmptyState title="No pending university requests" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase">
                      <th className="py-2.5 px-3">University</th>
                      <th className="py-2.5 px-3">Contact Person</th>
                      <th className="py-2.5 px-3">Campus Location</th>
                      <th className="py-2.5 px-3">Est. Canteens</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Approval Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {pendingRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          {req.university}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          <p className="font-semibold text-foreground">{req.requestedBy}</p>
                          <p className="text-[11px]">{req.email}</p>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {req.campusLocation}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-foreground">
                          {req.canteenCountEst} outlets
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() =>
                                setConfirmAction({ type: "approve", request: req })
                              }
                              className="h-7 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-2.5 shadow-2xs"
                            >
                              <Check className="mr-1 size-3" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setConfirmAction({ type: "reject", request: req })
                              }
                              className="h-7 rounded-md text-xs font-semibold text-destructive hover:bg-destructive/10 px-2.5 border-border"
                            >
                              <X className="mr-1 size-3" />
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
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Partner Universities
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Authorized educational campuses configured on BUNK N BITE.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search university or city..."
                className="h-8 rounded-lg pl-8 text-xs bg-card"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.map((univ) => (
              <div
                key={univ.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-9 place-items-center rounded-lg bg-muted font-bold text-foreground shrink-0 border border-border/80">
                        {univ.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          {univ.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {univ.location}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={univ.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-muted/30 p-2.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Canteens
                      </span>
                      <p className="font-bold text-foreground text-sm">
                        {univ.canteens} outlets
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Students
                      </span>
                      <p className="font-bold text-foreground text-sm">
                        {univ.students}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Code:</span>
                    <span className="font-mono text-xs font-bold text-primary">
                      {univ.campusCode || "N/A"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUnivDetail(univ)}
                    className="h-7 rounded-md text-xs font-semibold px-2.5 hover:border-primary/50"
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. REQUESTS TAB */}
      {activeTab === "Requests" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Onboarding Requests Queue
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Review, approve, or reject campus partnership applications.
              </p>
            </div>

            <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 shadow-2xs">
              {["All", "Pending", "Review", "Approved", "Rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setRequestFilter(status)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    requestFilter === status
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            {filteredRequests.length === 0 ? (
              <EmptyState title={`No requests in '${requestFilter}' status`} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase">
                      <th className="py-2.5 px-3">University</th>
                      <th className="py-2.5 px-3">Representative</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Est. Canteens</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-foreground">{req.university}</p>
                          <p className="text-[11px] text-muted-foreground">{req.campusLocation}</p>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          <p className="font-semibold text-foreground">{req.requestedBy}</p>
                          <p className="text-[11px]">{req.email} • {req.phone}</p>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{req.date}</td>
                        <td className="py-2.5 px-3 font-semibold text-foreground">
                          {req.canteenCountEst} outlets
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              disabled={req.status === "Approved"}
                              onClick={() =>
                                setConfirmAction({ type: "approve", request: req })
                              }
                              className="h-7 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-2.5 shadow-2xs"
                            >
                              <Check className="mr-1 size-3" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={req.status === "Rejected"}
                              onClick={() =>
                                setConfirmAction({ type: "reject", request: req })
                              }
                              className="h-7 rounded-md text-xs font-semibold text-destructive hover:bg-destructive/10 px-2.5 border-border"
                            >
                              <X className="mr-1 size-3" />
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
        <div className="space-y-4">
          <div className="border-b border-border/70 pb-3">
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Platform Analytics
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cross-campus dining velocity and macro platform revenue.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <MetricCard
              label="Platform GMV"
              value={`₹${totalPlatformRevenue.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              delta={totalPlatformRevenue > 0 ? "Verified gross" : "No sales recorded"}
              subtext="Live orders aggregate"
            />
            <MetricCard
              label="Total Orders"
              value={String(totalOrdersCount)}
              icon={ShoppingBag}
              delta={totalOrdersCount > 0 ? `${totalOrdersCount} placed` : "No orders yet"}
              subtext="Across all partner colleges"
            />
            <MetricCard
              label="Active Outlets"
              value={String(activeCanteensCount)}
              icon={Store}
              delta="100% active"
              subtext="Connected POS counters"
            />
            <MetricCard
              label="Partner Campuses"
              value={String(universities.length)}
              icon={Building2}
              delta="+1 Onboarded"
              subtext="Gujarat Higher Ed Region"
            />
          </div>
        </div>
      )}

      {/* University Detail Modal */}
      <Dialog
        open={!!selectedUnivDetail}
        onOpenChange={(open) => !open && setSelectedUnivDetail(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-5 shadow-card border border-border">
          {selectedUnivDetail && (
            <div className="space-y-3">
              <DialogHeader className="text-left border-b border-border/60 pb-2.5">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-base font-bold text-foreground">
                    {selectedUnivDetail.name}
                  </DialogTitle>
                  <StatusBadge status={selectedUnivDetail.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedUnivDetail.location}
                </p>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Canteens
                  </span>
                  <p className="font-bold text-foreground text-sm">
                    {selectedUnivDetail.canteens} outlets
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Students
                  </span>
                  <p className="font-bold text-foreground text-sm">
                    {selectedUnivDetail.students}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs py-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Administrator:</span>
                  <span className="font-bold text-foreground">{selectedUnivDetail.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Official Email:</span>
                  <span className="font-medium text-foreground">{selectedUnivDetail.contactEmail}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Campus Code:</span>
                  <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                    {selectedUnivDetail.campusCode || "Not generated"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Partner Since:</span>
                  <span className="font-medium text-foreground">{selectedUnivDetail.joinedDate}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={() => setSelectedUnivDetail(null)}
                  className="rounded-lg text-xs font-semibold h-8"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for University Request Approval/Rejection */}
      <ConfirmModal
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction?.type === "approve"
            ? "Approve University Onboarding?"
            : "Reject University Request?"
        }
        description={
          confirmAction?.type === "approve"
            ? `Grant platform access to ${confirmAction.request.university}. An automated admin onboarding kit will be issued.`
            : `Decline institutional onboarding application from ${confirmAction?.request.requestedBy}.`
        }
        confirmLabel={confirmAction?.type === "approve" ? "Approve Campus" : "Reject"}
        isDestructive={confirmAction?.type === "reject"}
        onConfirm={async () => {
          if (!confirmAction) return;
          if (confirmAction.type === "approve") {
            const req = confirmAction.request;
            setConfirmAction(null);
            const res = await approveUniversityRequest(req.id);
            if (res?.campusCode) {
              setNewlyApprovedCode({ univName: req.university, code: res.campusCode });
            }
          } else {
            const req = confirmAction.request;
            setConfirmAction(null);
            await rejectUniversityRequest(req.id);
          }
        }}
      />

      {/* Campus Code Issued Success Modal */}
      <Dialog
        open={!!newlyApprovedCode}
        onOpenChange={(open) => !open && setNewlyApprovedCode(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-6 shadow-card border border-border">
          {newlyApprovedCode && (
            <div className="space-y-4 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
                <Check className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-foreground">
                  Campus Approved & Activated
                </DialogTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {newlyApprovedCode.univName} is now active on BUNK N BITE.
                </p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Unique Campus Code
                </span>
                <p className="mt-1 font-mono text-2xl font-black tracking-widest text-primary">
                  {newlyApprovedCode.code}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Share this 6-character code with canteen owners so they can register their dining outlets for this campus.
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(newlyApprovedCode.code);
                    toast.success("Campus code copied to clipboard!");
                  }}
                  className="rounded-lg text-xs font-bold gap-1.5"
                >
                  <Copy className="size-3.5" />
                  Copy Campus Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setNewlyApprovedCode(null)}
                  className="rounded-lg text-xs font-semibold"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
