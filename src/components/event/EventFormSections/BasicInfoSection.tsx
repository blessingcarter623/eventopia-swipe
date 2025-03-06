
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_CATEGORIES } from "../EventFormConstants";
import { EventFormData } from "@/types/event-form";

interface BasicInfoSectionProps {
  formData: EventFormData;
  updateFormData: <K extends keyof EventFormData>(
    key: K,
    value: EventFormData[K]
  ) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">Event Title*</Label>
        <Input
          id="title"
          placeholder="Enter event title"
          value={formData.title}
          onChange={(e) => updateFormData("title", e.target.value)}
          required
          className="bg-darkbg-lighter border-gray-700 text-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Description*</Label>
        <Textarea
          id="description"
          placeholder="Describe your event"
          value={formData.description}
          onChange={(e) => updateFormData("description", e.target.value)}
          required
          className="bg-darkbg-lighter border-gray-700 text-white min-h-[100px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category" className="text-white">Category*</Label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => updateFormData("category", value)}
        >
          <SelectTrigger className="bg-darkbg-lighter border-gray-700 text-white">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-darkbg-lighter border-gray-700 text-white">
            {EVENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat} className="text-white hover:bg-gray-700">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default BasicInfoSection;
