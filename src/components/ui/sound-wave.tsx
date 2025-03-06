
import React from "react";
import { cn } from "@/lib/utils";

interface SoundWaveProps {
  isPlaying: boolean;
  className?: string;
}

export function SoundWave({ isPlaying, className }: SoundWaveProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((bar) => (
        <div
          key={bar}
          className={cn(
            "w-0.5 h-3 bg-neon-yellow rounded-full transition-all duration-300",
            isPlaying ? `animate-sound-wave-${bar}` : "h-1"
          )}
          style={{
            animationDelay: `${bar * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
