
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TextTabProps {
  title: string;
  description: string;
  eventDate: string;
  eventPrice: string;
  eventLocation: string;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setEventDate: (value: string) => void;
  setEventPrice: (value: string) => void;
  setEventLocation: (value: string) => void;
}

export const TextTab = ({
  title,
  description,
  eventDate,
  eventPrice,
  eventLocation,
  setTitle,
  setDescription,
  setEventDate,
  setEventPrice,
  setEventLocation
}: TextTabProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white mb-2 block">Add Text Overlay</Label>
        <div className="space-y-3">
          <div>
            <Input 
              placeholder="Event Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-darkbg border-white/20 text-white"
            />
          </div>
          <div>
            <Textarea 
              placeholder="Event Description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-darkbg border-white/20 text-white min-h-20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input 
                placeholder="Event Date & Time" 
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="bg-darkbg border-white/20 text-white"
              />
            </div>
            <div>
              <Input 
                placeholder="Price" 
                value={eventPrice}
                onChange={(e) => setEventPrice(e.target.value)}
                className="bg-darkbg border-white/20 text-white"
              />
            </div>
          </div>
          <div>
            <Input 
              placeholder="Location" 
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="bg-darkbg border-white/20 text-white"
            />
          </div>
        </div>
      </div>
      
      <div>
        <Label className="text-white mb-2 block">Text Style</Label>
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" className="h-12 text-white border-white/20">
            Aa
          </Button>
          <Button variant="outline" className="h-12 text-white border-white/20 font-serif">
            Aa
          </Button>
          <Button variant="outline" className="h-12 text-white border-white/20 font-mono">
            Aa
          </Button>
          <Button variant="outline" className="h-12 text-white border-white/20 italic">
            Aa
          </Button>
        </div>
      </div>
    </div>
  );
};
