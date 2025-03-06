
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { Livestream } from "@/types/livestream";
import { useToast } from "@/hooks/use-toast";

export const useDiscoverEvents = (selectedFeeling: string) => {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const { toast } = useToast();

  // Load Google Maps API
  useEffect(() => {
    const loadMaps = async () => {
      try {
        // Import the loader function dynamically to avoid circular dependencies
        const { loadGoogleMapsScript } = await import("@/components/ui/google-map/mapLoader");
        
        // For production, replace with your actual API key
        const apiKey = "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg"; // This is a Google Maps sample API key
        
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          console.log("Google Maps already loaded");
          setMapsLoaded(true);
          return;
        }
        
        console.log("Loading Google Maps script...");
        
        await loadGoogleMapsScript(
          apiKey, 
          () => {
            console.log("Google Maps script loaded successfully");
            setMapsLoaded(true);
          }, 
          (error) => {
            console.error("Error loading Google Maps script:", error);
            toast({
              title: "Map Error",
              description: "Unable to load maps. Some features may be limited.",
              variant: "destructive"
            });
          }
        );
      } catch (error) {
        console.error("Error in loadMaps function:", error);
        toast({
          title: "Map Error",
          description: "Unable to load maps. Some features may be limited.",
          variant: "destructive"
        });
      }
    };
    
    loadMaps();
  }, [toast]);
  
  // Fetch events from Supabase
  const fetchEvents = async (): Promise<Event[]> => {
    try {
      console.log("Fetching events from Supabase...");
      
      const { data: events, error } = await supabase
        .from('events')
        .select('*, organizer_id')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }

      console.log(`Fetched ${events.length} events from Supabase`);

      // Then fetch organizer profiles for the events
      const organizerIds = events.map(event => event.organizer_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', organizerIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Create a map of profiles for easy lookup
      const profileMap = new Map(profiles.map(profile => [profile.id, profile]));
      
      // Transform the data to match the Event type
      return events.map(event => {
        const organizer = profileMap.get(event.organizer_id);
        
        // Ensure coordinates are properly formatted
        let coordinates = { lat: null, lng: null };
        if (event.location_lat && event.location_lng) {
          coordinates = {
            lat: typeof event.location_lat === 'string' ? parseFloat(event.location_lat) : event.location_lat,
            lng: typeof event.location_lng === 'string' ? parseFloat(event.location_lng) : event.location_lng
          };
        }
        
        return {
          id: event.id,
          title: event.title,
          description: event.description || '',
          media: {
            type: event.media_type as 'image' | 'video',
            url: event.media_url || '',
            thumbnail: event.thumbnail_url || '',
          },
          location: event.location || '',
          date: event.date ? new Date(event.date).toISOString() : new Date().toISOString(),
          time: event.time || '',
          price: typeof event.price === 'number' ? event.price : 'Free',
          category: event.category || '',
          coordinates: coordinates,
          organizer: {
            id: organizer?.id || event.organizer_id,
            name: organizer?.display_name || 'Event Organizer',
            avatar: organizer?.avatar_url || `https://i.pravatar.cc/150?u=${event.organizer_id}`,
            isVerified: organizer?.is_verified || false,
          },
          stats: {
            likes: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 100),
            shares: Math.floor(Math.random() * 500),
            views: Math.floor(Math.random() * 10000),
          },
          tags: event.tags || [],
          isSaved: false,
        };
      });
    } catch (error) {
      console.error("Error in fetchEvents function:", error);
      throw error;
    }
  };
  
  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ['discover-events'],
    queryFn: fetchEvents,
  });
  
  // Fetch active livestreams
  const { data: activeLivestreams = [] } = useQuery({
    queryKey: ['active-livestreams'],
    queryFn: async (): Promise<Livestream[]> => {
      try {
        // First fetch livestreams
        const { data: streamsData, error: streamsError } = await supabase
          .from('livestreams')
          .select('*')
          .eq('status', 'live')
          .order('actual_start', { ascending: false });
          
        if (streamsError) throw streamsError;
        
        // Then fetch profiles for each host
        const livestreamsWithHosts = await Promise.all(
          streamsData.map(async (stream) => {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', stream.host_id)
              .single();

            if (profileError) {
              console.error("Error fetching host profile:", profileError);
              return {
                ...stream,
                host: {
                  name: 'Unknown Host',
                  avatar: `https://i.pravatar.cc/150?u=${stream.host_id}`,
                }
              };
            }

            return {
              ...stream,
              host: {
                name: profileData.display_name || 'Unknown Host',
                avatar: profileData.avatar_url || `https://i.pravatar.cc/150?u=${stream.host_id}`,
              }
            };
          })
        );

        return livestreamsWithHosts as Livestream[];
      } catch (error) {
        console.error("Error fetching livestreams:", error);
        return [];
      }
    },
  });
  
  // Filter events based on selected feeling
  const filteredEvents = selectedFeeling === "All" 
    ? allEvents 
    : allEvents.filter(event => 
        event.category === selectedFeeling || 
        (event.tags && event.tags.some(tag => 
          tag.toLowerCase().includes(selectedFeeling.toLowerCase())
        ))
      );
  
  return {
    allEvents,
    filteredEvents,
    isLoading,
    mapsLoaded,
    activeLivestreams
  };
};
