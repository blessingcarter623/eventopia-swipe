
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import GoogleMapPicker from "@/components/ui/google-map-picker";
import { EventFormData } from "@/types/event-form";

interface LocationSectionProps {
  formData: EventFormData;
  updateFormData: <K extends keyof EventFormData>(
    key: K,
    value: EventFormData[K]
  ) => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="location" className="text-white">Location*</Label>
      <div className="relative">
        <Input
          id="location"
          placeholder="Event location"
          value={formData.location}
          onChange={(e) => updateFormData("location", e.target.value)}
          required
          className="bg-darkbg-lighter border-gray-700 text-white pl-10"
        />
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      </div>
      
      <div className="mt-2 h-[300px] rounded-md overflow-hidden">
        <GoogleMapPicker 
          apiKey="AIzaSyCTFB-7pPLQoFoo6F70AQ8hnYmxdHUyxgA"
          onSelectLocation={(address, lat, lng) => {
            updateFormData("location", address);
            updateFormData("coordinates", { lat, lng });
          }}
          defaultLocation={formData.location}
        />
      </div>
    </div>
  );
};

export default LocationSection;
