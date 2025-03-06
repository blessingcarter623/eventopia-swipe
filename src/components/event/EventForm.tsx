
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TagInput from "./TagInput";
import EventImageUploader from "./EventImageUploader";
import GoogleMapPicker from "@/components/ui/google-map-picker";
import { EventFormProps } from "@/types/event-form";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const EVENT_CATEGORIES = [
  "Music",
  "Sports",
  "Arts",
  "Food & Drinks",
  "Networking",
  "Education",
  "Technology",
  "Entertainment",
  "Charity",
  "Other",
];

const EventForm: React.FC<EventFormProps> = ({
  isLoading,
  formData,
  setFormData,
  handleSubmit,
  previewUrl,
  setPreviewUrl,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  handleTagKeyDown,
  handleFileChange,
}) => {
  const updateFormData = <K extends keyof typeof formData>(
    key: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-xl mx-auto">
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
        
        <div className="mt-2 h-[200px] rounded-md overflow-hidden">
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
      
      <EventImageUploader
        mediaFile={formData.mediaFile}
        setMediaFile={(file) => updateFormData("mediaFile", file)}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
      />
      
      <TagInput
        tags={formData.tags}
        setTags={(tags) => updateFormData("tags", tags)}
        tagInput={tagInput}
        setTagInput={setTagInput}
        addTag={addTag}
        removeTag={removeTag}
        handleTagKeyDown={handleTagKeyDown}
      />
      
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-neon-yellow text-black hover:bg-neon-yellow/90"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
