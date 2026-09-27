import React from "react";
import { cn } from "@/lib/utils";

export const CATEGORY_EMOJI_MAP: Record<string, string> = {
  Breakfast: "🥞",
  Snacks: "🥪",
  Meals: "🍛",
  Drinks: "🥤",
  Desserts: "🍰",
};

export function getCategoryEmoji(category?: string): string {
  if (!category) return "🍽️";
  return CATEGORY_EMOJI_MAP[category] || "🍽️";
}

export function getFoodEmoji(
  name?: string,
  category?: string,
  customEmoji?: string
): string {
  if (customEmoji && customEmoji.trim().length > 0) {
    return customEmoji.trim();
  }

  if (!name) return getCategoryEmoji(category);

  const lower = name.toLowerCase();

  if (lower.includes("dosa") || lower.includes("idli") || lower.includes("poha") || lower.includes("upma") || lower.includes("paratha")) {
    return "🥞";
  }
  if (lower.includes("wrap") || lower.includes("roll") || lower.includes("frankie") || lower.includes("burrito")) {
    return "🌯";
  }
  if (lower.includes("coffee") || lower.includes("cappuccino") || lower.includes("latte") || lower.includes("espresso")) {
    return "☕";
  }
  if (lower.includes("tea") || lower.includes("chai")) {
    return "🍵";
  }
  if (lower.includes("lassi") || lower.includes("shake") || lower.includes("juice") || lower.includes("soda") || lower.includes("drink")) {
    return "🥤";
  }
  if (lower.includes("biryani") || lower.includes("rice") || lower.includes("pulao") || lower.includes("fried rice")) {
    return "🍚";
  }
  if (lower.includes("chole") || lower.includes("thali") || lower.includes("curry") || lower.includes("dal") || lower.includes("paneer")) {
    return "🍛";
  }
  if (lower.includes("burger")) {
    return "🍔";
  }
  if (lower.includes("pizza")) {
    return "🍕";
  }
  if (lower.includes("sandwich") || lower.includes("toast")) {
    return "🥪";
  }
  if (lower.includes("fry") || lower.includes("fries")) {
    return "🍟";
  }
  if (lower.includes("noodle") || lower.includes("maggi") || lower.includes("chowmein")) {
    return "🍜";
  }
  if (lower.includes("samosa") || lower.includes("kachori") || lower.includes("puff")) {
    return "🥟";
  }
  if (lower.includes("salad") || lower.includes("bowl")) {
    return "🥗";
  }
  if (lower.includes("cake") || lower.includes("brownie") || lower.includes("pastry") || lower.includes("dessert") || lower.includes("ice cream")) {
    return "🍰";
  }
  if (lower.includes("bakery") || lower.includes("muffin") || lower.includes("cupcake")) {
    return "🧁";
  }

  return getCategoryEmoji(category);
}

interface FoodEmojiBadgeProps {
  name?: string | undefined;
  category?: string | undefined;
  emoji?: string | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  className?: string | undefined;
}

export function FoodEmojiBadge({
  name,
  category,
  emoji,
  size = "md",
  className,
}: FoodEmojiBadgeProps) {
  const char = getFoodEmoji(name, category, emoji);

  const sizeClasses = {
    sm: "size-8 text-sm rounded-lg",
    md: "size-10 text-lg rounded-xl",
    lg: "size-12 text-2xl rounded-xl",
  }[size];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid place-items-center shrink-0 select-none bg-muted/70 border border-border/80 text-foreground transition-colors",
        sizeClasses,
        className
      )}
    >
      <span>{char}</span>
    </div>
  );
}
