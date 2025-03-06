
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentIndex: number;
  total: number;
  className?: string;
}

export function ProgressBar({ currentIndex, total, className }: ProgressBarProps) {
  const [sections, setSections] = useState<Array<{ active: boolean; viewed: boolean }>>([]);
  
  useEffect(() => {
    setSections(
      Array(total)
        .fill(null)
        .map((_, i) => ({
          active: i === currentIndex,
          viewed: i < currentIndex,
        }))
    );
  }, [currentIndex, total]);

  return (
    <div className={cn("w-full flex gap-1 px-1 py-2 z-50", className)}>
      {sections.map((section, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-all duration-300",
            section.active 
              ? "bg-neon-yellow" 
              : section.viewed 
                ? "bg-white/70" 
                : "bg-white/30"
          )}
        />
      ))}
    </div>
  );
}
