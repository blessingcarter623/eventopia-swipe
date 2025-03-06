
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { EventFormData } from "@/types/event-form";

export const useEventForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    category: "Music",
    eventDate: new Date(),
    eventTime: "19:00",
    location: "",
    coordinates: {
      lat: null,
      lng: null,
    },
    price: "0",
    tags: [],
    mediaFile: null,
  });

  const addTag = () => {
    if (tagInput.trim() !== "" && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        mediaFile: file
      }));
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const uploadEventImage = async (): Promise<string | null> => {
    if (!formData.mediaFile) return null;
    
    const fileExt = formData.mediaFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `event-images/${fileName}`;
    
    try {
      const { error: uploadError, data } = await supabase.storage
        .from('event-media')
        .upload(filePath, formData.mediaFile);
      
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
    
    if (!formData.title || !formData.description || !formData.eventDate || !formData.eventTime || !formData.location) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const uploadedImageUrl = formData.mediaFile ? await uploadEventImage() : null;
      
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          date: formData.eventDate?.toISOString(),
          time: formData.eventTime,
          location: formData.location,
          location_lat: formData.coordinates.lat,
          location_lng: formData.coordinates.lng,
          price: formData.price ? parseFloat(formData.price) : 0,
          category: formData.category,
          tags: formData.tags,
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

  return {
    isLoading,
    formData,
    setFormData,
    previewUrl,
    setPreviewUrl,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleTagKeyDown,
    handleFileChange,
    handleSubmit,
  };
};
