
import { EventFormData } from "@/types/event-form";
import { toast } from "@/hooks/use-toast";

export const validateEventForm = (formData: EventFormData, profile: any | null): boolean => {
  if (!profile) {
    toast({
      title: "Not authenticated",
      description: "You must be logged in to create an event",
      variant: "destructive",
    });
    return false;
  }
  
  if (!formData.title || !formData.description || !formData.eventDate || !formData.eventTime || !formData.location) {
    toast({
      title: "Missing information",
      description: "Please fill out all required fields",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};
