import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { EventFormData } from "@/types/event-form";
import { validateEventForm } from "@/utils/eventFormValidation";
import { uploadEventImage, createStorageBucketIfNeeded } from "@/utils/eventMediaUpload";
import { useTagManagement, TagManagementResult } from "@/utils/eventTagManagement";
import { useFileHandling, FileHandlingResult } from "@/utils/eventFileHandling";

export const useEventForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  
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
    videoId: undefined,
    videoUrl: undefined,
  });

  // Use our utility hooks
  const tagManagement: TagManagementResult = useTagManagement(formData, setFormData);
  const fileHandling: FileHandlingResult = useFileHandling(formData, setFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEventForm(formData, profile)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Determine media URL and type based on what's provided
      let mediaUrl = null;
      let mediaType = 'image';
      
      // If using a selected video
      if (formData.videoUrl) {
        mediaUrl = formData.videoUrl;
        mediaType = 'video';
      }
      // Otherwise try to upload a new image/video
      else if (formData.mediaFile) {
        mediaUrl = await uploadEventImage(formData.mediaFile);
        mediaType = formData.mediaFile.type.startsWith('video/') ? 'video' : 'image';
      }
      
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
          media_url: mediaUrl,
          media_type: mediaType,
          organizer_id: profile?.id,
        })
        .select();
      
      if (eventError) throw eventError;
      
      // If an event video was used, update its relationship to the event
      if (formData.videoId && eventData && eventData[0]) {
        const { error: videoUpdateError } = await supabase
          .from('event_videos')
          .update({
            title: `Video for event: ${eventData[0].title}`,
            description: `Video linked to event: ${eventData[0].id}`
          })
          .eq('id', formData.videoId);
          
        if (videoUpdateError) {
          console.error("Error linking video to event:", videoUpdateError);
          // Continue anyway as the main event is created
        }
      }
      
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
    createStorageBucketIfNeeded();
  }, []);

  return {
    isLoading,
    formData,
    setFormData,
    ...tagManagement,
    ...fileHandling,
    handleSubmit,
  };
};
