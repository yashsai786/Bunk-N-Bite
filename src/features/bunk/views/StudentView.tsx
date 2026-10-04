import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  History,
  Loader2,
  Lock,
  Minus,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  ShoppingBag,
  Store,
  Trash2,
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
import { FoodEmojiBadge, getFoodEmoji } from "../components/FoodEmoji";
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
    updateCartQuantity,
    removeFromCart,
    clearCart,
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

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => {
      const food = foods.find((f) => f.id === Number(id));
      return food ? { food, quantity: qty } : null;
    })
    .filter(Boolean) as { food: (typeof foods)[0]; quantity: number }[];

  return (
    <div className="space-y-5">
      {/* 1. HOME TAB — Counter Terminal Ordering */}
      {activeTab === "Home" && (
        <div className="space-y-4">
          {/* Top Context Bar: Campus & Canteen selectors */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Canteen Counter Terminal
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Order directly from <span className="font-bold text-foreground">{activeCanteen.name}</span> • {activeUniv.name}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={selectedUniversityId}
                onValueChange={setSelectedUniversityId}
              >
                <SelectTrigger className="h-8.5 w-44 rounded-lg border-border/70 bg-card text-xs font-semibold shadow-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
                <SelectTrigger className="h-8.5 w-40 rounded-lg border-border/70 bg-card text-xs font-semibold shadow-xs">
                  <Store className="mr-1.5 size-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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

          {/* Desktop Two-Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Area (Col 1-8): Menu catalog */}
            <div className="lg:col-span-8 space-y-3.5">
              {/* Category Capsules & Search Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 shadow-2xs [scrollbar-width:none]">
                  {[
                    { label: "All", emoji: "" },
                    { label: "Breakfast", emoji: "🥞" },
                    { label: "Snacks", emoji: "🥪" },
                    { label: "Meals", emoji: "🍛" },
                    { label: "Drinks", emoji: "🥤" },
                    { label: "Desserts", emoji: "🍰" },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setCategoryFilter(cat.label)}
                      className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1 ${
                        categoryFilter === cat.label
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {cat.emoji && <span>{cat.emoji}</span>}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                    placeholder="Search menu items..."
                    className="h-8.5 rounded-lg pl-8 text-xs bg-card"
                  />
                </div>
              </div>

              {/* Food Grid with compact cards */}
              {filteredFoods.length === 0 ? (
                <EmptyState
                  title="No items found"
                  description="Try selecting a different category or adjusting your search query."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredFoods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))}
                </div>
              )}
            </div>

            {/* Right Area (Col 9-12): POS-Style Billing Tray Panel (Desktop) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-20">
              <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="size-4 text-primary" />
                    <h3 className="font-bold text-foreground text-sm">
                      Current Order
                    </h3>
                  </div>
                  <span className="rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-bold text-accent-foreground">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                </div>

                {cartEntries.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <ShoppingBag className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="font-semibold text-foreground">Tray is empty</p>
                    <p className="text-[11px] mt-0.5">Click [+] on any menu item to add it to your order.</p>
                  </div>
                ) : (
                  <>
                    <div className="mt-3 max-h-[360px] overflow-y-auto space-y-2 pr-1 [scrollbar-width:thin]">
                      {cartEntries.map(({ food, quantity }) => (
                        <div
                          key={food.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/50 p-2 shadow-2xs"
                        >
                          <FoodEmojiBadge
                            name={food.name}
                            category={food.category}
                            emoji={food.emoji}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-bold text-foreground">
                              {food.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-semibold">
                              ₹{food.price} × {quantity} = <b className="text-foreground">₹{food.price * quantity}</b>
                            </p>
                          </div>

                          <div className="flex items-center rounded-md border border-border bg-card p-0.5">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(food.id, quantity - 1)}
                              aria-label="Decrease quantity"
                              className="grid size-5.5 place-items-center rounded text-foreground hover:bg-muted"
                            >
                              <Minus className="size-2.5" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(food.id, quantity + 1)}
                              aria-label="Increase quantity"
                              className="grid size-5.5 place-items-center rounded text-foreground hover:bg-muted"
                            >
                              <Plus className="size-2.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(food.id)}
                            aria-label={`Remove ${food.name}`}
                            className="text-muted-foreground hover:text-destructive p-1"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 border-t border-border/70 pt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-semibold text-foreground">₹{cartSubtotal}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tax & Platform (5%)</span>
                        <span className="font-semibold text-foreground">₹{cartTax}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border/60">
                        <span>Total Payable</span>
                        <span className="text-base font-black text-primary">₹{cartTotal}</span>
                      </div>

                      <Button
                        type="button"
                        onClick={() => setActiveTab("Checkout")}
                        className="mt-3 w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs gap-1.5"
                      >
                        <span>Checkout</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Floating Mobile Cart Bar */}
          {cartCount > 0 && (
            <div className="lg:hidden sticky bottom-4 z-30 mx-auto max-w-md animate-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-foreground p-2 pl-4 text-background shadow-card">
                <div>
                  <span className="text-xs font-medium opacity-80">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                  <p className="text-sm font-black text-background">₹{cartTotal}</p>
                </div>
                <Button
                  onClick={() => setActiveTab("Checkout")}
                  className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-8.5 px-4 shadow-xs"
                >
                  Checkout <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CHECKOUT VIEW — Compact Restaurant POS Billing Checkout */}
      {activeTab === "Checkout" && (
        <div className="mx-auto max-w-xl space-y-5">
          <div className="border-b border-border/70 pb-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Billing & Checkout
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Express campus ordering • Direct token generation.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("Home")}
              className="text-xs font-semibold h-8 rounded-lg"
            >
              Back to Menu
            </Button>
          </div>

          {cartCount === 0 ? (
            <EmptyState
              title="Your tray is empty"
              description="Add items from the menu before proceeding to payment."
              action={
                <Button
                  onClick={() => setActiveTab("Home")}
                  className="rounded-lg bg-primary text-primary-foreground text-xs font-bold h-9 px-4"
                >
                  Browse Food Menu
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {/* Pickup Counter details */}
              <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center rounded-lg bg-muted text-primary shrink-0">
                      <Store className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-xs sm:text-sm">
                        Pickup at {activeCanteen.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {activeCanteen.counterLocation} • {activeUniv.name}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("Home")}
                    className="text-xs font-semibold text-primary h-7"
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Order Items list with small emojis */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Order Summary
                </h3>
                <div className="divide-y divide-border/60">
                  {cartEntries.map(({ food, quantity }) => (
                    <div key={food.id} className="py-2 flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <FoodEmojiBadge
                          name={food.name}
                          category={food.category}
                          emoji={food.emoji}
                          size="sm"
                        />
                        <span className="font-bold text-primary mr-1">{quantity}×</span>
                        <span className="font-medium text-foreground">{food.name}</span>
                      </div>
                      <span className="font-bold text-foreground">₹{food.price * quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Item Subtotal</span>
                    <span className="font-medium text-foreground">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Tax (5%)</span>
                    <span className="font-medium text-foreground">₹{cartTax}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border/50">
                    <span>Total Amount</span>
                    <span className="text-base font-black text-primary">₹{cartTotal}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Select Payment Option
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(["UPI", "Cards", "Net Banking"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-3 text-xs font-semibold transition-all ${
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
                <div className="mt-5">
                  <Button
                    onClick={async () => {
                      const success = await processPaymentAndOrder(selectedPaymentMethod);
                      if (success) {
                        setActiveTab("Confirmation");
                      }
                    }}
                    disabled={paymentState === "processing"}
                    className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-xs"
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
        <div className="mx-auto max-w-md text-center space-y-4">
          <div className="grid size-14 place-items-center rounded-full bg-success-soft text-success mx-auto shadow-xs">
            <CheckCircle2 className="size-7" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-success">
              Payment Successful
            </span>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground">
              {latestOrder?.id || "#1049"}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pickup Token: <b className="text-foreground font-mono">{latestOrder?.tokenNumber || "TK-49"}</b>
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 text-left shadow-xs space-y-3">
            <div className="rounded-lg bg-muted/40 p-2.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Ready For Collection At
              </span>
              <p className="font-bold text-foreground text-xs sm:text-sm">
                {latestOrder?.canteenName} • {latestOrder?.pickupCounter}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                Items Ordered
              </span>
              {latestOrder?.items.map((i, idx) => (
                <div key={idx} className="flex justify-between font-medium">
                  <span className="flex items-center gap-1">
                    <span>{getFoodEmoji(i.name)}</span>
                    <span>{i.quantity}× {i.name}</span>
                  </span>
                  <span className="font-bold text-foreground">₹{i.price * i.quantity}</span>
                </div>
              ))}
              <div className="border-t border-border/50 pt-2 flex justify-between font-extrabold text-sm">
                <span>Paid via {latestOrder?.paymentMethod}</span>
                <span className="text-primary">₹{latestOrder?.total}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <Button
              onClick={() => {
                if (latestOrder) setActiveOrderIdToTrack(latestOrder.id);
                setActiveTab("Tracking");
              }}
              className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-4"
            >
              Track Order Live
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab("Orders")}
              className="w-full sm:w-auto rounded-lg font-semibold text-xs h-9 px-4"
            >
              Order History
            </Button>
          </div>
        </div>
      )}

      {/* 4. TRACKING VIEW */}
      {activeTab === "Tracking" && (
        <div className="mx-auto max-w-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Order Tracking
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Kitchen status updates in real time.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("Home")}
              className="rounded-lg text-xs font-semibold h-8"
            >
              Back to Menu
            </Button>
          </div>

          {trackedOrder ? (
            <OrderTimeline order={trackedOrder} />
          ) : (
            <EmptyState
              title="No active order to track"
              description="Place an order from the menu to see its live kitchen status."
              action={
                <Button
                  onClick={() => setActiveTab("Home")}
                  className="rounded-lg bg-primary text-primary-foreground text-xs font-bold h-8.5 px-3.5"
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
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                My Orders
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Student meal transactions and digital tokens.
              </p>
            </div>

            <div className="flex gap-1 rounded-lg border border-border bg-card p-1 shadow-2xs">
              {["All", "Active", "Completed"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    historyFilter === filter
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredHistory.length === 0 ? (
              <EmptyState
                title="No past orders found"
                description="Orders placed on campus will appear here with instant tracking."
              />
            ) : (
              filteredHistory.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-2xs hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-muted text-foreground font-mono text-xs font-bold shrink-0">
                      {order.tokenNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">
                          {order.id}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {order.placedAt} • {order.canteenName}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-foreground/90 mt-0.5 flex flex-wrap gap-1.5 items-center">
                        {order.items.map((i, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1">
                            <span>{getFoodEmoji(i.name)}</span>
                            <span>{i.quantity}× {i.name}</span>
                            {idx < order.items.length - 1 && <span className="text-muted-foreground">,</span>}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-black text-foreground">
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
                      className="h-8 rounded-lg text-xs font-semibold px-2.5 hover:border-primary/50"
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
