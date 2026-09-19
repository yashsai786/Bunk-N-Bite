import React, { useState } from "react";
import {
  Building2,
  Check,
  ChevronRight,
  Coffee,
  IndianRupee,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Users,
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
    setSelectedUniversityId,
    universities,
    canteens,
    canteenRequests,
    approveCanteenRequest,
    rejectCanteenRequest,
    students,
    orders,
  } = useBunk();

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
    <div className="space-y-6">
      {/* 1. OVERVIEW TAB */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {activeUniv.name}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Campus administration and catering operations dashboard.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select defaultValue="today">
                <SelectTrigger className="h-9 w-32 rounded-full border-border/70 bg-card text-xs font-semibold shadow-xs">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="today" className="text-xs">Today</SelectItem>
                  <SelectItem value="week" className="text-xs">This Week</SelectItem>
                  <SelectItem value="month" className="text-xs">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <MetricGrid>
            <MetricCard
              label="Orders Today"
              value={String(univOrders.length > 0 ? univOrders.length + 1240 : 1248)}
              icon={ShoppingBag}
              delta="+8.2%"
              subtext="Across campus canteens"
            />
            <MetricCard
              label="Campus Revenue"
              value="₹1.84L"
              icon={IndianRupee}
              delta="+6.8%"
              subtext="5% University platform fee"
            />
            <MetricCard
              label="Active Canteens"
              value={String(univCanteens.length)}
              icon={Store}
              delta="All online"
              subtext="Operational in Student Centre"
            />
            <MetricCard
              label="Registered Students"
              value={activeUniv.students}
              icon={Users}
              delta="+126 this term"
              subtext="Active university ID cards"
            />
          </MetricGrid>

          {/* Live Orders Feed */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  Live Campus Orders
                </h2>
                <p className="text-xs text-muted-foreground">
                  Real-time synchronization across all university counters.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("Orders")}
                className="text-xs font-semibold"
              >
                View all orders
              </Button>
            </div>

            {univOrders.length === 0 ? (
              <EmptyState title="No orders today" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Student</th>
                      <th className="pb-3 font-semibold">Canteen</th>
                      <th className="pb-3 font-semibold">Items</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {univOrders.slice(0, 6).map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 font-bold text-foreground">
                          {order.id}
                        </td>
                        <td className="py-3.5 font-medium text-foreground">
                          {order.customer}
                        </td>
                        <td className="py-3.5 text-muted-foreground">
                          {order.canteenName}
                        </td>
                        <td className="py-3.5 text-foreground max-w-[200px] truncate">
                          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                        </td>
                        <td className="py-3.5 font-bold text-foreground">
                          ₹{order.total}
                        </td>
                        <td className="py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="h-7 text-xs font-semibold"
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
      {activeTab === "Canteens" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Campus Canteens
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Authorized food vendors operating across campus blocks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={canteenSearch}
                  onChange={(e) => setCanteenSearch(e.target.value)}
                  placeholder="Search canteens..."
                  className="rounded-full pl-10 text-xs shadow-xs"
                />
              </div>

              <Button
                onClick={() => setIsAddCanteenOpen(true)}
                className="rounded-full text-xs font-bold gap-1.5"
              >
                <Plus className="size-4" />
                Add Canteen
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCanteens.map((canteen) => (
              <div
                key={canteen.id}
                className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:shadow-card"
              >
                <div>
                  <div className="flex aspect-16/9 w-full items-center justify-center rounded-2xl bg-muted/60 text-primary">
                    <Coffee className="size-8 opacity-80" />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-foreground">
                      {canteen.name}
                    </h3>
                    <StatusBadge status={canteen.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Owner: {canteen.owner}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {canteen.counterLocation}
                  </p>

                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/20 p-2.5 text-xs">
                    <span className="font-semibold text-foreground">
                      {canteen.items} items
                    </span>
                    <span className="text-muted-foreground">
                      {canteen.orders} orders today
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {canteen.openingHours}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-xs font-bold"
                  >
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CANTEEN REQUESTS TAB */}
      {activeTab === "Canteen Requests" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Canteen Vendor Requests
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Review and approve external caterers seeking permission to operate on campus.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
            {univRequests.length === 0 ? (
              <EmptyState title="No pending canteen requests" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="pb-3 font-semibold">Canteen / Brand</th>
                      <th className="pb-3 font-semibold">Owner Name</th>
                      <th className="pb-3 font-semibold">Cuisine Type</th>
                      <th className="pb-3 font-semibold">Date Submitted</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {univRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 font-bold text-foreground">
                          {req.canteenName}
                        </td>
                        <td className="py-3.5 text-foreground">
                          <p className="font-semibold">{req.ownerName}</p>
                          <p className="text-[11px] text-muted-foreground">{req.email} • {req.phone}</p>
                        </td>
                        <td className="py-3.5 text-muted-foreground">{req.cuisine}</td>
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
                                setCanteenConfirm({ type: "approve", request: req })
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
                                setCanteenConfirm({ type: "reject", request: req })
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

      {/* 4. ORDERS TAB */}
      {activeTab === "Orders" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Campus Orders
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Consolidated live queue across all campus canteens.
              </p>
            </div>

            {/* Filter capsules */}
            <div className="flex gap-1 overflow-x-auto rounded-full border border-border/70 bg-card p-1 shadow-xs">
              {["All", "Placed", "Preparing", "Ready", "Completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderFilter(status)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                    orderFilter === status
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
            {filteredOrders.length === 0 ? (
              <EmptyState title={`No orders with '${orderFilter}' status`} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Time</th>
                      <th className="pb-3 font-semibold">Student</th>
                      <th className="pb-3 font-semibold">Canteen</th>
                      <th className="pb-3 font-semibold">Dishes</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 font-bold text-foreground">
                          {order.id}
                        </td>
                        <td className="py-3.5 text-xs text-muted-foreground">
                          {order.placedAt}
                        </td>
                        <td className="py-3.5 font-medium text-foreground">
                          {order.customer}
                        </td>
                        <td className="py-3.5 text-muted-foreground">
                          {order.canteenName}
                        </td>
                        <td className="py-3.5 text-foreground max-w-[200px] truncate">
                          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                        </td>
                        <td className="py-3.5 font-bold text-foreground">
                          ₹{order.total}
                        </td>
                        <td className="py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="h-8 rounded-full text-xs font-semibold"
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

      {/* 5. STUDENTS TAB */}
      {activeTab === "Students" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Enrolled Students
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Students registered on campus digital meal accounts.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student or Roll ID..."
                className="rounded-full pl-10 text-xs shadow-xs"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
            {filteredStudents.length === 0 ? (
              <EmptyState title="No students found" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="pb-3 font-semibold">Student Name</th>
                      <th className="pb-3 font-semibold">Roll Number</th>
                      <th className="pb-3 font-semibold">Department</th>
                      <th className="pb-3 font-semibold">Orders</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Joined</th>
                      <th className="pb-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 font-bold text-foreground">
                          {st.name}
                          <p className="text-[11px] font-normal text-muted-foreground">{st.email}</p>
                        </td>
                        <td className="py-3.5 text-muted-foreground font-mono text-xs">
                          {st.studentId}
                        </td>
                        <td className="py-3.5 text-muted-foreground">{st.department}</td>
                        <td className="py-3.5 font-bold text-foreground">{st.ordersCount}</td>
                        <td className="py-3.5">
                          <StatusBadge status={st.status} />
                        </td>
                        <td className="py-3.5 text-muted-foreground">{st.joinedDate}</td>
                        <td className="py-3.5 text-right">
                          <Button variant="ghost" size="icon" className="size-8 rounded-full">
                            <MoreHorizontal className="size-4" />
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

      {/* 6. ANALYTICS TAB */}
      {activeTab === "Analytics" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Campus Dining Analytics
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Peak cafeteria traffic and revenue breakdown for {activeUniv.name}.
              </p>
            </div>
          </div>

          <MetricGrid>
            <MetricCard
              label="Today's GMV"
              value="₹1,84,200"
              icon={IndianRupee}
              delta="+9.4%"
            />
            <MetricCard
              label="Completed Meals"
              value="1,248"
              icon={ShoppingBag}
              delta="+12%"
            />
            <MetricCard
              label="Peak Wait Time"
              value="7.2 mins"
              icon={Store}
              delta="-1.5 min vs last wk"
            />
            <MetricCard
              label="Active Canteens"
              value="4"
              icon={Building2}
              delta="100% On-time"
            />
          </MetricGrid>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs">
              <h3 className="font-bold text-foreground">Hourly Campus Peak Traffic</h3>
              <p className="text-xs text-muted-foreground mt-1">Order concentration across hours.</p>

              <div className="mt-6 flex h-52 items-end gap-3 border-b border-border/60 pb-2">
                {[20, 35, 80, 95, 45, 60, 90, 75, 40, 30].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1 group">
                    <div
                      className="w-full rounded-t-lg bg-primary/80 transition-all group-hover:bg-primary"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6][i]}
                      {i < 4 ? "A" : "P"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs">
              <h3 className="font-bold text-foreground">Canteen Share of Campus GMV</h3>
              <div className="mt-4 space-y-3">
                {univCanteens.map((c, i) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between text-xs sm:text-sm font-semibold">
                      <span>{c.name}</span>
                      <span>₹{[68400, 48200, 52100, 15500][i]} ({[38, 26, 28, 8][i]}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${[38, 26, 28, 8][i]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Canteen Dialog */}
      <Dialog open={isAddCanteenOpen} onOpenChange={setIsAddCanteenOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 shadow-card">
          <DialogHeader className="text-left border-b border-border/60 pb-3">
            <DialogTitle className="text-lg font-bold text-foreground">
              Add Campus Canteen
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4 text-xs sm:text-sm">
            <div>
              <Label htmlFor="cant-name">Canteen Name</Label>
              <Input
                id="cant-name"
                value={newCanteenName}
                onChange={(e) => setNewCanteenName(e.target.value)}
                placeholder="e.g. South Indian Express"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="cant-owner">Primary Owner / Operator</Label>
              <Input
                id="cant-owner"
                value={newCanteenOwner}
                onChange={(e) => setNewCanteenOwner(e.target.value)}
                placeholder="e.g. Venkatesh Iyer"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="cant-loc">Counter Location on Campus</Label>
              <Input
                id="cant-loc"
                value={newCanteenLocation}
                onChange={(e) => setNewCanteenLocation(e.target.value)}
                placeholder="e.g. Ground Floor, SAC Building"
                className="mt-1 rounded-xl"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddCanteenOpen(false)}
              className="rounded-full text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!newCanteenName || !newCanteenOwner}
              onClick={() => {
                setIsAddCanteenOpen(false);
                setNewCanteenName("");
                setNewCanteenOwner("");
                setNewCanteenLocation("");
              }}
              className="rounded-full text-xs font-bold"
            >
              Create Canteen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inspect Order Dialog */}
      {selectedOrderForDetail && (
        <Dialog open={!!selectedOrderForDetail} onOpenChange={() => setSelectedOrderForDetail(null)}>
          <DialogContent className="max-w-md rounded-3xl p-6 shadow-card">
            <DialogHeader className="text-left border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold text-foreground">
                  {selectedOrderForDetail.id}
                </DialogTitle>
                <StatusBadge status={selectedOrderForDetail.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                Token: {selectedOrderForDetail.tokenNumber} • {selectedOrderForDetail.canteenName}
              </p>
            </DialogHeader>

            <div className="mt-4 space-y-3 text-xs sm:text-sm">
              <div className="space-y-1 rounded-2xl border border-border/70 p-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Customer
                </p>
                <p className="font-bold text-foreground">{selectedOrderForDetail.customer}</p>
                <p className="text-xs text-muted-foreground">{selectedOrderForDetail.customerEmail}</p>
              </div>

              <div className="space-y-1.5 rounded-2xl border border-border/70 p-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Dishes
                </p>
                {selectedOrderForDetail.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.quantity}× {i.name}</span>
                    <span className="font-bold">₹{i.price * i.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-border/50 pt-2 flex justify-between font-black">
                  <span>Total</span>
                  <span>₹{selectedOrderForDetail.total}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderForDetail(null)}
                className="rounded-full text-xs font-semibold"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Canteen Request Confirmation Modal */}
      {canteenConfirm && (
        <ConfirmModal
          open={!!canteenConfirm}
          onOpenChange={(open) => !open && setCanteenConfirm(null)}
          title={
            canteenConfirm.type === "approve"
              ? `Approve "${canteenConfirm.request.canteenName}"?`
              : `Reject "${canteenConfirm.request.canteenName}"?`
          }
          description={
            canteenConfirm.type === "approve"
              ? "The vendor will be authorized to launch on campus immediately."
              : "The vendor will be marked as rejected."
          }
          confirmLabel={canteenConfirm.type === "approve" ? "Approve Canteen" : "Reject"}
          isDestructive={canteenConfirm.type === "reject"}
          onConfirm={() => {
            if (canteenConfirm.type === "approve") {
              approveCanteenRequest(canteenConfirm.request.id);
            } else {
              rejectCanteenRequest(canteenConfirm.request.id);
            }
          }}
        />
      )}
    </div>
  );
}
