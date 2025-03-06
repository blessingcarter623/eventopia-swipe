
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EventFormData } from "@/types/event-form";

interface PriceSectionProps {
  formData: EventFormData;
  updateFormData: <K extends keyof EventFormData>(
    key: K,
    value: EventFormData[K]
  ) => void;
}

const PriceSection: React.FC<PriceSectionProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="price" className="text-white">Price (R)</Label>
      <Input
        id="price"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={formData.price}
        onChange={(e) => updateFormData("price", e.target.value)}
        className="bg-darkbg-lighter border-gray-700 text-white"
      />
    </div>
  );
};

export default PriceSection;
