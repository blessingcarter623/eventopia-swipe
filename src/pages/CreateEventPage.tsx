
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X, Calendar, Clock, MapPin, Image, Tags } from "lucide-react";
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
import GoogleMapPicker from "@/components/ui/google-map-picker";

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

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Music");
  const [eventDate, setEventDate] = useState<Date | undefined>(new Date());
  const [eventTime, setEventTime] = useState<string>("19:00");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const [price, setPrice] = useState<string>("0");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle image upload preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Add a tag to the tags array
  const addTag = () => {
    if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove a tag from the tags array
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle tag input keydown (add tag on Enter)
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Upload event image to Supabase Storage
  const uploadEventImage = async (): Promise<string | null> => {
    if (!mediaFile) return null;
    
    const fileExt = mediaFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `event-images/${fileName}`;
    
    try {
      const { error: uploadError, data } = await supabase.storage
        .from('event-media')
        .upload(filePath, mediaFile);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('event-media')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  // Submit the form data to create an event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to create an event",
        variant: "destructive",
      });
      return;
    }
    
    if (!title || !description || !eventDate || !eventTime || !location) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Upload image if present
      const uploadedImageUrl = mediaFile ? await uploadEventImage() : null;
      
      // Create event in database
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          title,
          description,
          date: eventDate?.toISOString(),
          time: eventTime,
          location,
          location_lat: coordinates.lat,
          location_lng: coordinates.lng,
          price: price ? parseFloat(price) : 0,
          category,
          tags,
          media_url: uploadedImageUrl,
          media_type: 'image',
          organizer_id: profile.id,
        })
        .select();
      
      if (eventError) throw eventError;
      
      toast({
        title: "Event created",
        description: "Your event has been successfully created",
      });
      
      // Navigate back to dashboard
      navigate("/organizer/dashboard");
      
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check for storage bucket existence and create if needed
  useEffect(() => {
    const createStorageBucketIfNeeded = async () => {
      const { data, error } = await supabase.storage.getBucket('event-media');
      
      if (error && error.message.includes('does not exist')) {
        await supabase.storage.createBucket('event-media', {
          public: true
        });
      }
    };
    
    createStorageBucketIfNeeded();
  }, []);

  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Create Event</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-xl mx-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Event Title*</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-darkbg-lighter border-gray-700 text-white"
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description*</Label>
            <Textarea
              id="description"
              placeholder="Describe your event"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="bg-darkbg-lighter border-gray-700 text-white min-h-[100px]"
            />
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-white">Category*</Label>
            <Select value={category} onValueChange={setCategory}>
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
          
          {/* Date and Time */}
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
                    {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-darkbg-lighter border-gray-700" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
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
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  required
                  className="bg-darkbg-lighter border-gray-700 text-white pl-10"
                />
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Location - Google Maps Integration */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-white">Location*</Label>
            <div className="relative">
              <Input
                id="location"
                placeholder="Event location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="bg-darkbg-lighter border-gray-700 text-white pl-10"
              />
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="mt-2 h-[200px] rounded-md overflow-hidden">
              <GoogleMapPicker 
                apiKey="AIzaSyCTFB-7pPLQoFoo6F70AQ8hnYmxdHUyxgA"
                onSelectLocation={(address, lat, lng) => {
                  setLocation(address);
                  setCoordinates({ lat, lng });
                }}
                defaultLocation={location}
              />
            </div>
          </div>
          
          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-white">Price (R)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-darkbg-lighter border-gray-700 text-white"
            />
          </div>
          
          {/* Event Image */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-white">Event Image</Label>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="bg-darkbg-lighter border-gray-700 text-white"
              >
                <Image className="mr-2 h-4 w-4" />
                Choose Image
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 border-none text-white hover:bg-red-600"
                    onClick={() => {
                      setMediaFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-white">Tags</Label>
            <div className="flex">
              <div className="relative flex-1">
                <Input
                  id="tags"
                  placeholder="Add tags (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="bg-darkbg-lighter border-gray-700 text-white pl-10"
                />
                <Tags className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <Button
                type="button"
                className="ml-2 bg-neon-blue text-white hover:bg-neon-blue/80"
                onClick={addTag}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-neon-blue rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-transparent p-0"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit Button */}
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
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default CreateEventPage;
