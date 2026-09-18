import React from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBunk } from "../state";
import { EmptyState } from "./States";

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    foods,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    cartCount,
    setActiveTab,
    role,
  } = useBunk();

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => {
      const food = foods.find((f) => f.id === Number(id));
      return food ? { food, quantity: qty } : null;
    })
    .filter(Boolean) as { food: (typeof foods)[0]; quantity: number }[];

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setActiveTab("Checkout");
  };

  return (
    <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7 shadow-card">
        <DialogHeader className="text-left border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-foreground" />
              <DialogTitle className="text-lg font-black tracking-tight text-foreground">
                Your Tray ({cartCount})
              </DialogTitle>
            </div>
            {cartEntries.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Cart items */}
        {cartEntries.length === 0 ? (
          <EmptyState
            title="Your tray is empty"
            description="Add delicious items from the campus menu to begin ordering."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCartOpen(false)}
                className="rounded-full text-xs"
              >
                Browse menu
              </Button>
            }
          />
        ) : (
          <div className="mt-3 max-h-[50vh] overflow-y-auto pr-1 space-y-3 [scrollbar-width:thin]">
            {cartEntries.map(({ food, quantity }) => (
              <div
                key={food.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-xs"
              >
                <img
                  src={food.image}
                  alt={food.name}
                  className="size-14 rounded-xl object-cover"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-xs font-bold text-foreground sm:text-sm">
                    {food.name}
                  </h4>
                  <p className="text-xs font-semibold text-muted-foreground">
                    ₹{food.price}
                  </p>
                </div>

                {/* Quantity adjuster */}
                <div className="flex items-center rounded-full border border-border bg-muted/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(food.id, quantity - 1)}
                    aria-label="Decrease quantity"
                    className="grid size-6 place-items-center rounded-full text-foreground hover:bg-muted"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(food.id, quantity + 1)}
                    aria-label="Increase quantity"
                    className="grid size-6 place-items-center rounded-full text-foreground hover:bg-muted"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeFromCart(food.id)}
                  aria-label={`Remove ${food.name}`}
                  className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bill summary and Checkout CTA */}
        {cartEntries.length > 0 && (
          <div className="mt-4 border-t border-border/70 pt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Item Subtotal</span>
              <span>₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Platform & Taxes (5%)</span>
              <span>₹{cartTax}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-foreground pt-1 border-t border-border/50">
              <span>Grand Total</span>
              <span className="text-base text-primary">₹{cartTotal}</span>
            </div>

            <Button
              type="button"
              onClick={handleProceedToCheckout}
              className="mt-4 w-full gap-2 rounded-full font-bold shadow-xs active:scale-98 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
