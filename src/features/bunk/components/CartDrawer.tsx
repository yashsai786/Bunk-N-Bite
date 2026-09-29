import React from "react";
import { ArrowRight, Minus, Plus, Receipt, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBunk } from "../state";
import { FoodEmojiBadge } from "./FoodEmoji";
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
      <DialogContent className="max-w-md rounded-2xl p-5 sm:p-6 shadow-card border border-border">
        <DialogHeader className="text-left border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="size-4.5 text-primary" />
              <DialogTitle className="text-base font-bold tracking-tight text-foreground">
                Current Bill ({cartCount} {cartCount === 1 ? "item" : "items"})
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
            title="Tray is empty"
            description="Add items from the menu to build your campus order."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg text-xs"
              >
                Browse Menu
              </Button>
            }
          />
        ) : (
          <div className="mt-3 max-h-[50vh] overflow-y-auto pr-1 space-y-2 [scrollbar-width:thin]">
            {cartEntries.map(({ food, quantity }) => (
              <div
                key={food.id}
                className="flex items-center justify-between gap-2.5 rounded-lg border border-border/80 bg-card p-2.5 shadow-2xs hover:border-border transition-colors"
              >
                {/* 32px emoji badge */}
                <FoodEmojiBadge
                  name={food.name}
                  category={food.category}
                  emoji={food.emoji}
                  size="sm"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-xs font-bold text-foreground sm:text-sm">
                    {food.name}
                  </h4>
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    ₹{food.price} × {quantity} = <span className="font-bold text-foreground">₹{food.price * quantity}</span>
                  </p>
                </div>

                {/* Quantity adjuster */}
                <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(food.id, quantity - 1)}
                    aria-label="Decrease quantity"
                    className="grid size-6 place-items-center rounded text-foreground hover:bg-card transition-colors"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(food.id, quantity + 1)}
                    aria-label="Increase quantity"
                    className="grid size-6 place-items-center rounded text-foreground hover:bg-card transition-colors"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeFromCart(food.id)}
                  aria-label={`Remove ${food.name}`}
                  className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bill summary and Checkout CTA */}
        {cartEntries.length > 0 && (
          <div className="mt-3 border-t border-border/70 pt-3 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Item Subtotal</span>
              <span className="font-medium text-foreground">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Platform & Taxes (5%)</span>
              <span className="font-medium text-foreground">₹{cartTax}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border/60">
              <span>Grand Total</span>
              <span className="text-base font-extrabold text-primary">₹{cartTotal}</span>
            </div>

            <Button
              type="button"
              onClick={handleProceedToCheckout}
              className="mt-3 w-full gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs active:scale-98 transition-all h-10"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
