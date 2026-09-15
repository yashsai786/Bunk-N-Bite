import React from "react";
import { cn } from "@/lib/utils";

interface CapsuleNavigationProps {
  items: string[];
  activeItem: string;
  onSelect: (item: string) => void;
  className?: string;
}

export function CapsuleNavigation({
  items,
  activeItem,
  onSelect,
  className,
}: CapsuleNavigationProps) {
  return (
    <nav
      aria-label="Capsule Navigation"
      className={cn(
        "flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border/70 bg-card/90 p-1 shadow-xs backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {items.map((item) => {
        const isActive = activeItem === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={cn(
              "relative shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold tracking-normal transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:text-sm",
              isActive
                ? "bg-foreground text-background shadow-xs font-bold"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground active:scale-95"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {item}
          </button>
        );
      })}
    </nav>
  );
}
