
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { EventFormData } from "@/types/event-form";

interface DateTimeSectionProps {
  formData: EventFormData;
  updateFormData: <K extends keyof EventFormData>(
    key: K,
    value: EventFormData[K]
  ) => void;
}

const DateTimeSection: React.FC<DateTimeSectionProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-white">Date*</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-full justify-start text-left font-normal bg-darkbg-lighter border-gray-700 text-white`}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {formData.eventDate ? format(formData.eventDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-darkbg-lighter border-gray-700" align="start">
            <CalendarComponent
              mode="single"
              selected={formData.eventDate}
              onSelect={(date) => updateFormData("eventDate", date)}
              initialFocus
              className="bg-darkbg-lighter text-white pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="time" className="text-white">Time*</Label>
        <div className="relative">
          <Input
            id="time"
            type="time"
            value={formData.eventTime}
            onChange={(e) => updateFormData("eventTime", e.target.value)}
            required
            className="bg-darkbg-lighter border-gray-700 text-white pl-10"
          />
          <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default DateTimeSection;
