
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface TrimTabProps {
  trimStart: number[];
  trimEnd: number[];
  setTrimStart: (value: number[]) => void;
  setTrimEnd: (value: number[]) => void;
}

export const TrimTab = ({
  trimStart,
  trimEnd,
  setTrimStart,
  setTrimEnd
}: TrimTabProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white mb-2 block">Trim Video</Label>
        <div className="bg-darkbg rounded-lg p-4">
          <div className="w-full h-2 bg-white/20 rounded-full mb-4 relative">
            <div 
              className="absolute top-0 left-0 h-full bg-neon-yellow rounded-full" 
              style={{ 
                left: `${trimStart[0]}%`, 
                width: `${trimEnd[0] - trimStart[0]}%` 
              }}
            />
          </div>
          <div className="flex justify-between">
            <div>
              <Label className="text-white text-xs">Start Point</Label>
              <Slider
                value={trimStart}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => {
                  if (value[0] < trimEnd[0]) {
                    setTrimStart(value);
                  }
                }}
                className="w-36"
              />
            </div>
            <div>
              <Label className="text-white text-xs">End Point</Label>
              <Slider
                value={trimEnd}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => {
                  if (value[0] > trimStart[0]) {
                    setTrimEnd(value);
                  }
                }}
                className="w-36"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <Label className="text-white mb-2 block">Preview Duration: 00:32</Label>
        <div className="bg-darkbg rounded-lg p-2 flex space-x-2">
          <Badge className="bg-neon-yellow text-black">Trim</Badge>
          <Badge variant="outline">Split</Badge>
          <Badge variant="outline">Speed</Badge>
        </div>
      </div>
    </div>
  );
};
