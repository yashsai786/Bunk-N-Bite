import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  QrCode,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodCard } from "../components/FoodCard";
import { FoodDetailModal } from "../components/FoodDetailModal";
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
    universities.find((u) => u.id === selectedUniversityId) || universities[0]!;
  const activeCanteen =
    canteens.find((c) => c.id === selectedCanteenId) || canteens[0]!;

  const filteredFoods = foods.filter((f) => {
    const matchCat = categoryFilter === "All" || f.category === categoryFilter;
    const matchSearch = f.name
      .toLowerCase()
      .includes(visitorSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. VISITOR MENU TAB */}
      {activeTab === "Menu" && (
        <div className="space-y-6">
          {/* Fast QR Established Context Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-muted text-foreground">
                <QrCode className="size-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success uppercase tracking-wider">
                  <span className="size-1.5 rounded-full bg-success" />
                  QR Scan Verified
                </span>
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  {activeCanteen.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {activeCanteen.counterLocation} • {activeUniv.name}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCartOpen(true)}
              className="rounded-full text-xs font-bold gap-1.5 shadow-xs"
            >
              <ShoppingBag className="size-3.5" />
              Tray ({cartCount})
            </Button>
          </div>

          {/* Category capsules & Search */}
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
                value={visitorSearch}
                onChange={(e) => setVisitorSearch(e.target.value)}
                placeholder="Search food item..."
                className="rounded-full pl-10 text-xs shadow-xs"
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}

          {/* Floating Cart Button on mobile */}
          {cartCount > 0 && (
            <div className="sticky bottom-4 z-30 mx-auto max-w-md animate-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between gap-3 rounded-full border border-border/80 bg-foreground p-2 pl-5 text-background shadow-card">
                <div>
                  <span className="text-xs font-medium opacity-80">
                    {cartCount} items
                  </span>
                  <p className="text-sm font-black">₹{cartTotal}</p>
                </div>
                <Button
                  onClick={() => setActiveTab("Checkout")}
                  className="rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
                >
                  Pay & Order <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. VISITOR CHECKOUT TAB */}
      {activeTab === "Checkout" && (
        <div className="mx-auto max-w-lg space-y-6">
          <div className="border-b border-border/60 pb-3">
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Guest Checkout
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              No account required. Pay instantly with UPI or card.
            </p>
          </div>

          {cartCount === 0 ? (
            <EmptyState
              title="Your tray is empty"
              action={
                <Button
                  onClick={() => setActiveTab("Menu")}
                  className="rounded-full text-xs font-bold"
                >
                  Browse Menu
                </Button>
              }
            />
          ) : (
            <div className="space-y-5">
              <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-xs">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Pickup Counter
                </p>
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-muted text-primary">
                    <Store className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      {activeCanteen.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {activeCanteen.counterLocation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order breakdown */}
              <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-xs space-y-2 text-xs">
                <p className="font-bold text-muted-foreground uppercase tracking-wider text-[11px] mb-2">
                  Order Summary
                </p>
                {Object.entries(cart).map(([id, qty]) => {
                  const f = foods.find((item) => item.id === Number(id));
                  if (!f) return null;
                  return (
                    <div key={id} className="flex justify-between font-medium">
                      <span>{qty}× {f.name}</span>
                      <span className="font-bold">₹{f.price * qty}</span>
                    </div>
                  );
                })}
                <div className="border-t border-border/50 pt-2 flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes (5%)</span>
                  <span>₹{cartTax}</span>
                </div>
                <div className="border-t border-border/50 pt-2 flex justify-between text-sm font-black text-foreground">
                  <span>Total Payable</span>
                  <span className="text-primary">₹{cartTotal}</span>
                </div>
              </div>

              {/* Payment selector */}
              <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
                <p className="font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Select Payment Method
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["UPI", "Cards", "Net Banking"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setGuestPaymentMethod(method)}
                      className={`rounded-2xl border p-3 text-xs font-semibold transition-all ${
                        guestPaymentMethod === method
                          ? "border-primary bg-primary/10 text-foreground font-bold shadow-xs ring-1 ring-primary"
                          : "border-border/70 bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {method}
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
                  className="w-full h-11 rounded-full text-sm font-bold shadow-xs"
                >
                  Pay ₹{cartTotal}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. VISITOR CONFIRMATION TAB */}
      {activeTab === "Confirmation" && (
        <div className="mx-auto max-w-md text-center space-y-5">
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
              Token: <b className="text-foreground">{latestOrder?.tokenNumber || "TK-49"}</b> • Ready in ~10-12 mins
            </p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-5 text-left shadow-xs space-y-3">
            <div className="rounded-2xl bg-muted/30 p-3">
              <p className="text-xs font-bold text-foreground">
                {latestOrder?.canteenName}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {latestOrder?.pickupCounter}
              </p>
            </div>

            <div className="text-xs space-y-1">
              {latestOrder?.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.quantity}× {it.name}</span>
                  <span className="font-bold">₹{it.price * it.quantity}</span>
                </div>
              ))}
              <div className="border-t border-border/50 pt-2 flex justify-between font-black">
                <span>Total Paid</span>
                <span className="text-primary">₹{latestOrder?.total}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              if (latestOrder) setActiveOrderIdToTrack(latestOrder.id);
              setActiveTab("Tracking");
            }}
            className="w-full rounded-full font-bold text-xs"
          >
            Track Order Live
          </Button>
        </div>
      )}

      {/* 4. VISITOR TRACKING TAB */}
      {activeTab === "Tracking" && (
        <div className="mx-auto max-w-xl space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                Live Kitchen Tracker
              </h1>
              <p className="text-xs text-muted-foreground">
                Watch your token update as the kitchen prepares your meal.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("Menu")}
              className="rounded-full text-xs font-semibold"
            >
              Menu
            </Button>
          </div>

          {latestOrder && <OrderTimeline order={latestOrder} />}
        </div>
      )}

      {/* Global Food Detail Modal */}
      <FoodDetailModal />
    </div>
  );
}
