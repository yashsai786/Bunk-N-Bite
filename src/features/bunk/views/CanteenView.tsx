import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Filter,
  IndianRupee,
  Layers,
  PackageCheck,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Store,
  Timer,
  TrendingUp,
  Utensils,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { FoodEmojiBadge, getCategoryEmoji, getFoodEmoji } from "../components/FoodEmoji";
import { MetricCard, MetricGrid } from "../components/MetricCard";
import { EmptyState } from "../components/States";
import { StatusBadge } from "../components/StatusBadge";
import { useBunk } from "../state";
import type { FoodItem, Order, OrderStatus } from "../types";

export function CanteenView() {
  const {
    activeTab,
    setActiveTab,
    selectedCanteenId,
    canteens,
    foods,
    addFoodItem,
    updateFoodItem,
    toggleFoodAvailability,
    orders,
    advanceOrderStatus,
    cancelOrder,
  } = useBunk();

  // Orders filter & search
  const [orderFilter, setOrderFilter] = useState<string>("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderCustomerType, setOrderCustomerType] = useState<string>("All");

  // Menu filter & search
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategory, setMenuCategory] = useState<string>("All");
  const [menuAvailability, setMenuAvailability] = useState<string>("All");

  // Add / Edit Item Dialog state
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState<FoodItem["category"]>("Breakfast");
  const [itemEmoji, setItemEmoji] = useState("");
  const [itemPrep, setItemPrep] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemFormError, setItemFormError] = useState("");

  const activeCanteen =
    canteens.find((c) => c.id === selectedCanteenId) || canteens[0];

  const canteenOrders = orders.filter(
    (o) => o.canteenId === selectedCanteenId
  );

  const pendingCount = canteenOrders.filter(
    (o) => o.status === "Placed" || o.status === "Preparing"
  ).length;

  const readyCount = canteenOrders.filter((o) => o.status === "Ready").length;

  const completedCount = canteenOrders.filter(
    (o) => o.status === "Completed"
  ).length;

  const canteenSales = canteenOrders.reduce(
    (sum, o) => sum + (o.paymentStatus === "Paid" ? o.total : 0),
    0
  );

  const avgTicket = canteenOrders.length > 0 ? Math.round(canteenSales / canteenOrders.length) : 0;

  const itemSalesMap: Record<string, { name: string; emoji?: string; count: number; revenue: number }> = {};
  canteenOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!itemSalesMap[item.name]) {
        itemSalesMap[item.name] = {
          name: item.name,
          emoji: getFoodEmoji(item.name),
          count: 0,
          revenue: 0,
        };
      }
      const dishEntry = itemSalesMap[item.name];
      if (dishEntry) {
        dishEntry.count += item.quantity;
        dishEntry.revenue += item.price * item.quantity;
      }
    });
  });
  const topSellingDishes = Object.values(itemSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topDish = topSellingDishes[0];

  const canteenFoods = foods.filter(
    (f) => f.canteenId === selectedCanteenId || true
  );

  // Filtered orders for the Orders screen
  const filteredOrders = canteenOrders.filter((o) => {
    // Map "New" filter to "Placed"
    const matchStatus =
      orderFilter === "All" ||
      (orderFilter === "New" && o.status === "Placed") ||
      o.status === orderFilter;

    const matchType =
      orderCustomerType === "All" || o.customerRole === orderCustomerType;

    const matchSearch =
      orderSearch.trim() === "" ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.tokenNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.items.some((it) => it.name.toLowerCase().includes(orderSearch.toLowerCase()));

    return matchStatus && matchType && matchSearch;
  });

  // Filtered foods for the Menu catalog
  const filteredFoods = canteenFoods.filter((f) => {
    const matchesCategory =
      menuCategory === "All" || f.category === menuCategory;
    const matchesSearch = f.name
      .toLowerCase()
      .includes(menuSearch.toLowerCase());
    const matchesAvailability =
      menuAvailability === "All" ||
      (menuAvailability === "available" && f.available) ||
      (menuAvailability === "unavailable" && !f.available);

    return matchesCategory && matchesSearch && matchesAvailability;
  });

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemName("");
    setItemPrice("");
    setItemCategory("Breakfast");
    setItemEmoji("🥞");
    setItemPrep("10 min");
    setItemDesc("");
    setItemAvailable(true);
    setItemFormError("");
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: FoodItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemPrice(String(item.price));
    setItemCategory(item.category);
    setItemEmoji(item.emoji || getFoodEmoji(item.name, item.category));
    setItemPrep(item.prepTime);
    setItemDesc(item.description);
    setItemAvailable(item.available);
    setItemFormError("");
    setIsItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemName.trim()) {
      setItemFormError("Item name is required.");
      return;
    }
    const numPrice = Number(itemPrice);
    if (!itemPrice || isNaN(numPrice) || numPrice <= 0) {
      setItemFormError("Please enter a valid price in INR.");
      return;
    }

    if (editingItem) {
      updateFoodItem(editingItem.id, {
        name: itemName.trim(),
        price: numPrice,
        category: itemCategory,
        emoji: itemEmoji.trim() || undefined,
        prepTime: itemPrep || "10 min",
        description: itemDesc.trim(),
        available: itemAvailable,
      });
    } else {
      addFoodItem({
        canteenId: selectedCanteenId,
        name: itemName.trim(),
        price: numPrice,
        category: itemCategory,
        emoji: itemEmoji.trim() || getCategoryEmoji(itemCategory),
        image: "",
        available: itemAvailable,
        prepTime: itemPrep || "10 min",
        description: itemDesc.trim() || "Freshly prepared dining item.",
        isVeg: true,
      });
    }

    setIsItemModalOpen(false);
  };

  const getNextAction = (status: OrderStatus) => {
    switch (status) {
      case "Placed":
        return { label: "Start Preparing", next: "Preparing" };
      case "Preparing":
        return { label: "Mark Ready", next: "Ready" };
      case "Ready":
        return { label: "Complete Order", next: "Completed" };
      default:
        return null;
    }
  };

  // Support both "Orders" and "Live Orders" tab names
  const isOrdersTab = activeTab === "Orders" || activeTab === "Live Orders";

  if (!activeCanteen) {
    return (
      <div className="py-12">
        <EmptyState
          title="No canteens yet"
          description="Register a new canteen outlet or seed initial campus food courts to activate the operational POS."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Suspended Operational State Banner */}
      {activeCanteen.operationalStatus === "Suspended" && (
        <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
            <span>
              <strong>Canteen Suspended:</strong> Your outlet has been temporarily suspended by the University Admin. New customer orders are paused. You can continue preparing and fulfilling active tickets.
            </span>
          </div>
          <span className="shrink-0 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider">
            Orders Paused
          </span>
        </div>
      )}

      {/* 1. OVERVIEW TAB — POS Operations Dashboard */}
      {activeTab === "Overview" && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                  {activeCanteen.name}
                </h1>
                {activeCanteen.operationalStatus === "Suspended" ? (
                  <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 border border-rose-500/25">
                    SUSPENDED
                  </span>
                ) : (
                  <StatusBadge status={activeCanteen.status} />
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Petpooja-style operational POS & Kitchen Management Terminal.
              </p>
            </div>

            <Button
              onClick={() => setActiveTab("Orders")}
              className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 shadow-xs h-9 px-3.5"
            >
              <Utensils className="size-3.5" />
              Live Orders ({pendingCount + readyCount})
            </Button>
          </div>

          {/* Compact KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <MetricCard
              label="Orders Total"
              value={String(canteenOrders.length)}
              icon={ShoppingBag}
              delta={canteenOrders.length > 0 ? `${canteenOrders.length} placed` : "Zero tickets"}
              subtext="Total order volume"
            />
            <MetricCard
              label="Today's Sales"
              value={`₹${canteenSales.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              delta={canteenSales > 0 ? "Verified turnover" : "No sales yet"}
              subtext="Net gross turnover"
            />
            <MetricCard
              label="Pending Orders"
              value={String(pendingCount)}
              icon={Clock}
              delta={`${pendingCount} active`}
              subtext="Currently preparing"
            />
            <MetricCard
              label="Completed Orders"
              value={String(completedCount)}
              icon={PackageCheck}
              delta={completedCount > 0 ? `${completedCount} completed` : "0 completed"}
              subtext="Dispatched & handed off"
            />
          </div>

          {/* Compact Live Order Queue */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Timer className="size-4 text-primary" />
                <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                  Live Kitchen Queue
                </h2>
                <span className="rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-bold text-accent-foreground">
                  {canteenOrders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length} active
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("Orders")}
                className="text-xs font-semibold text-primary hover:text-primary/90 h-8"
              >
                Full Orders Screen <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </div>

            {/* Compact order queue items */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {canteenOrders
                .filter((o) => o.status !== "Completed" && o.status !== "Cancelled")
                .map((order) => {
                  const action = getNextAction(order.status);
                  return (
                    <div
                      key={order.id}
                      className="flex flex-col justify-between rounded-lg border border-border/80 bg-background/50 p-3 shadow-2xs hover:border-primary/40 transition-colors"
                    >
                      <div>
                        {/* Order header row */}
                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-foreground text-sm">
                              {order.id}
                            </span>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                              {order.tokenNumber}
                            </span>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>

                        {/* Customer & time meta */}
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{order.customer} ({order.customerRole})</span>
                          <span>{order.placedAt}</span>
                        </div>

                        {/* Items breakdown with emoji markers */}
                        <div className="mt-2.5 space-y-1 rounded-md bg-card p-2 border border-border/60 text-xs">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between font-medium">
                              <span className="flex items-center gap-1 truncate">
                                <span className="font-bold text-primary mr-0.5">{it.quantity}×</span>
                                <span>{getFoodEmoji(it.name)}</span>
                                <span className="truncate">{it.name}</span>
                              </span>
                              <span className="text-muted-foreground font-semibold ml-2">
                                ₹{it.price * it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs pt-1">
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {order.paymentMethod} • Paid
                          </span>
                          <span className="font-extrabold text-foreground">
                            ₹{order.total}
                          </span>
                        </div>
                      </div>

                      {/* POS Action Controls */}
                      <div className="mt-3 flex items-center gap-1.5 border-t border-border/50 pt-2">
                        {action && (
                          <Button
                            size="sm"
                            onClick={() => advanceOrderStatus(order.id)}
                            className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-8 shadow-xs"
                          >
                            <Check className="mr-1 size-3.5" />
                            {action.label}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelOrder(order.id)}
                          className="h-8 rounded-md text-xs font-semibold text-destructive hover:bg-destructive/10 border-border"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  );
                })}

              {canteenOrders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="size-8 mx-auto text-success mb-2 opacity-80" />
                  <p className="font-bold text-foreground">All kitchen tickets cleared!</p>
                  <p className="text-[11px] mt-0.5">New orders from students and visitors will appear here automatically.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS TAB — Compact Operational Order Management Screen */}
      {isOrdersTab && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Orders Management
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Scan, advance, and process customer orders in real time.
              </p>
            </div>

            {/* Quick status counters */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
                Total: <b className="text-foreground">{canteenOrders.length}</b>
              </span>
              <span className="rounded-md bg-primary/10 text-primary px-2 py-1">
                Active: <b>{pendingCount + readyCount}</b>
              </span>
            </div>
          </div>

          {/* Controls: Capsule status filters + Search + Type selector */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Top capsule filters: [ All ] [ New ] [ Preparing ] [ Ready ] [ Completed ] */}
            <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 shadow-2xs [scrollbar-width:none]">
              {["All", "New", "Preparing", "Ready", "Completed"].map((status) => {
                const isActive = orderFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setOrderFilter(status)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                      isActive
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order #, token, customer..."
                  className="h-8 rounded-lg pl-8 text-xs bg-card"
                />
              </div>

              <Select
                value={orderCustomerType}
                onValueChange={setOrderCustomerType}
              >
                <SelectTrigger className="h-8 w-28 rounded-lg text-xs bg-card">
                  <SelectValue placeholder="Customer" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="All" className="text-xs">All Types</SelectItem>
                  <SelectItem value="Student" className="text-xs">Student</SelectItem>
                  <SelectItem value="Visitor" className="text-xs">Visitor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Operational Orders List (Compact POS Rows / Cards) */}
          <div className="space-y-2">
            {filteredOrders.length === 0 ? (
              <EmptyState
                title={`No orders found`}
                description="Try switching the filter tab or resetting your search query."
              />
            ) : (
              filteredOrders.map((order) => {
                const action = getNextAction(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-2xs hover:border-primary/40 transition-colors"
                  >
                    {/* Left: ID, token, time, customer */}
                    <div className="flex items-start sm:items-center gap-3 min-w-[200px]">
                      <div className="grid size-9 place-items-center rounded-lg bg-muted/80 text-foreground font-mono text-xs font-bold shrink-0">
                        {order.tokenNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-foreground">
                            {order.id}
                          </span>
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">
                            {order.customerRole}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {order.placedAt} • <b className="text-foreground">{order.customer}</b>
                        </p>
                      </div>
                    </div>

                    {/* Middle: Items summary with emojis */}
                    <div className="flex-1 min-w-0 py-1 md:py-0 border-y md:border-y-0 border-border/40">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        {order.items.map((it, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground"
                          >
                            <span className="font-bold text-primary">{it.quantity}×</span>
                            <span>{getFoodEmoji(it.name)}</span>
                            <span>{it.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Bill, Status & Action Button */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <div className="text-left md:text-right">
                        <div className="text-sm font-extrabold text-foreground">
                          ₹{order.total}
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {order.paymentMethod} (Paid)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />

                        {action ? (
                          <Button
                            size="sm"
                            onClick={() => advanceOrderStatus(order.id)}
                            className="h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 shadow-xs"
                          >
                            <Check className="mr-1 size-3.5" />
                            {action.label}
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground px-2">
                            {order.status === "Completed" ? "Completed" : "Cancelled"}
                          </span>
                        )}

                        {order.status !== "Completed" && order.status !== "Cancelled" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelOrder(order.id)}
                            className="h-8 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 px-2"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. MENU MANAGEMENT — POS-STYLE PRODUCT CATALOG */}
      {activeTab === "Menu" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Menu Catalog
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Compact product catalog with real-time availability controls.
              </p>
            </div>

            <Button
              onClick={openAddItemModal}
              className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 shadow-xs h-9 px-3.5"
            >
              <Plus className="size-3.5" />
              Add Item
            </Button>
          </div>

          {/* Top Catalog Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search items..."
                  className="h-8 rounded-lg pl-8 text-xs bg-card"
                />
              </div>

              {/* Category selector */}
              <Select value={menuCategory} onValueChange={setMenuCategory}>
                <SelectTrigger className="h-8 w-32 rounded-lg text-xs bg-card">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="All" className="text-xs">All Categories</SelectItem>
                  <SelectItem value="Breakfast" className="text-xs">🥞 Breakfast</SelectItem>
                  <SelectItem value="Snacks" className="text-xs">🥪 Snacks</SelectItem>
                  <SelectItem value="Meals" className="text-xs">🍛 Meals</SelectItem>
                  <SelectItem value="Drinks" className="text-xs">🥤 Drinks</SelectItem>
                  <SelectItem value="Desserts" className="text-xs">🍰 Desserts</SelectItem>
                </SelectContent>
              </Select>

              {/* Availability selector */}
              <Select value={menuAvailability} onValueChange={setMenuAvailability}>
                <SelectTrigger className="h-8 w-32 rounded-lg text-xs bg-card">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="All" className="text-xs">All Availability</SelectItem>
                  <SelectItem value="available" className="text-xs">Available Only</SelectItem>
                  <SelectItem value="unavailable" className="text-xs">Unavailable Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <span className="text-xs text-muted-foreground font-medium">
              Showing <b>{filteredFoods.length}</b> dishes
            </span>
          </div>

          {/* Compact POS Menu Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Prep Time</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-center">Availability</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredFoods.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Item with small emoji badge */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <FoodEmojiBadge
                            name={item.name}
                            category={item.category}
                            emoji={item.emoji}
                            size="sm"
                          />
                          <span className="font-bold text-foreground text-xs sm:text-sm">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-medium text-muted-foreground">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-muted-foreground text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground" />
                          {item.prepTime}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-black text-foreground sm:text-sm">
                        ₹{item.price}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <Switch
                            checked={item.available}
                            onCheckedChange={() => toggleFoodAvailability(item.id)}
                          />
                          <span
                            className={`text-[11px] font-bold ${
                              item.available ? "text-success" : "text-muted-foreground"
                            }`}
                          >
                            {item.available ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditItemModal(item)}
                          className="h-7 rounded-md text-xs font-semibold px-2.5 hover:border-primary/50"
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {filteredFoods.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                        No food items match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. CATEGORIES TAB */}
      {activeTab === "Categories" && (
        <div className="space-y-4">
          <div className="border-b border-border/70 pb-3">
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Menu Categories
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Campus food classification and quick filtering groups.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Breakfast", emoji: "🥞", count: canteenFoods.filter((f) => f.category === "Breakfast").length, desc: "Dosaball, Idli, Poha, Fresh Morning Items" },
              { name: "Snacks", emoji: "🥪", count: canteenFoods.filter((f) => f.category === "Snacks").length, desc: "Wraps, Grilled Sandwiches, Samosas, Fries" },
              { name: "Meals", emoji: "🍛", count: canteenFoods.filter((f) => f.category === "Meals").length, desc: "Thalis, Dum Biryanis, Rice Bowls, Pizzas" },
              { name: "Drinks", emoji: "🥤", count: canteenFoods.filter((f) => f.category === "Drinks").length, desc: "Artisanal Cold Coffee, Mango Lassi, Masala Chai" },
              { name: "Desserts", emoji: "🍰", count: canteenFoods.filter((f) => f.category === "Desserts").length, desc: "Walnut Brownies, Cakes, Sweet Bites" },
            ].map((cat) => (
              <div
                key={cat.name}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <div className="grid size-11 place-items-center rounded-xl bg-muted/80 text-2xl shrink-0 border border-border/70 select-none">
                  {cat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground text-sm sm:text-base">
                      {cat.name}
                    </h3>
                    <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[11px] font-bold">
                      {cat.count} items
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">
                    {cat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ANALYTICS TAB */}
      {activeTab === "Analytics" && (
        <div className="space-y-4">
          <div className="border-b border-border/70 pb-3">
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Canteen Performance & Sales
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Turnover velocity, average ticket size, and item demand for {activeCanteen.name}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <MetricCard
              label="Canteen GMV"
              value={`₹${canteenSales.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              delta={canteenSales > 0 ? "Live gross" : "No sales"}
              subtext="Realtime orders aggregate"
            />
            <MetricCard
              label="Orders Handled"
              value={String(canteenOrders.length)}
              icon={ShoppingBag}
              delta={canteenOrders.length > 0 ? `${canteenOrders.length} tickets` : "Zero tickets"}
              subtext="Total tickets"
            />
            <MetricCard
              label="Average Ticket"
              value={`₹${avgTicket.toLocaleString("en-IN")}`}
              icon={Receipt}
              delta={avgTicket > 0 ? "Per order value" : "N/A"}
              subtext="Per order value"
            />
            <MetricCard
              label="Top Dish"
              value={topDish ? topDish.name : "None yet"}
              icon={Coffee}
              delta={topDish ? `${topDish.count} orders` : "No orders"}
              subtext={topDish ? `${topDish.emoji || "🍽️"} Highest demand` : "Awaiting orders"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Hourly Revenue Graph */}
            <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">
                    Hourly Sales Distribution
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Peak counter rush from 11:00 AM to 02:00 PM.
                  </p>
                </div>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  Today
                </span>
              </div>

              <div className="mt-6 flex h-48 items-end gap-2 border-b border-border/60 pb-2">
                {[15, 30, 75, 95, 60, 50, 85, 90, 40, 25].map((val, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5 group">
                    <div
                      className="w-full rounded-t bg-primary/80 transition-all group-hover:bg-primary"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {[8, 9, 11, 12, 1, 2, 4, 5, 7, 8][i]}h
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top dishes list */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-foreground text-sm sm:text-base">
                Top Selling Items
              </h3>
              <div className="divide-y divide-border/60">
                {topSellingDishes.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">No menu items ordered yet</p>
                ) : (
                  topSellingDishes.map((dish) => (
                    <div key={dish.name} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">{dish.emoji || "🍽️"}</span>
                        <div>
                          <p className="font-bold text-foreground">{dish.name}</p>
                          <p className="text-[10px] text-muted-foreground">{dish.count} orders</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-foreground">₹{dish.revenue.toLocaleString("en-IN")}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Food Item Modal (POS-Style) */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-5 sm:p-6 shadow-card border border-border">
          <DialogHeader className="text-left border-b border-border/60 pb-3">
            <DialogTitle className="text-base font-bold text-foreground">
              {editingItem ? "Edit Catalog Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-3.5 text-xs sm:text-sm">
            <div>
              <Label htmlFor="dish-name" className="text-xs font-semibold">
                Item Name *
              </Label>
              <Input
                id="dish-name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Masala Dosa"
                className="mt-1 h-9 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dish-price" className="text-xs font-semibold">
                  Price (₹) *
                </Label>
                <Input
                  id="dish-price"
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="90"
                  className="mt-1 h-9 rounded-lg text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Category *</Label>
                <Select
                  value={itemCategory}
                  onValueChange={(v) => {
                    const cat = v as FoodItem["category"];
                    setItemCategory(cat);
                    if (!itemEmoji) setItemEmoji(getCategoryEmoji(cat));
                  }}
                >
                  <SelectTrigger className="mt-1 h-9 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="Breakfast" className="text-xs">🥞 Breakfast</SelectItem>
                    <SelectItem value="Snacks" className="text-xs">🥪 Snacks</SelectItem>
                    <SelectItem value="Meals" className="text-xs">🍛 Meals</SelectItem>
                    <SelectItem value="Drinks" className="text-xs">🥤 Drinks</SelectItem>
                    <SelectItem value="Desserts" className="text-xs">🍰 Desserts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dish-emoji" className="text-xs font-semibold">
                  Food Emoji (Icon)
                </Label>
                <Input
                  id="dish-emoji"
                  value={itemEmoji}
                  onChange={(e) => setItemEmoji(e.target.value)}
                  placeholder="e.g. 🥞"
                  className="mt-1 h-9 rounded-lg text-xs"
                />
              </div>

              <div>
                <Label htmlFor="dish-prep" className="text-xs font-semibold">
                  Preparation Time
                </Label>
                <Input
                  id="dish-prep"
                  value={itemPrep}
                  onChange={(e) => setItemPrep(e.target.value)}
                  placeholder="e.g. 10-12 min"
                  className="mt-1 h-9 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dish-desc" className="text-xs font-semibold">
                Brief Description (Optional)
              </Label>
              <Textarea
                id="dish-desc"
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                placeholder="Crisp crepe served with coconut chutney and hot sambar."
                className="mt-1 rounded-lg text-xs resize-none"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-2.5 bg-muted/30">
              <div>
                <p className="text-xs font-bold text-foreground">Available on POS Menu</p>
                <p className="text-[11px] text-muted-foreground">Toggle off when item runs out of stock</p>
              </div>
              <Switch
                checked={itemAvailable}
                onCheckedChange={setItemAvailable}
              />
            </div>

            {itemFormError && (
              <p className="text-xs font-semibold text-destructive flex items-center gap-1">
                <AlertCircle className="size-3.5" />
                {itemFormError}
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t border-border/60 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsItemModalOpen(false)}
              className="rounded-lg text-xs font-semibold h-8"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveItem}
              className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-8 px-4"
            >
              Save Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
