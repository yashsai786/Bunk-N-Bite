import React, { useState } from "react";
import { Clock, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBunk } from "../state";
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
      <DialogContent className="max-w-lg overflow-hidden rounded-3xl p-0 shadow-card">
        {/* Food Image */}
        <div className="relative aspect-16/10 w-full bg-muted">
          <img
            src={selectedFoodDetail.image}
            alt={selectedFoodDetail.name}
            className="size-full object-cover"
          />
          <div className="absolute top-3.5 left-3.5">
            <StatusBadge
              status={selectedFoodDetail.available ? "Available" : "Unavailable"}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <DialogHeader className="text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-xl font-black tracking-tight text-foreground">
                  {selectedFoodDetail.name}
                </DialogTitle>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{selectedFoodDetail.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {selectedFoodDetail.prepTime}
                  </span>
                </div>
              </div>
              <span className="text-2xl font-black text-foreground">
                ₹{selectedFoodDetail.price}
              </span>
            </div>
          </DialogHeader>

          <p className="mt-4 text-xs text-muted-foreground leading-relaxed sm:text-sm">
            {selectedFoodDetail.description}
          </p>

          {/* Quantity and Add CTA */}
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-border/70 pt-4">
            <div className="flex items-center rounded-full border border-border bg-card p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="grid size-8 place-items-center rounded-full text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-foreground">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="grid size-8 place-items-center rounded-full text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            <Button
              type="button"
              disabled={!selectedFoodDetail.available}
              onClick={handleAddToCart}
              className="flex-1 rounded-full text-xs font-bold tracking-normal sm:text-sm"
            >
              Add to Cart · ₹{selectedFoodDetail.price * quantity}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
