import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  IndianRupee,
  Layers,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Timer,
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

  const [orderFilter, setOrderFilter] = useState<string>("All");
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategory, setMenuCategory] = useState<string>("All");

  // Add / Edit Item Dialog state
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState<FoodItem["category"]>("Breakfast");
  const [itemPrep, setItemPrep] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemFormError, setItemFormError] = useState("");

  const activeCanteen =
    canteens.find((c) => c.id === selectedCanteenId) || canteens[0]!;

  const canteenOrders = orders.filter(
    (o) => o.canteenId === selectedCanteenId
  );

  const pendingCount = canteenOrders.filter(
    (o) => o.status === "Placed" || o.status === "Preparing"
  ).length;

  const completedCount = canteenOrders.filter(
    (o) => o.status === "Completed"
  ).length;

  const canteenFoods = foods.filter(
    (f) => f.canteenId === selectedCanteenId || true
  );

  const filteredOrders = canteenOrders.filter((o) => {
    if (orderFilter === "All") return true;
    return o.status === orderFilter;
  });

  const filteredFoods = canteenFoods.filter((f) => {
    const matchesCategory =
      menuCategory === "All" || f.category === menuCategory;
    const matchesSearch = f.name
      .toLowerCase()
      .includes(menuSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemName("");
    setItemPrice("");
    setItemCategory("Breakfast");
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
        image: foods[0]?.image || "",
        available: itemAvailable,
        prepTime: itemPrep || "10 min",
        description: itemDesc.trim() || "Delicious freshly prepared meal.",
        isVeg: true,
      });
    }

    setIsItemModalOpen(false);
  };

  const getNextAction = (status: OrderStatus) => {
    switch (status) {
      case "Placed":
        return { label: "Start Preparing", next: "Preparing", variant: "default" as const };
      case "Preparing":
        return { label: "Mark Ready", next: "Ready", variant: "default" as const };
      case "Ready":
        return { label: "Complete Order", next: "Completed", variant: "default" as const };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW TAB */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {activeCanteen.name}
                </h1>
                <StatusBadge status={activeCanteen.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Kitchen display & live order processing system.
              </p>
            </div>

            <Button
              onClick={() => setActiveTab("Live Orders")}
              className="rounded-full text-xs font-bold gap-1.5"
            >
              <Utensils className="size-4" />
              Kitchen Live Queue ({pendingCount})
            </Button>
          </div>

          <MetricGrid>
            <MetricCard
              label="Today's Orders"
              value={String(canteenOrders.length + 138)}
              icon={ShoppingBag}
              delta="+14%"
            />
            <MetricCard
              label="Today's Revenue"
              value="₹24,850"
              icon={IndianRupee}
              delta="+9.1%"
            />
            <MetricCard
              label="Active Queue"
              value={String(pendingCount)}
              icon={Clock}
              delta="In kitchen"
            />
            <MetricCard
              label="Completed Today"
              value={String(completedCount + 124)}
              icon={PackageCheck}
              delta="99.2% fulfillment"
            />
          </MetricGrid>

          {/* High Priority Live Orders Section */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  Priority Kitchen Queue
                </h2>
                <p className="text-xs text-muted-foreground">
                  Orders requiring preparation or ready for customer handoff.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("Live Orders")}
                className="text-xs font-semibold"
              >
                View all ({canteenOrders.length})
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {canteenOrders.slice(0, 6).map((order) => {
                const action = getNextAction(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:shadow-card"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                        <div>
                          <span className="font-black text-foreground text-base">
                            {order.id}
                          </span>
                          <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                            {order.tokenNumber}
                          </span>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      {/* Items breakdown */}
                      <div className="mt-3 space-y-1 text-xs sm:text-sm">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between font-medium">
                            <span>
                              <b className="text-primary mr-1">{it.quantity}×</b>
                              {it.name}
                            </span>
                            <span className="text-muted-foreground">
                              ₹{it.price * it.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground">
                        <span>{order.customer}</span>
                        <span className="font-extrabold text-foreground">
                          ₹{order.total}
                        </span>
                      </div>
                    </div>

                    {/* Quick action button */}
                    <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3">
                      {action ? (
                        <Button
                          size="sm"
                          onClick={() => advanceOrderStatus(order.id)}
                          className="flex-1 rounded-full text-xs font-bold"
                        >
                          <Check className="mr-1 size-3.5" />
                          {action.label}
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground flex-1 text-center py-1">
                          {order.status === "Completed" ? "Fulfilled" : "Cancelled"}
                        </span>
                      )}

                      {order.status !== "Completed" && order.status !== "Cancelled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelOrder(order.id)}
                          className="h-8 rounded-full text-xs font-semibold text-destructive hover:bg-destructive/10"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. LIVE ORDERS TAB */}
      {activeTab === "Live Orders" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Kitchen Live Orders
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Click once to advance order through Placed → Preparing → Ready → Completed.
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.length === 0 ? (
              <div className="col-span-full">
                <EmptyState title={`No orders in '${orderFilter}' state`} />
              </div>
            ) : (
              filteredOrders.map((order) => {
                const action = getNextAction(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:shadow-card"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div>
                          <span className="text-lg font-black text-foreground">
                            {order.id}
                          </span>
                          <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                            {order.tokenNumber}
                          </span>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground flex justify-between">
                        <span>Customer: <b className="text-foreground">{order.customer}</b></span>
                        <span>{order.placedAt}</span>
                      </div>

                      {/* Food Items List */}
                      <div className="mt-4 space-y-1.5 rounded-2xl bg-muted/20 p-3 text-xs sm:text-sm">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between font-medium">
                            <span>
                              <span className="font-black text-primary mr-1.5">{it.quantity}×</span>
                              {it.name}
                            </span>
                            <span className="text-muted-foreground font-semibold">
                              ₹{it.price * it.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">
                          {order.paymentMethod} (Paid)
                        </span>
                        <span className="text-base font-black text-foreground">
                          Total: ₹{order.total}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t border-border/50 pt-3">
                      {action ? (
                        <Button
                          onClick={() => advanceOrderStatus(order.id)}
                          className="flex-1 rounded-full text-xs font-bold"
                        >
                          <Check className="mr-1 size-3.5" />
                          {action.label}
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground flex-1 text-center py-1">
                          {order.status}
                        </span>
                      )}

                      {order.status !== "Completed" && order.status !== "Cancelled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelOrder(order.id)}
                          className="h-8 rounded-full text-xs font-bold text-destructive hover:bg-destructive/10"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. MENU TAB */}
      {activeTab === "Menu" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Menu Management
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Toggle dish availability in real-time or add new offerings.
              </p>
            </div>

            <Button
              onClick={openAddItemModal}
              className="rounded-full text-xs font-bold gap-1.5 shadow-xs"
            >
              <Plus className="size-4" />
              Add Item
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category Capsules */}
            <div className="flex gap-1 overflow-x-auto rounded-full border border-border/70 bg-card p-1 shadow-xs">
              {["All", "Breakfast", "Snacks", "Meals", "Drinks"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMenuCategory(cat)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                    menuCategory === cat
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search food item..."
                className="rounded-full pl-10 text-xs shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredFoods.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xs transition-all hover:shadow-card"
              >
                <div>
                  <div className="relative aspect-4/3 w-full bg-muted">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <StatusBadge
                        status={item.available ? "Available" : "Unavailable"}
                      />
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-foreground text-sm sm:text-base">
                        {item.name}
                      </h3>
                      <span className="font-black text-foreground text-base">
                        ₹{item.price}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      {item.prepTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 p-4 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={item.available}
                      onCheckedChange={() => toggleFoodAvailability(item.id)}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {item.available ? "Live" : "Off"}
                    </span>
                  </label>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditItemModal(item)}
                    className="h-7 rounded-full text-xs font-semibold"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CATEGORIES TAB */}
      {activeTab === "Categories" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Menu Categories
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Classify items for quick student discovery.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Breakfast", items: 6, desc: "Dosaball, Idli, Poha, Sandwiches" },
              { name: "Snacks", items: 8, desc: "Wraps, Rolls, Samosa, Grilled Sandwiches" },
              { name: "Meals", items: 5, desc: "Thalis, Biryanis, Rice Bowls, Chole Bhature" },
              { name: "Drinks", items: 7, desc: "Cold Coffee, Mango Lassi, Fresh Juices" },
            ].map((cat) => (
              <div
                key={cat.name}
                className="rounded-3xl border border-border/70 bg-card p-5 shadow-xs"
              >
                <div className="grid size-10 place-items-center rounded-2xl bg-muted text-primary">
                  <Layers className="size-5" />
                </div>
                <h3 className="mt-4 font-bold text-foreground text-base">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                <div className="mt-4 pt-3 border-t border-border/50 flex justify-between text-xs">
                  <span className="font-semibold text-foreground">{cat.items} dishes</span>
                  <span className="text-muted-foreground">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ANALYTICS TAB */}
      {activeTab === "Analytics" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Canteen Sales Performance
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Daily turnover and item demand trends for {activeCanteen.name}.
              </p>
            </div>
          </div>

          <MetricGrid>
            <MetricCard
              label="Today's GMV"
              value="₹24,850"
              icon={IndianRupee}
              delta="+14.2%"
            />
            <MetricCard
              label="Orders Handled"
              value="142"
              icon={ShoppingBag}
              delta="+9%"
            />
            <MetricCard
              label="Average Ticket"
              value="₹175"
              icon={Store}
              delta="+3.8%"
            />
            <MetricCard
              label="Top Dish"
              value="Masala Dosa"
              icon={Coffee}
              delta="48 orders"
            />
          </MetricGrid>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-border/70 bg-card p-6 lg:col-span-2 shadow-xs">
              <h3 className="font-bold text-foreground">Revenue Trend (Hourly)</h3>
              <p className="text-xs text-muted-foreground mt-1">Today's sales volume trajectory.</p>

              <div className="mt-6 flex h-56 items-end gap-3 border-b border-border/60 pb-2">
                {[15, 30, 75, 95, 60, 50, 85, 90, 40, 25].map((val, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5 group">
                    <div
                      className="w-full rounded-t-lg bg-primary/80 transition-all group-hover:bg-primary"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {[8, 9, 11, 12, 1, 2, 4, 5, 7, 8][i]}h
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-3">
              <h3 className="font-bold text-foreground">Top Selling Items</h3>
              <div className="divide-y divide-border/60">
                {[
                  { name: "Masala Dosa", count: 48, revenue: "₹4,560" },
                  { name: "Cold Coffee", count: 42, revenue: "₹3,570" },
                  { name: "Paneer Tikka Wrap", count: 31, revenue: "₹4,185" },
                  { name: "Hyderabadi Veg Biryani", count: 24, revenue: "₹3,840" },
                ].map((dish, i) => (
                  <div key={dish.name} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <p className="font-bold text-foreground">{dish.name}</p>
                      <p className="text-[11px] text-muted-foreground">{dish.count} orders</p>
                    </div>
                    <span className="font-extrabold text-foreground">{dish.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Food Item Modal */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7 shadow-card">
          <DialogHeader className="text-left border-b border-border/60 pb-3">
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingItem ? "Edit Menu Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4 text-xs sm:text-sm">
            <div>
              <Label htmlFor="dish-name">Item Name *</Label>
              <Input
                id="dish-name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Masala Dosa"
                className="mt-1 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dish-price">Price (₹) *</Label>
                <Input
                  id="dish-price"
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="95"
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={itemCategory}
                  onValueChange={(v) => setItemCategory(v as FoodItem["category"])}
                >
                  <SelectTrigger className="mt-1 h-9 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Breakfast" className="text-xs">Breakfast</SelectItem>
                    <SelectItem value="Snacks" className="text-xs">Snacks</SelectItem>
                    <SelectItem value="Meals" className="text-xs">Meals</SelectItem>
                    <SelectItem value="Drinks" className="text-xs">Drinks</SelectItem>
                    <SelectItem value="Desserts" className="text-xs">Desserts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dish-prep">Preparation Time</Label>
              <Input
                id="dish-prep"
                value={itemPrep}
                onChange={(e) => setItemPrep(e.target.value)}
                placeholder="e.g. 10-12 min"
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="dish-desc">Description</Label>
              <Textarea
                id="dish-desc"
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                placeholder="Crispy crepe served with coconut chutney and sambar"
                className="mt-1 rounded-xl text-xs resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
              <div>
                <p className="text-xs font-bold text-foreground">Available on Menu</p>
                <p className="text-[11px] text-muted-foreground">Turn off if temporarily out of stock</p>
              </div>
              <Switch
                checked={itemAvailable}
                onCheckedChange={setItemAvailable}
              />
            </div>

            {itemFormError && (
              <p className="text-xs font-semibold text-destructive">
                {itemFormError}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsItemModalOpen(false)}
              className="rounded-full text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveItem}
              className="rounded-full text-xs font-bold"
            >
              Save Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
