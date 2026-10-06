import React, { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Coffee,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    students,
    orders,
  } = useBunk();

  const [canteenSubView, setCanteenSubView] = useState<"canteens" | "requests">("canteens");
  const [canteenSearch, setCanteenSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("All");
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

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
    universities.find((u) => u.id === selectedUniversityId) || universities[0]!;

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

            <div className="flex items-center gap-2">
              <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {univCanteens.length} Canteens Online
              </span>
            </div>
          </div>

          {/* Compact Overview KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <MetricCard
              label="Orders Today"
              value={String(univOrders.length > 0 ? univOrders.length + 1240 : 1248)}
              icon={ShoppingBag}
              delta="+8.2%"
              subtext="Across all campus counters"
            />
            <MetricCard
              label="Revenue"
              value="₹1,84,200"
              icon={IndianRupee}
              delta="+6.8%"
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
            /* Compact Canteens Table / Cards */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {filteredCanteens.map((canteen) => (
                <div
                  key={canteen.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs hover:border-primary/40 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="grid size-8 place-items-center rounded-lg bg-muted text-primary shrink-0">
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
                      <StatusBadge status={canteen.status} />
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
                    <span>{canteen.openingHours}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-md text-xs font-semibold px-2.5 hover:border-primary/40"
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
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
      {activeTab === "Students" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Enrolled Students
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Campus accounts and dining token activity.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student or ID..."
                className="h-8 rounded-lg pl-8 text-xs bg-card"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            {filteredStudents.length === 0 ? (
              <EmptyState title="No students found" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase">
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">ID Number</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Total Orders</th>
                      <th className="py-2.5 px-3">Account Status</th>
                      <th className="py-2.5 px-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          {st.name}
                          <p className="text-[11px] font-normal text-muted-foreground">{st.email}</p>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">
                          {st.studentId}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{st.department}</td>
                        <td className="py-2.5 px-3 font-bold text-foreground">{st.ordersCount}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={st.status} />
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{st.joinedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

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
              value="₹1,84,200"
              icon={IndianRupee}
              delta="+9.4%"
              subtext="Today's aggregate"
            />
            <MetricCard
              label="Completed Meals"
              value="1,248"
              icon={ShoppingBag}
              delta="+12%"
              subtext="Tokens dispensed"
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
                {selectedOrderForDetail.items.map((i, idx) => (
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
    </div>
  );
}
