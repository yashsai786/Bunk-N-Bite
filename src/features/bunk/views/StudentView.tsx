import React, { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  History,
  Loader2,
  Lock,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FoodCard } from "../components/FoodCard";
import { FoodDetailModal } from "../components/FoodDetailModal";
import { OrderTimeline } from "../components/OrderTimeline";
import { EmptyState } from "../components/States";
import { StatusBadge } from "../components/StatusBadge";
import { useBunk } from "../state";
import type { Order } from "../types";

export function StudentView() {
  const {
    activeTab,
    setActiveTab,
    selectedUniversityId,
    setSelectedUniversityId,
    selectedCanteenId,
    setSelectedCanteenId,
    universities,
    canteens,
    foods,
    cart,
    cartCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    orders,
    latestOrder,
    paymentState,
    setPaymentState,
    processPaymentAndOrder,
    activeOrderIdToTrack,
    setActiveOrderIdToTrack,
    setIsCartOpen,
  } = useBunk();

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [foodSearch, setFoodSearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<string>("All");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"UPI" | "Cards" | "Net Banking">("UPI");

  const activeUniv =
    universities.find((u) => u.id === selectedUniversityId) || universities[0]!;
  const activeCanteen =
    canteens.find((c) => c.id === selectedCanteenId) || canteens[0]!;

  const filteredFoods = foods.filter((f) => {
    const matchCategory =
      categoryFilter === "All" || f.category === categoryFilter;
    const matchSearch = f.name
      .toLowerCase()
      .includes(foodSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  const studentOrders = orders.filter((o) => o.customerRole === "Student");
  const filteredHistory = studentOrders.filter((o) => {
    if (historyFilter === "All") return true;
    if (historyFilter === "Active")
      return o.status === "Placed" || o.status === "Preparing" || o.status === "Ready";
    if (historyFilter === "Completed") return o.status === "Completed";
    return true;
  });

  const trackedOrder =
    orders.find((o) => o.id === activeOrderIdToTrack) || latestOrder;

  return (
    <div className="space-y-6">
      {/* 1. HOME TAB */}
      {activeTab === "Home" && (
        <div className="space-y-6">
          {/* Top Context & Welcome Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                What are you having?
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Skip the counter rush at <span className="font-bold text-foreground">{activeCanteen.name}</span> ({activeUniv.name}).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={selectedUniversityId}
                onValueChange={setSelectedUniversityId}
              >
                <SelectTrigger className="h-9 w-44 rounded-full border-border/70 bg-card text-xs font-semibold shadow-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {universities.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="text-xs">
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedCanteenId}
                onValueChange={setSelectedCanteenId}
              >
                <SelectTrigger className="h-9 w-40 rounded-full border-border/70 bg-card text-xs font-semibold shadow-xs">
                  <Store className="mr-1.5 size-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {canteens
                    .filter((c) => c.universityId === selectedUniversityId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Capsules & Search Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 overflow-x-auto rounded-full border border-border/70 bg-card p-1 shadow-xs [scrollbar-width:none]">
              {["All", "Breakfast", "Snacks", "Meals", "Drinks"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    categoryFilter === cat
                      ? "bg-foreground text-background shadow-xs font-bold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                placeholder="Search food by name..."
                className="rounded-full pl-10 text-xs shadow-xs"
              />
            </div>
          </div>

          {/* Food Grid */}
          {filteredFoods.length === 0 ? (
            <EmptyState
              title="No items found"
              description="Try selecting a different category or adjusting your search."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}

          {/* Floating Mobile Cart Bar if cart has items */}
          {cartCount > 0 && (
            <div className="sticky bottom-4 z-30 mx-auto max-w-md animate-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between gap-3 rounded-full border border-border/80 bg-foreground p-2 pl-5 text-background shadow-card">
                <div>
                  <span className="text-xs font-medium opacity-80">
                    {cartCount} {cartCount === 1 ? "dish" : "dishes"}
                  </span>
                  <p className="text-sm font-black">₹{cartTotal}</p>
                </div>
                <Button
                  onClick={() => setActiveTab("Checkout")}
                  className="rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
                >
                  Checkout <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CHECKOUT VIEW */}
      {activeTab === "Checkout" && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="border-b border-border/60 pb-3">
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Confirm & Pay
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Express student checkout • No queue waiting.
            </p>
          </div>

          {cartCount === 0 ? (
            <EmptyState
              title="Your tray is empty"
              description="Add food from the menu before proceeding to checkout."
              action={
                <Button
                  onClick={() => setActiveTab("Home")}
                  className="rounded-full text-xs font-bold"
                >
                  Browse Food Menu
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              {/* Pickup Counter details */}
              <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl bg-muted text-primary">
                      <Store className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm sm:text-base">
                        Pickup at {activeCanteen.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {activeCanteen.counterLocation} • {activeUniv.name}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("Home")}
                    className="text-xs font-semibold"
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Order Items list */}
              <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
                  Tray Summary
                </h3>
                <div className="divide-y divide-border/60">
                  {Object.entries(cart).map(([id, qty]) => {
                    const f = foods.find((item) => item.id === Number(id));
                    if (!f) return null;
                    return (
                      <div key={id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">{qty}×</span>
                          <span className="font-medium text-foreground">{f.name}</span>
                        </div>
                        <span className="font-bold text-foreground">₹{f.price * qty}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Tax (5%)</span>
                    <span>₹{cartTax}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-foreground pt-1 border-t border-border/50">
                    <span>Amount Payable</span>
                    <span className="text-base text-primary">₹{cartTotal}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
                  Payment Method
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(["UPI", "Cards", "Net Banking"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3.5 text-xs font-semibold transition-all ${
                        selectedPaymentMethod === method
                          ? "border-primary bg-primary/10 text-foreground font-bold shadow-xs ring-1 ring-primary"
                          : "border-border/70 bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <CreditCard className="size-4" />
                      <span>{method}</span>
                    </button>
                  ))}
                </div>

                {/* Simulated Payment Trigger */}
                <div className="mt-6">
                  <Button
                    onClick={async () => {
                      const success = await processPaymentAndOrder(selectedPaymentMethod);
                      if (success) {
                        setActiveTab("Confirmation");
                      }
                    }}
                    disabled={paymentState === "processing"}
                    className="w-full h-11 rounded-full text-sm font-bold shadow-xs"
                  >
                    {paymentState === "processing" ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Verifying {selectedPaymentMethod}...
                      </span>
                    ) : (
                      <span>Pay ₹{cartTotal} Online</span>
                    )}
                  </Button>

                  <p className="mt-2 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                    <Lock className="size-3" />
                    256-Bit Encrypted Campus Payment Gateway
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. CONFIRMATION VIEW */}
      {activeTab === "Confirmation" && (
        <div className="mx-auto max-w-xl text-center space-y-5">
          <div className="grid size-16 place-items-center rounded-full bg-success-soft text-success mx-auto shadow-xs">
            <CheckCircle2 className="size-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-success">
              Order Confirmed
            </span>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">
              {latestOrder?.id || "#1049"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Token: <b className="text-foreground">{latestOrder?.tokenNumber || "TK-49"}</b> • Sent directly to {latestOrder?.canteenName || "Central Café"}
            </p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 text-left shadow-xs space-y-4">
            <div className="rounded-2xl bg-muted/30 p-3.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                Pickup Location
              </span>
              <p className="font-bold text-foreground text-sm">
                {latestOrder?.canteenName} • {latestOrder?.pickupCounter}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
                Ordered Items
              </span>
              {latestOrder?.items.map((i, idx) => (
                <div key={idx} className="flex justify-between font-medium">
                  <span>{i.quantity}× {i.name}</span>
                  <span className="font-bold text-foreground">₹{i.price * i.quantity}</span>
                </div>
              ))}
              <div className="border-t border-border/50 pt-2 flex justify-between font-black text-sm">
                <span>Total Paid</span>
                <span className="text-primary">₹{latestOrder?.total}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Button
              onClick={() => {
                if (latestOrder) setActiveOrderIdToTrack(latestOrder.id);
                setActiveTab("Tracking");
              }}
              className="w-full sm:w-auto rounded-full font-bold text-xs"
            >
              Track Order Live
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab("Orders")}
              className="w-full sm:w-auto rounded-full font-semibold text-xs"
            >
              View Order History
            </Button>
          </div>
        </div>
      )}

      {/* 4. TRACKING VIEW */}
      {activeTab === "Tracking" && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Order Tracking
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Live status updates from the kitchen.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("Home")}
              className="rounded-full text-xs font-semibold"
            >
              Back to Menu
            </Button>
          </div>

          {trackedOrder ? (
            <OrderTimeline order={trackedOrder} />
          ) : (
            <EmptyState
              title="No active order to track"
              description="Place a meal order from the campus menu to track live progress."
              action={
                <Button
                  onClick={() => setActiveTab("Home")}
                  className="rounded-full text-xs font-bold"
                >
                  Order Now
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* 5. ORDERS HISTORY TAB */}
      {activeTab === "Orders" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                My Orders
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                All campus orders placed with your student account.
              </p>
            </div>

            <div className="flex gap-1 rounded-full border border-border/70 bg-card p-1 shadow-xs">
              {["All", "Active", "Completed"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                    historyFilter === filter
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <EmptyState
                title="No past orders found"
                description="Orders you place will appear here with live tracking links."
              />
            ) : (
              filteredHistory.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs transition-all hover:shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-2xl bg-muted text-foreground">
                      <UtensilsCrossed className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm sm:text-base">
                          {order.id}
                        </span>
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {order.tokenNumber}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.placedAt} • {order.canteenName}
                      </p>
                      <p className="text-xs font-medium text-foreground mt-0.5">
                        {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-base font-black text-foreground">
                        ₹{order.total}
                      </span>
                      <div className="mt-0.5">
                        <StatusBadge status={order.status} />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveOrderIdToTrack(order.id);
                        setActiveTab("Tracking");
                      }}
                      className="h-8 rounded-full text-xs font-semibold"
                    >
                      Track
                      <ChevronRight className="ml-1 size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Global Food Detail Modal */}
      <FoodDetailModal />
    </div>
  );
}
