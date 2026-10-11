import React from "react";
import { Clock, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBunk } from "../state";
import type { FoodItem } from "../types";
import { FoodEmojiBadge } from "./FoodEmoji";

interface FoodCardProps {
  food: FoodItem;
  className?: string;
}

export function FoodCard({ food, className }: FoodCardProps) {
  const { cart, addToCart, updateCartQuantity, setSelectedFoodDetail, canteens } = useBunk();
  const quantityInCart = cart[food.id] || 0;
  const canteen = canteens.find((c) => c.id === food.canteenId);
  const isCanteenSuspended =
    canteen?.operationalStatus === "Suspended" || canteen?.status === "Closed";

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs transition-all duration-150 hover:border-primary/50 hover:shadow-sm",
        (!food.available || isCanteenSuspended) && "opacity-60 bg-muted/30 cursor-not-allowed",
        className
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setSelectedFoodDetail(food)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setSelectedFoodDetail(food);
        }}
        className="cursor-pointer text-left focus-visible:outline-hidden"
      >
        <div className="flex items-start gap-3">
          {/* Compact 40px Emoji container */}
          <FoodEmojiBadge
            name={food.name}
            category={food.category}
            emoji={food.emoji}
            size="md"
            className="group-hover:border-primary/40 transition-colors"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                {food.name}
              </h3>
            </div>

            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-medium">{food.category}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-0.5">
                <Clock className="size-3" />
                {food.prepTime}
              </span>
            </div>
          </div>
        </div>

        {food.description && (
          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground leading-normal">
            {food.description}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
        <div>
          <span className="text-base font-extrabold tracking-tight text-foreground">
            ₹{food.price}
          </span>
        </div>

        {/* Action Controls */}
        {!food.available ? (
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            Sold out
          </span>
        ) : isCanteenSuspended ? (
          <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-600 border border-rose-500/20">
            Suspended
          </span>
        ) : quantityInCart > 0 ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center rounded-lg border border-primary/40 bg-accent/40 p-0.5"
          >
            <button
              type="button"
              onClick={() => updateCartQuantity(food.id, quantityInCart - 1)}
              aria-label={`Decrease ${food.name}`}
              className="grid size-6 place-items-center rounded-md text-foreground hover:bg-card active:scale-95 transition-all"
            >
              <Minus className="size-3 text-foreground" />
            </button>
            <span className="w-5 text-center text-xs font-bold text-foreground">
              {quantityInCart}
            </span>
            <button
              type="button"
              onClick={() => updateCartQuantity(food.id, quantityInCart + 1)}
              aria-label={`Increase ${food.name}`}
              className="grid size-6 place-items-center rounded-md text-foreground hover:bg-card active:scale-95 transition-all"
            >
              <Plus className="size-3 text-foreground" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(food.id);
            }}
            aria-label={`Add ${food.name} to cart`}
            className="h-7 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Plus className="mr-1 size-3.5" />
            Add
          </Button>
        )}
      </div>
    </article>
  );
}
