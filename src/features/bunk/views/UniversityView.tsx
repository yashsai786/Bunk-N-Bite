import React, { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Coffee,
  Copy,
  Eye,
  IndianRupee,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Store,
  Users,
  UtensilsCrossed,
  X,
  FileSpreadsheet,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  UserPlus,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UniversityStudentMember } from "@/features/auth/types";
import { AddStudentModal } from "@/features/students/components/AddStudentModal";
import { BulkImportModal } from "@/features/students/components/BulkImportModal";
import { BulkActionsModal } from "@/features/students/components/BulkActionsModal";
import { StudentDetailModal } from "@/features/students/components/StudentDetailModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmModal } from "../components/ConfirmModal";
import { FoodEmojiBadge, getFoodEmoji } from "../components/FoodEmoji";
import { MetricCard, MetricGrid } from "../components/MetricCard";
import { EmptyState } from "../components/States";
import { StatusBadge } from "../components/StatusBadge";
import { useBunk } from "../state";
import type { Canteen, CanteenRequest, Order } from "../types";

function CanteenOperationalToggle({
  canteen,
  disabled,
  onToggle,
}: {
  canteen: Canteen;
  disabled?: boolean;
  onToggle: (canteen: Canteen) => void;
}) {
  const isSuspended =
    canteen.operationalStatus === "Suspended" || canteen.status === "Closed";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isSuspended}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(canteen);
      }}
      className={`relative inline-flex h-6 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isSuspended
          ? "bg-rose-600 hover:bg-rose-700"
          : "bg-emerald-600 hover:bg-emerald-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      title={
        isSuspended
          ? "Canteen is Suspended (Click to activate)"
          : "Canteen is Active (Click to suspend)"
      }
    >
      <span
        className={`absolute text-[10px] font-extrabold tracking-wider text-white select-none transition-opacity ${
          isSuspended ? "right-1.5" : "left-1.5"
        }`}
      >
        {isSuspended ? "OFF" : "ON"}
      </span>
      <span
        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          isSuspended ? "translate-x-0.5" : "translate-x-8.5"
        }`}
      />
    </button>
  );
}

export function UniversityView() {
  const {
    activeTab,
    setActiveTab,
    selectedUniversityId,
    universities,
    canteens,
    canteenRequests,
    approveCanteenRequest,
    rejectCanteenRequest,
    toggleCanteenOperationalStatus,
    students,
    orders,
    universityMembers,
    currentUser,
  } = useBunk();

  const [canteenSubView, setCanteenSubView] = useState<"canteens" | "requests">("canteens");
  const [canteenSearch, setCanteenSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<"All" | "active" | "suspended" | "pending">("All");
  const [studentPage, setStudentPage] = useState(1);
  const studentPageSize = 10;
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<UniversityStudentMember | null>(null);

  const [orderFilter, setOrderFilter] = useState<string>("All");
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [canteenToSuspend, setCanteenToSuspend] = useState<Canteen | null>(null);
  const [isUpdatingCanteenId, setIsUpdatingCanteenId] = useState<string | null>(null);

  const handleToggleOperational = async (target: Canteen, newStatus: "Active" | "Suspended") => {
    setIsUpdatingCanteenId(target.id);
    try {
      await toggleCanteenOperationalStatus(target.id, newStatus);
    } catch (err: any) {
      console.error("Failed to toggle canteen operational status:", err);
    } finally {
      setIsUpdatingCanteenId(null);
    }
  };

  // New canteen modal
  const [isAddCanteenOpen, setIsAddCanteenOpen] = useState(false);
  const [newCanteenName, setNewCanteenName] = useState("");
  const [newCanteenOwner, setNewCanteenOwner] = useState("");
  const [newCanteenLocation, setNewCanteenLocation] = useState("");

  // Confirmation modal for canteen request
  const [canteenConfirm, setCanteenConfirm] = useState<{
    type: "approve" | "reject";
    request: CanteenRequest;
  } | null>(null);

  const activeUniv =
    universities.find((u) => u.id === selectedUniversityId) || universities[0];

  const univCanteens = canteens.filter(
    (c) => c.universityId === selectedUniversityId
  );

  const univRequests = canteenRequests.filter(
    (r) => r.universityId === selectedUniversityId
  );

  const pendingRequests = univRequests.filter((r) => r.status === "Pending");

  const univOrders = orders.filter(
    (o) => o.universityId === selectedUniversityId
  );

  const univRevenue = univOrders.reduce(
    (sum, o) => sum + (o.paymentStatus === "Paid" ? o.total : 0),
    0
  );
  const completedOrdersCount = univOrders.filter((o) => o.status === "Completed").length;

  const filteredOrders = univOrders.filter((o) => {
    if (orderFilter === "All") return true;
    return o.status === orderFilter;
  });

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredCanteens = univCanteens.filter((c) =>
    c.name.toLowerCase().includes(canteenSearch.toLowerCase()) ||
    c.owner.toLowerCase().includes(canteenSearch.toLowerCase())
  );

  if (!activeUniv) {
    return (
      <div className="py-12">
        <EmptyState
          title="No universities active yet"
          description="Campus onboarding requests are awaiting approval or no university records exist in the database."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. OVERVIEW TAB */}
      {activeTab === "Overview" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {activeUniv.name}
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Campus operations & catering management dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dedicated Compact Campus Code Section */}
              <div className="flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 shadow-2xs">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Campus Code
                  </span>
                  <span className="font-mono text-sm font-black tracking-widest text-primary">
                    {activeUniv.campusCode || "AU2026"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const code = activeUniv.campusCode || "AU2026";
                    navigator.clipboard.writeText(code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="h-7 px-2 text-xs font-semibold hover:bg-primary/10"
                  title="Copy campus code for canteen onboarding"
                >
                  {copiedCode ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <Check className="size-3.5" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-primary">
                      <Copy className="size-3.5" /> Copy Code
                    </span>
                  )}
                </Button>
              </div>

              <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {univCanteens.length} Canteens Online
              </span>
            </div>
          </div>

          {/* Compact Overview KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <MetricCard
              label="Orders Total"
              value={String(univOrders.length)}
              icon={ShoppingBag}
              delta={univOrders.length > 0 ? `${univOrders.length} placed` : "Zero orders"}
              subtext="Across all campus counters"
            />
            <MetricCard
              label="Revenue"
              value={`₹${univRevenue.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              delta={univRevenue > 0 ? "Verified sales" : "No sales yet"}
              subtext="Gross catering volume"
            />
            <MetricCard
              label="Active Canteens"
              value={String(univCanteens.length)}
              icon={Store}
              delta="All online"
              subtext="Operational outlets"
            />
            <MetricCard
              label="Students"
              value={activeUniv.students}
              icon={Users}
              delta="+126 this term"
              subtext="Registered campus users"
            />
          </div>

          {/* Canteen Access Requests Review Queue */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-foreground sm:text-base">
                  Canteen Access Requests
                </h2>
                <p className="text-xs text-muted-foreground">
                  Vendor applications awaiting University Admin approval.
                </p>
              </div>
              <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                {pendingRequests.length} Pending
              </span>
            </div>

            {univRequests.length === 0 ? (
              <EmptyState title="No canteen requests pending" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase">
                      <th className="py-2.5 px-3">Canteen / Brand</th>
                      <th className="py-2.5 px-3">Owner Contact</th>
                      <th className="py-2.5 px-3">Cuisine</th>
                      <th className="py-2.5 px-3">Submitted</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {univRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          {req.canteenName}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          <p className="font-semibold text-foreground">{req.ownerName}</p>
                          <p className="text-[11px]">{req.email} • {req.phone}</p>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{req.cuisine}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{req.date}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              disabled={req.status === "Approved"}
                              onClick={() =>
                                setCanteenConfirm({ type: "approve", request: req })
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
                                setCanteenConfirm({ type: "reject", request: req })
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

          {/* Live Campus Orders Feed */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-foreground sm:text-base">
                  Live Campus Orders Feed
                </h2>
                <p className="text-xs text-muted-foreground">
                  Synchronized transactions across all university counters.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("Orders")}
                className="text-xs font-semibold text-primary hover:text-primary/90 h-8"
              >
                View all orders <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </div>

            {univOrders.length === 0 ? (
              <EmptyState title="No orders today" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Canteen</th>
                      <th className="py-2.5 px-3">Ordered Items</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {univOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          {order.id} <span className="font-mono text-[10px] text-muted-foreground">({order.tokenNumber})</span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {order.customer}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {order.canteenName}
                        </td>
                        <td className="py-2.5 px-3 text-foreground max-w-[220px] truncate">
                          <span className="flex items-center gap-1 truncate">
                            {order.items.map((i, idx) => (
                              <span key={idx} className="inline-flex items-center gap-0.5">
                                <span>{getFoodEmoji(i.name)}</span>
                                <span>{i.quantity}× {i.name}</span>
                                {idx < order.items.length - 1 && <span className="text-muted-foreground mr-1">,</span>}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-extrabold text-foreground">
                          ₹{order.total}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="h-7 text-xs font-semibold rounded-md px-2.5"
                          >
                            Inspect
                          </Button>
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

      {/* 2. CANTEENS TAB */}
      {(activeTab === "Canteens" || activeTab === "Canteen Requests") && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Campus Canteens
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Manage authorized dining vendors and review onboarding requests.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Sub-view toggle capsules */}
              <div className="flex gap-1 rounded-lg border border-border bg-card p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setCanteenSubView("canteens")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    canteenSubView === "canteens"
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Operating Canteens ({filteredCanteens.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCanteenSubView("requests")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors flex items-center gap-1 ${
                    canteenSubView === "requests"
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span>Access Requests</span>
                  {pendingRequests.length > 0 && (
                    <span className="rounded-full bg-accent px-1.5 py-0.2 text-[10px] font-bold text-accent-foreground">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
              </div>

              {canteenSubView === "canteens" && (
                <div className="relative w-48 sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={canteenSearch}
                    onChange={(e) => setCanteenSearch(e.target.value)}
                    placeholder="Search canteens..."
                    className="h-8 rounded-lg pl-8 text-xs bg-card"
                  />
                </div>
              )}
            </div>
          </div>

          {canteenSubView === "canteens" ? (
            /* Compact Canteens Table / Cards with Operational Toggle */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {filteredCanteens.map((canteen) => {
                const isSuspended =
                  canteen.operationalStatus === "Suspended" || canteen.status === "Closed";

                return (
                  <div
                    key={canteen.id}
                    className={`flex flex-col justify-between rounded-xl border bg-card p-3.5 shadow-xs transition-colors ${
                      isSuspended
                        ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/15 dark:bg-rose-950/10"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`grid size-8 place-items-center rounded-lg shrink-0 ${
                              isSuspended
                                ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30"
                                : "bg-muted text-primary"
                            }`}
                          >
                            <Store className="size-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-sm truncate">
                              {canteen.name}
                            </h3>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {canteen.owner}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {isSuspended ? (
                            <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 border border-rose-500/25">
                              SUSPENDED
                            </span>
                          ) : (
                            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 border border-emerald-500/25">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground mt-2">
                        {canteen.counterLocation}
                      </p>

                      <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/40 p-2 text-xs">
                        <span className="font-semibold text-foreground">
                          {canteen.items} items
                        </span>
                        <span className="text-muted-foreground font-medium">
                          {canteen.orders} orders
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Ordering:
                        </span>
                        <CanteenOperationalToggle
                          canteen={canteen}
                          disabled={isUpdatingCanteenId === canteen.id}
                          onToggle={(target) => {
                            const currentlySuspended =
                              target.operationalStatus === "Suspended" || target.status === "Closed";
                            if (currentlySuspended) {
                              handleToggleOperational(target, "Active");
                            } else {
                              setCanteenToSuspend(target);
                            }
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-medium">{canteen.openingHours}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Canteen Access Requests Queue */
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase">
                      <th className="py-2.5 px-3">Canteen</th>
                      <th className="py-2.5 px-3">Owner Contact</th>
                      <th className="py-2.5 px-3">Cuisine</th>
                      <th className="py-2.5 px-3">Submitted</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {univRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          {req.canteenName}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          <p className="font-semibold text-foreground">{req.ownerName}</p>
                          <p className="text-[11px]">{req.email} • {req.phone}</p>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{req.cuisine}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{req.date}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              disabled={req.status === "Approved"}
                              onClick={() =>
                                setCanteenConfirm({ type: "approve", request: req })
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
                                setCanteenConfirm({ type: "reject", request: req })
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
            </div>
          )}
        </div>
      )}

      {/* 3. ORDERS TAB */}
      {activeTab === "Orders" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Campus Orders
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Consolidated live order records across campus canteens.
              </p>
            </div>

            {/* Filter capsules */}
            <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 shadow-2xs">
              {["All", "Placed", "Preparing", "Ready", "Completed"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setOrderFilter(status)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    orderFilter === status
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
            {filteredOrders.length === 0 ? (
              <EmptyState title={`No orders with '${orderFilter}' status`} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Canteen</th>
                      <th className="py-2.5 px-3">Dishes</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          {order.id}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {order.placedAt}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {order.customer}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {order.canteenName}
                        </td>
                        <td className="py-2.5 px-3 text-foreground max-w-[200px] truncate">
                          <span className="flex items-center gap-1 truncate">
                            {order.items.map((i, idx) => (
                              <span key={idx} className="inline-flex items-center gap-0.5">
                                <span>{getFoodEmoji(i.name)}</span>
                                <span>{i.quantity}× {i.name}</span>
                                {idx < order.items.length - 1 && <span className="text-muted-foreground mr-1">,</span>}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-extrabold text-foreground">
                          ₹{order.total}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="h-7 rounded-md text-xs font-semibold px-2.5"
                          >
                            Details
                          </Button>
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

      {/* 4. STUDENTS TAB */}
      {activeTab === "Students" && (() => {
        const effectiveMembers = universityMembers || [];
        const activeMembersCount = effectiveMembers.filter((m) => m.status === "active").length;
        const suspendedMembersCount = effectiveMembers.filter((m) => m.status === "suspended").length;
        const pendingMembersCount = effectiveMembers.filter((m) => m.status === "pending").length;

        const filteredMembers = effectiveMembers
          .filter((m) => {
            if (studentStatusFilter !== "All" && m.status !== studentStatusFilter) {
              return false;
            }
            if (!studentSearch.trim()) return true;
            const q = studentSearch.toLowerCase().trim();
            return (
              m.name.toLowerCase().includes(q) ||
              m.email.toLowerCase().includes(q) ||
              (m.studentId && m.studentId.toLowerCase().includes(q)) ||
              (m.department && m.department.toLowerCase().includes(q))
            );
          })
          .sort((a, b) => b.addedAt - a.addedAt);

        const totalPages = Math.max(1, Math.ceil(filteredMembers.length / studentPageSize));
        const currentPage = Math.min(studentPage, totalPages);
        const startIndex = (currentPage - 1) * studentPageSize;
        const pagedMembers = filteredMembers.slice(startIndex, startIndex + studentPageSize);

        const currentUnivId = selectedUniversityId || currentUser?.universityId || activeUniv?.id || "";
        const currentUnivName = activeUniv?.name || currentUser?.universityName || "Campus";

        return (
          <div className="space-y-4">
            {/* Header & Primary Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div>
                <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                  Student Management & Onboarding
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Roster for <span className="font-semibold text-foreground">{currentUnivName}</span>. Manage memberships, invite via passwordless link, and bulk import students.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => setIsAddStudentOpen(true)}
                  size="sm"
                  className="h-8 rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-2xs hover:bg-primary/90 gap-1.5"
                >
                  <UserPlus className="size-3.5" />
                  Add Student
                </Button>
                <Button
                  onClick={() => setIsBulkImportOpen(true)}
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-border hover:bg-muted"
                >
                  <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Import XLSX
                </Button>
                <Button
                  onClick={() => setIsBulkActionsOpen(true)}
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-border hover:bg-muted"
                >
                  <ShieldAlert className="size-3.5 text-amber-600 dark:text-amber-400" />
                  Bulk Actions
                </Button>
              </div>
            </div>

            {/* Quick KPI Stat Capsules */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-3 shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Enrolled</span>
                <p className="mt-1 text-2xl font-black text-foreground">{effectiveMembers.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 shadow-2xs">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Access</span>
                <p className="mt-1 text-2xl font-black text-foreground">{activeMembersCount}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 shadow-2xs">
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Suspended</span>
                <p className="mt-1 text-2xl font-black text-foreground">{suspendedMembersCount}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 shadow-2xs">
                <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Pending Invitations</span>
                <p className="mt-1 text-2xl font-black text-foreground">{pendingMembersCount}</p>
              </div>
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setStudentPage(1);
                  }}
                  placeholder="Search by name, email, ID, department..."
                  className="h-8 rounded-lg pl-8 text-xs bg-background"
                />
                {studentSearch && (
                  <button
                    onClick={() => {
                      setStudentSearch("");
                      setStudentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {(
                  [
                    { key: "All", label: "All", count: effectiveMembers.length },
                    { key: "active", label: "Active", count: activeMembersCount },
                    { key: "suspended", label: "Suspended", count: suspendedMembersCount },
                    { key: "pending", label: "Pending", count: pendingMembersCount },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setStudentStatusFilter(tab.key);
                      setStudentPage(1);
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      studentStatusFilter === tab.key
                        ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        studentStatusFilter === tab.key
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Students Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                    <Users className="size-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {effectiveMembers.length === 0
                      ? "No students enrolled yet"
                      : "No students matching your search criteria"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {effectiveMembers.length === 0
                      ? "Add an individual student or import an XLSX spreadsheet to invite students to this campus."
                      : "Try adjusting your search terms or status filters above."}
                  </p>
                  {effectiveMembers.length === 0 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        onClick={() => setIsAddStudentOpen(true)}
                        size="sm"
                        className="rounded-lg text-xs font-bold"
                      >
                        <UserPlus className="mr-1.5 size-3.5" />
                        Add First Student
                      </Button>
                      <Button
                        onClick={() => setIsBulkImportOpen(true)}
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs font-semibold"
                      >
                        <FileSpreadsheet className="mr-1.5 size-3.5" />
                        Import XLSX
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Student ID</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Membership Status</th>
                        <th className="py-2.5 px-3">Enrolled On</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {pagedMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="size-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-foreground truncate">{member.name}</p>
                                <p className="text-[11px] text-muted-foreground font-normal truncate">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-muted-foreground">
                            {member.studentId || <span className="text-muted-foreground/60 italic text-[11px]">Not set</span>}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {member.department || <span className="text-muted-foreground/60 italic text-[11px]">General</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            {member.status === "active" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : member.status === "suspended" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                <span className="size-1.5 rounded-full bg-rose-500" />
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                                <Clock className="size-2.5" />
                                Pending Invitation
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground text-[11px]">
                            {new Date(member.addedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStudentForDetail(member)}
                              className="h-7 rounded-md text-xs font-semibold px-2.5 hover:bg-muted border-border"
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination bar */}
              {filteredMembers.length > studentPageSize && (
                <div className="flex items-center justify-between border-t border-border/70 px-4 py-2.5 text-xs text-muted-foreground bg-card/60">
                  <span>
                    Showing <strong className="text-foreground">{startIndex + 1}</strong> to{" "}
                    <strong className="text-foreground">
                      {Math.min(startIndex + studentPageSize, filteredMembers.length)}
                    </strong>{" "}
                    of <strong className="text-foreground">{filteredMembers.length}</strong> students
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                      className="h-7 px-2 text-xs"
                    >
                      <ChevronLeft className="size-3.5 mr-1" />
                      Prev
                    </Button>
                    <span className="px-2 text-xs font-bold text-foreground">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setStudentPage((p) => Math.min(totalPages, p + 1))}
                      className="h-7 px-2 text-xs"
                    >
                      Next
                      <ChevronRight className="size-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 5. ANALYTICS TAB */}
      {activeTab === "Analytics" && (
        <div className="space-y-4">
          <div className="border-b border-border/70 pb-3">
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Campus Dining Analytics
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Turnover velocity and food court volume for {activeUniv.name}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <MetricCard
              label="Campus GMV"
              value={`₹${univRevenue.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              delta={univRevenue > 0 ? "Realtime transactions" : "No orders recorded"}
              subtext="Campus total sales"
            />
            <MetricCard
              label="Completed Meals"
              value={String(completedOrdersCount)}
              icon={ShoppingBag}
              delta={completedOrdersCount > 0 ? `${completedOrdersCount} served` : "0 served"}
              subtext="Tokens completed"
            />
            <MetricCard
              label="Active Canteens"
              value={String(univCanteens.length)}
              icon={Store}
              delta="All Operational"
              subtext="Counter coverage"
            />
            <MetricCard
              label="Peak Wait Time"
              value="7.5 min"
              icon={Clock}
              delta="-1.2 min"
              subtext="Faster than benchmark"
            />
          </div>
        </div>
      )}

      {/* Order Inspect Modal */}
      <Dialog
        open={!!selectedOrderForDetail}
        onOpenChange={(open) => !open && setSelectedOrderForDetail(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-5 shadow-card border border-border">
          {selectedOrderForDetail && (
            <div className="space-y-3">
              <DialogHeader className="text-left border-b border-border/60 pb-2.5">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-base font-bold text-foreground">
                    Order {selectedOrderForDetail.id}
                  </DialogTitle>
                  <StatusBadge status={selectedOrderForDetail.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Token: <b className="text-foreground">{selectedOrderForDetail.tokenNumber}</b> • {selectedOrderForDetail.canteenName}
                </p>
              </DialogHeader>

              <div className="space-y-1.5 text-xs py-1">
                <p className="font-bold text-muted-foreground uppercase text-[10px]">
                  Customer
                </p>
                <p className="font-bold text-foreground">
                  {selectedOrderForDetail.customer} ({selectedOrderForDetail.customerRole})
                </p>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs">
                <p className="font-bold text-muted-foreground uppercase text-[10px]">
                  Ordered Items
                </p>
                {selectedOrderForDetail.items.map((i: any, idx: number) => (
                  <div key={idx} className="flex justify-between font-medium">
                    <span className="flex items-center gap-1">
                      <span>{getFoodEmoji(i.name)}</span>
                      <span>{i.quantity}× {i.name}</span>
                    </span>
                    <span className="font-bold text-foreground">₹{i.price * i.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-border/60 pt-2 flex justify-between font-extrabold text-sm">
                  <span>Grand Total</span>
                  <span className="text-primary">₹{selectedOrderForDetail.total}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={() => setSelectedOrderForDetail(null)}
                  className="rounded-lg text-xs font-semibold h-8"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Canteen Request Approval/Rejection */}
      <ConfirmModal
        open={!!canteenConfirm}
        onOpenChange={(open) => !open && setCanteenConfirm(null)}
        title={
          canteenConfirm?.type === "approve"
            ? "Approve Canteen Access?"
            : "Reject Canteen Access?"
        }
        description={
          canteenConfirm?.type === "approve"
            ? `Grant permission to "${canteenConfirm.request.canteenName}" to operate a dining counter at ${activeUniv.name}.`
            : `Decline onboarding request for "${canteenConfirm?.request.canteenName}".`
        }
        confirmLabel={canteenConfirm?.type === "approve" ? "Approve Canteen" : "Reject"}
        isDestructive={canteenConfirm?.type === "reject"}
        onConfirm={() => {
          if (!canteenConfirm) return;
          if (canteenConfirm.type === "approve") {
            approveCanteenRequest(canteenConfirm.request.id);
          } else {
            rejectCanteenRequest(canteenConfirm.request.id);
          }
          setCanteenConfirm(null);
        }}
      />
      {/* Confirmation Modal for Canteen Suspension */}
      <ConfirmModal
        open={!!canteenToSuspend}
        onOpenChange={(open) => !open && setCanteenToSuspend(null)}
        title="Suspend this canteen?"
        description={
          canteenToSuspend
            ? `Suspend "${canteenToSuspend.name}"? New orders will be blocked for students and visitors. Canteen data, menus, and history remain intact.`
            : "Suspend this canteen?"
        }
        confirmLabel="Suspend"
        isDestructive={true}
        onConfirm={async () => {
          if (!canteenToSuspend) return;
          const target = canteenToSuspend;
          setCanteenToSuspend(null);
          await handleToggleOperational(target, "Suspended");
        }}
      />

      {/* Student Management Modals */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        universityId={selectedUniversityId || currentUser?.universityId || activeUniv?.id || ""}
        universityName={activeUniv?.name || currentUser?.universityName || "Campus"}
        adminUid={currentUser?.uid || "admin"}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        universityId={selectedUniversityId || currentUser?.universityId || activeUniv?.id || ""}
        universityName={activeUniv?.name || currentUser?.universityName || "Campus"}
        adminUid={currentUser?.uid || "admin"}
        existingMembers={universityMembers || []}
      />

      <BulkActionsModal
        isOpen={isBulkActionsOpen}
        onClose={() => setIsBulkActionsOpen(false)}
        universityId={selectedUniversityId || currentUser?.universityId || activeUniv?.id || ""}
        universityName={activeUniv?.name || currentUser?.universityName || "Campus"}
        adminUid={currentUser?.uid || "admin"}
        existingMembers={universityMembers || []}
      />

      <StudentDetailModal
        member={selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
        universityId={selectedUniversityId || currentUser?.universityId || activeUniv?.id || ""}
        universityName={activeUniv?.name || currentUser?.universityName || "Campus"}
        adminUid={currentUser?.uid || "admin"}
      />
    </div>
  );
}
