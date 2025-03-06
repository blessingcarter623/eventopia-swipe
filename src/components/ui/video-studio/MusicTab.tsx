
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Music, Play, Upload } from "lucide-react";

interface MusicTabProps {
  volume: number[];
  handleVolumeChange: (newVolume: number[]) => void;
}

export const MusicTab = ({
  volume,
  handleVolumeChange
}: MusicTabProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white mb-2 block">Select Audio Track</Label>
        <div className="space-y-2">
          <div className="bg-darkbg rounded-lg p-3 flex justify-between items-center">
            <div className="flex items-center">
              <Music className="w-5 h-5 text-neon-yellow mr-3" />
              <div>
                <p className="text-white">Upbeat Electronic</p>
                <p className="text-xs text-gray-400">2:45</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white">
              <Play className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-darkbg rounded-lg p-3 flex justify-between items-center">
            <div className="flex items-center">
              <Music className="w-5 h-5 text-neon-yellow mr-3" />
              <div>
                <p className="text-white">Festival Vibes</p>
                <p className="text-xs text-gray-400">3:12</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white">
              <Play className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-darkbg rounded-lg p-3 flex justify-between items-center">
            <div className="flex items-center">
              <Music className="w-5 h-5 text-neon-yellow mr-3" />
              <div>
                <p className="text-white">Trending Sound #1</p>
                <p className="text-xs text-gray-400">0:45</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white">
              <Play className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <Label className="text-white mb-2 block">Upload Custom Audio</Label>
        <Button variant="outline" className="w-full border-white/20 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Upload Audio File
        </Button>
      </div>
      
      <div>
        <Label className="text-white mb-2 flex justify-between">
          <span>Audio Volume</span>
          <span>{volume[0]}%</span>
        </Label>
        <Slider
          value={volume}
          min={0}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
        />
      </div>
    </div>
  );
};
