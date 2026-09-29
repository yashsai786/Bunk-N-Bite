import React, { useState } from "react";
import { Clock, Minus, Plus, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBunk } from "../state";
import { FoodEmojiBadge } from "./FoodEmoji";
import { StatusBadge } from "./StatusBadge";

export function FoodDetailModal() {
  const { selectedFoodDetail, setSelectedFoodDetail, addToCart, setIsCartOpen } = useBunk();
  const [quantity, setQuantity] = useState(1);

  if (!selectedFoodDetail) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(selectedFoodDetail.id);
    }
    setSelectedFoodDetail(null);
    setQuantity(1);
    setIsCartOpen(true);
  };

  return (
    <Dialog
      open={!!selectedFoodDetail}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedFoodDetail(null);
          setQuantity(1);
        }
      }}
    >
      <DialogContent className="max-w-md rounded-2xl p-5 sm:p-6 shadow-card border border-border">
        {/* Header with Emoji Container */}
        <div className="flex items-start gap-3.5 border-b border-border/70 pb-4">
          <FoodEmojiBadge
            name={selectedFoodDetail.name}
            category={selectedFoodDetail.category}
            emoji={selectedFoodDetail.emoji}
            size="lg"
            className="border-primary/30 bg-accent/40"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                {selectedFoodDetail.name}
              </DialogTitle>
              <StatusBadge
                status={selectedFoodDetail.available ? "Available" : "Unavailable"}
              />
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{selectedFoodDetail.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {selectedFoodDetail.prepTime}
              </span>
            </div>

            <div className="mt-2 text-xl font-extrabold text-foreground">
              ₹{selectedFoodDetail.price}
            </div>
          </div>
        </div>

        {/* Content & Description */}
        <div className="py-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Description
          </h4>
          <p className="mt-1 text-xs text-foreground/80 leading-relaxed sm:text-sm">
            {selectedFoodDetail.description || "Freshly prepared dining item made to order in campus kitchen."}
          </p>
        </div>

        {/* Quantity and Add CTA */}
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="grid size-7 place-items-center rounded text-foreground hover:bg-card disabled:opacity-40 transition-colors"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="grid size-7 place-items-center rounded text-foreground hover:bg-card transition-colors"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <Button
            type="button"
            disabled={!selectedFoodDetail.available}
            onClick={handleAddToCart}
            className="flex-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold tracking-normal sm:text-sm h-10"
          >
            Add to Tray · ₹{selectedFoodDetail.price * quantity}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
