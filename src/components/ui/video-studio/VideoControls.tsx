
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, Trash } from "lucide-react";

interface VideoControlsProps {
  isPlaying: boolean;
  volume: number[];
  handlePlayPause: () => void;
  handleVolumeChange: (newVolume: number[]) => void;
  onDelete: () => void;
}

export const VideoControls = ({
  isPlaying,
  volume,
  handlePlayPause,
  handleVolumeChange,
  onDelete
}: VideoControlsProps) => {
  return (
    <div className="p-4 bg-darkbg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>
          <div className="flex items-center space-x-2 text-white">
            <Volume2 className="w-4 h-4" />
            <div className="w-24">
              <Slider
                value={volume}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={onDelete}
        >
          <Trash className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
