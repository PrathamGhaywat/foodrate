"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  value?: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
  className?: string;
};

export function StarRating({ value = 0, onChange, size = 28, readOnly, className }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = display >= i + 1;
        return (
          <button
            key={i}
            type="button"
            className={cn(
              "rounded-full transition-transform",
              !readOnly && "hover:-translate-y-0.5 active:translate-y-0"
            )}
            onMouseEnter={() => !readOnly && setHover(i + 1)}
            onMouseLeave={() => !readOnly && setHover(null)}
            onClick={() => !readOnly && onChange?.(i + 1)}
            aria-label={`Set rating to ${i + 1}`}
            disabled={readOnly}
          >
            <Star
              width={size}
              height={size}
              className={cn(
                "drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)]",
                filled ? "fill-yellow-400 stroke-yellow-500" : "stroke-yellow-500"
              )}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-semibold">{value}/5</span>
    </div>
  );
}
