
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Map } from "lucide-react";

interface EffectsTabProps {
  eventLocation: string;
  setEventLocation: (value: string) => void;
}

export const EffectsTab = ({
  eventLocation,
  setEventLocation
}: EffectsTabProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white mb-2 block">Video Filters</Label>
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" className="h-12 text-white border-white/20 bg-darkbg">
            None
          </Button>
          <Button variant="outline" className="h-12 text-white border-white/20 bg-blue-500/30">
            Cool
          </Button>
          <Button variant="outline" className="h-12 text-white border-white/20 bg-amber-500/30">
            Warm
          </Button>
          <Button variant="outline" className="h-12 text-white border-white/20 bg-gray-500/30">
            B&W
          </Button>
        </div>
      </div>
      
      <div>
        <Label className="text-white mb-2 block">Add Venue Location</Label>
        <div className="bg-darkbg rounded-lg p-3 flex items-center">
          <Map className="w-5 h-5 text-neon-yellow mr-3" />
          <Input 
            placeholder="Search for a location" 
            className="bg-transparent border-0 text-white focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label className="text-white mb-2 block">Transitions</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="h-12 text-white border-white/20">
            None
          </Button>
          <Button variant="outline" className="h-12 text-white border-white/20">
            Fade
          </Button>
          <Button variant="outline" className="h-12 text-white border-white/20">
            Wipe
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Label className="text-white">Add Branding</Label>
        <Switch />
      </div>
      
      <div className="flex items-center justify-between">
        <Label className="text-white">Auto-Generate Thumbnail</Label>
        <Switch defaultChecked />
      </div>
    </div>
  );
};
