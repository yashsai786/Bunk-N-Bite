import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  Minus,
  Plus,
  QrCode,
  Receipt,
  Search,
  ShoppingBag,
  Store,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodCard } from "../components/FoodCard";
import { FoodDetailModal } from "../components/FoodDetailModal";
import { FoodEmojiBadge, getFoodEmoji } from "../components/FoodEmoji";
import { OrderTimeline } from "../components/OrderTimeline";
import { EmptyState } from "../components/States";
import { useBunk } from "../state";

export function VisitorView() {
  const {
    activeTab,
    setActiveTab,
    selectedUniversityId,
    selectedCanteenId,
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
    latestOrder,
    paymentState,
    processPaymentAndOrder,
    activeOrderIdToTrack,
    setActiveOrderIdToTrack,
    setIsCartOpen,
  } = useBunk();

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [visitorSearch, setVisitorSearch] = useState("");
  const [guestPaymentMethod, setGuestPaymentMethod] = useState<"UPI" | "Cards" | "Net Banking">("UPI");

  const activeUniv =
    universities.find((u) => u.id === selectedUniversityId) || universities[0];
  const activeCanteen =
    canteens.find((c) => c.id === selectedCanteenId) || canteens[0];

  const filteredFoods = foods.filter((f) => {
    const matchCat = categoryFilter === "All" || f.category === categoryFilter;
    const matchSearch = f.name
      .toLowerCase()
      .includes(visitorSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => {
      const food = foods.find((f) => f.id === Number(id));
      return food ? { food, quantity: qty } : null;
    })
    .filter(Boolean) as { food: (typeof foods)[0]; quantity: number }[];

  const trackedOrder =
    ordersTracked(activeOrderIdToTrack, latestOrder);

  function ordersTracked(activeId: string | null, latest: typeof latestOrder) {
    if (activeId && latest?.id === activeId) return latest;
    return latest;
  }

  return (
    <div className="space-y-5">
      {/* 1. VISITOR MENU TAB */}
      {(activeTab === "Menu" || activeTab === "Cart") && (
        <div className="space-y-4">
          {/* Fast QR Established Context Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-muted text-foreground shrink-0 border border-border/80">
                <QrCode className="size-5" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success uppercase tracking-wider">
                  <span className="size-1.5 rounded-full bg-success" />
                  QR Scan Verified
                </span>
                <h2 className="text-sm font-bold text-foreground sm:text-base">
                  {activeCanteen?.name || "Campus Canteen"}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {activeCanteen?.counterLocation || "Counter"} • {activeUniv?.name || "Campus"}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCartOpen(true)}
              className="rounded-lg text-xs font-bold gap-1.5 shadow-xs h-8.5 px-3"
            >
              <ShoppingBag className="size-3.5" />
              Tray ({cartCount})
            </Button>
          </div>

          {/* Suspended Alert Banner for Visitor */}
          {(activeCanteen?.operationalStatus === "Suspended" || activeCanteen?.status === "Closed") && (
            <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300 flex items-center gap-2.5 shadow-2xs">
              <AlertTriangle className="size-4 shrink-0 text-rose-600" />
              <span>
                <strong>Canteen Temporarily Suspended:</strong> This dining outlet is not accepting new orders at this time.
              </span>
            </div>
          )}

          {/* Desktop Two-Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Menu catalog */}
            <div className="lg:col-span-8 space-y-3.5">
              {/* Category capsules & Search */}
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
                    value={visitorSearch}
                    onChange={(e) => setVisitorSearch(e.target.value)}
                    placeholder="Search menu..."
                    className="h-8.5 rounded-lg pl-8 text-xs bg-card"
                  />
                </div>
              </div>

              {/* Food Grid */}
              {filteredFoods.length === 0 ? (
                <EmptyState
                  title="No items found"
                  description="No menu items match your search."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredFoods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Quick Order Bill Tray (Desktop) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-20">
              <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="size-4 text-primary" />
                    <h3 className="font-bold text-foreground text-sm">
                      Guest Tray
                    </h3>
                  </div>
                  <span className="rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-bold text-accent-foreground">
                    {cartCount} items
                  </span>
                </div>

                {cartEntries.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <ShoppingBag className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="font-semibold text-foreground">Tray is empty</p>
                    <p className="text-[11px] mt-0.5">Select menu items to order as a guest.</p>
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
                              ₹{food.price} × {quantity}
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
                        <span>Platform & Taxes (5%)</span>
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
                        <span>Proceed to Pay</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Floating Cart Button on mobile */}
          {cartCount > 0 && (
            <div className="lg:hidden sticky bottom-4 z-30 mx-auto max-w-md animate-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-foreground p-2 pl-4 text-background shadow-card">
                <div>
                  <span className="text-xs font-medium opacity-80">
                    {cartCount} items
                  </span>
                  <p className="text-sm font-black text-background">₹{cartTotal}</p>
                </div>
                <Button
                  onClick={() => setActiveTab("Checkout")}
                  className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-8.5 px-4 shadow-xs"
                >
                  Pay & Order <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. VISITOR CHECKOUT TAB — Strictly Online Payment */}
      {activeTab === "Checkout" && (
        <div className="mx-auto max-w-md space-y-4">
          <div className="border-b border-border/70 pb-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Guest Checkout
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Online payment mandatory • No login required.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("Menu")}
              className="text-xs font-semibold h-8 rounded-lg"
            >
              Back to Menu
            </Button>
          </div>

          {cartCount === 0 ? (
            <EmptyState
              title="Your tray is empty"
              action={
                <Button
                  onClick={() => setActiveTab("Menu")}
                  className="rounded-lg bg-primary text-primary-foreground text-xs font-bold h-8.5 px-4"
                >
                  Browse Menu
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Pickup Counter
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-lg bg-muted text-primary shrink-0">
                    <Store className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-xs sm:text-sm">
                      {activeCanteen?.name || "Campus Canteen"}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {activeCanteen?.counterLocation || "Food Court Counter"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order breakdown */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-2 text-xs">
                <p className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] mb-1">
                  Order Summary
                </p>
                {cartEntries.map(({ food, quantity }) => (
                  <div key={food.id} className="flex justify-between items-center py-1">
                    <span className="flex items-center gap-1.5">
                      <span>{getFoodEmoji(food.name)}</span>
                      <span>{quantity}× {food.name}</span>
                    </span>
                    <span className="font-bold text-foreground">₹{food.price * quantity}</span>
                  </div>
                ))}
                <div className="border-t border-border/50 pt-2 flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Tax (5%)</span>
                  <span>₹{cartTax}</span>
                </div>
                <div className="border-t border-border/50 pt-1.5 flex justify-between text-sm font-bold text-foreground">
                  <span>Total Amount</span>
                  <span className="text-base font-black text-primary">₹{cartTotal}</span>
                </div>
              </div>

              {/* Online payment options (Strictly online payment) */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
                <p className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Online Payment Options
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["UPI", "Cards", "Net Banking"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setGuestPaymentMethod(method)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                        guestPaymentMethod === method
                          ? "border-primary bg-primary/10 text-foreground font-bold shadow-xs ring-1 ring-primary"
                          : "border-border/70 bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <CreditCard className="size-3.5" />
                      <span>{method}</span>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={async () => {
                    const success = await processPaymentAndOrder(guestPaymentMethod);
                    if (success) {
                      setActiveTab("Confirmation");
                    }
                  }}
                  disabled={paymentState === "processing"}
                  className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-xs mt-2"
                >
                  Pay ₹{cartTotal} Online
                </Button>

                <p className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                  <Lock className="size-3" />
                  Visitor online payments are processed through secure gateway
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. VISITOR CONFIRMATION TAB */}
      {activeTab === "Confirmation" && (
        <div className="mx-auto max-w-md text-center space-y-4">
          <div className="grid size-14 place-items-center rounded-full bg-success-soft text-success mx-auto shadow-xs">
            <CheckCircle2 className="size-7" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-success">
              Order Confirmed
            </span>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground">
              {latestOrder?.id || "#1049"}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Token: <b className="text-foreground font-mono">{latestOrder?.tokenNumber || "TK-49"}</b> • Ready in ~10-12 mins
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 text-left shadow-xs space-y-3">
            <div className="rounded-lg bg-muted/40 p-2.5">
              <p className="text-xs font-bold text-foreground">
                {latestOrder?.canteenName}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {latestOrder?.pickupCounter}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                Ordered Items
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
                <span>Total Paid</span>
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
              onClick={() => setActiveTab("Menu")}
              className="w-full sm:w-auto rounded-lg font-semibold text-xs h-9 px-4"
            >
              Order More
            </Button>
          </div>
        </div>
      )}

      {/* 4. VISITOR TRACKING TAB */}
      {activeTab === "Tracking" && (
        <div className="mx-auto max-w-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Order Tracking
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Live kitchen progress for token <b className="text-foreground">{trackedOrder?.tokenNumber}</b>.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("Menu")}
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
              description="Scan and place an order to see live tracking updates."
              action={
                <Button
                  onClick={() => setActiveTab("Menu")}
                  className="rounded-lg bg-primary text-primary-foreground text-xs font-bold h-8.5 px-3.5"
                >
                  Order Now
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* Global Food Detail Modal */}
      <FoodDetailModal />
    </div>
  );
}
