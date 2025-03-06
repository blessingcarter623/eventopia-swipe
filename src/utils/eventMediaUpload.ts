
import { supabase } from "@/integrations/supabase/client";

export const uploadEventImage = async (mediaFile: File | null): Promise<string | null> => {
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

export const createStorageBucketIfNeeded = async () => {
  const { data, error } = await supabase.storage.getBucket('event-media');
  
  if (error && error.message.includes('does not exist')) {
    await supabase.storage.createBucket('event-media', {
      public: true
    });
  }
};
