import React from "react";
import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBunk } from "../state";
import type { FoodItem } from "../types";

interface FoodCardProps {
  food: FoodItem;
  className?: string;
}

export function FoodCard({ food, className }: FoodCardProps) {
  const { addToCart, setSelectedFoodDetail } = useBunk();

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-card",
        !food.available && "opacity-60 grayscale-[40%]",
        className
      )}
    >
      {/* Clickable Image Container */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setSelectedFoodDetail(food)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setSelectedFoodDetail(food);
        }}
        className="relative aspect-4/3 w-full cursor-pointer overflow-hidden bg-muted"
      >
        <img
          src={food.image}
          alt={food.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Veg icon tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-sm shadow-xs">
          <span className="size-1.5 rounded-full bg-emerald-600" />
          {food.category}
        </div>

        {!food.available && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-[2px]">
            <span className="rounded-full bg-destructive/90 px-3 py-1 text-xs font-bold text-destructive-foreground shadow-xs">
              Sold out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelectedFoodDetail(food)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setSelectedFoodDetail(food);
          }}
          className="cursor-pointer"
        >
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-base">
              {food.name}
            </h3>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {food.description}
          </p>
        </div>

        <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <span className="text-xs text-muted-foreground line-through mr-1 opacity-0">₹</span>
            <span className="text-base font-black tracking-tight text-foreground sm:text-lg">
              ₹{food.price}
            </span>
            <span className="ml-2 inline-flex items-center text-[10px] text-muted-foreground">
              <Clock className="mr-0.5 size-3" />
              {food.prepTime}
            </span>
          </div>

          <Button
            type="button"
            size="icon"
            disabled={!food.available}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(food.id);
            }}
            aria-label={`Add ${food.name} to cart`}
            className="size-8 rounded-full bg-foreground text-background shadow-xs hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
