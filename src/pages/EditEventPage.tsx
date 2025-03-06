
import React, { useState, useEffect } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import EventForm from "@/components/event/EventForm";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { EventFormData } from "@/types/event-form";
import { useTagManagement } from "@/utils/eventTagManagement";
import { useFileHandling } from "@/utils/eventFileHandling";
import { validateEventForm } from "@/utils/eventFormValidation";
import { ArrowLeft } from "lucide-react";

const EditEventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Use our utility hooks
  const tagManagement = useTagManagement(formData, setFormData);
  const fileHandling = useFileHandling(formData, setFormData);
  
  // Fetch event data
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("Event ID is required");
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
    onSuccess: (data) => {
      // Initialize form data with fetched event
      setFormData({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "Music",
        eventDate: data.date ? new Date(data.date) : new Date(),
        eventTime: data.time || "19:00",
        location: data.location || "",
        coordinates: {
          lat: data.location_lat,
          lng: data.location_lng,
        },
        price: data.price?.toString() || "0",
        tags: data.tags || [],
        mediaFile: null,
        videoId: undefined,
        videoUrl: data.media_url || undefined,
      });
      
      setPreviewUrl(data.media_url);
    },
    onError: (error) => {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Could not load the event. Please try again.",
        variant: "destructive",
      });
      navigate("/organizer/dashboard");
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEventForm(formData, profile)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Determine media URL and type based on what's provided
      let mediaUrl = previewUrl;
      let mediaType = event?.media_type || 'image';
      
      // If a new file was uploaded, update the URL
      if (formData.mediaFile) {
        const uploadedMediaUrl = await uploadEventImage(formData.mediaFile);
        if (uploadedMediaUrl) {
          mediaUrl = uploadedMediaUrl;
          mediaType = formData.mediaFile.type.startsWith('video/') ? 'video' : 'image';
        }
      }
      
      // If using a selected video
      if (formData.videoUrl && formData.videoUrl !== event?.media_url) {
        mediaUrl = formData.videoUrl;
        mediaType = 'video';
      }
      
      const { error: updateError } = await supabase
        .from('events')
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId);
      
      if (updateError) throw updateError;
      
      // If an event video was used, update its relationship to the event
      if (formData.videoId) {
        const { error: videoUpdateError } = await supabase
          .from('event_videos')
          .update({
            event_id: eventId
          })
          .eq('id', formData.videoId);
          
        if (videoUpdateError) {
          console.error("Error linking video to event:", videoUpdateError);
          // Continue anyway as the main event is updated
        }
      }
      
      toast({
        title: "Event updated",
        description: "Your event has been successfully updated",
      });
      
      navigate(`/event/${eventId}`);
      
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to upload event image (simplified version from the utility)
  const uploadEventImage = async (mediaFile: File | null): Promise<string | null> => {
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
      console.error("Error uploading media:", error);
      return null;
    }
  };
  
  if (isLoadingEvent) {
    return (
      <div className="app-height bg-darkbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-yellow"></div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="app-height bg-darkbg flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
        <p className="text-gray-400 mb-6 text-center">The event you're looking for doesn't exist or you don't have permission to edit it.</p>
        <Link to="/organizer/dashboard" className="bg-neon-yellow text-black font-bold px-6 py-2 rounded-full">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <Link to={`/event/${eventId}`} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Edit Event</h1>
          <div className="w-6"></div> {/* Empty div for spacing */}
        </div>
        
        <EventForm
          isLoading={isLoading}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          tagInput={tagManagement.tagInput}
          setTagInput={tagManagement.setTagInput}
          addTag={tagManagement.addTag}
          removeTag={tagManagement.removeTag}
          handleTagKeyDown={tagManagement.handleTagKeyDown}
          handleFileChange={fileHandling.handleFileChange}
        />
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default EditEventPage;
