
import React, { useState, useEffect } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { useQuery } from "@tanstack/react-query";
import MapView from "@/components/discover/MapView";
import FeelingSelector from "@/components/discover/FeelingSelector";
import InviteFriendModal from "@/components/discover/InviteFriendModal";
import { MapPin, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadGoogleMapsScript } from "@/components/ui/google-map/mapLoader";

const fetchEvents = async (): Promise<Event[]> => {
  const { data: events, error } = await supabase
    .from('events')
    .select('*, organizer_id')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

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
      coordinates: {
        lat: event.location_lat || null,
        lng: event.location_lng || null,
      },
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
};

const Discover = () => {
  const [selectedFeeling, setSelectedFeeling] = useState<string>("All");
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Load Google Maps API
  useEffect(() => {
    const loadMaps = async () => {
      try {
        // For production, replace with your actual API key
        const apiKey = "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg"; // This is a Google Maps sample API key
        await loadGoogleMapsScript(apiKey, () => setMapsLoaded(true), (error) => console.error(error));
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };
    
    loadMaps();
  }, []);
  
  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ['discover-events'],
    queryFn: fetchEvents,
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
  
  // Handle feeling selection
  const handleSelectFeeling = (feeling: string) => {
    setSelectedFeeling(feeling);
  };
  
  // Open the invite modal for a specific event
  const openInviteModal = (event: Event) => {
    setSelectedEvent(event);
    setShowInviteModal(true);
  };
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-4">Discover Events</h1>
          
          {/* Feeling Selector */}
          <FeelingSelector 
            onSelectFeeling={handleSelectFeeling}
            selectedFeeling={selectedFeeling}
          />
          
          {/* Map View */}
          <div className="my-4">
            {mapsLoaded ? (
              <MapView events={filteredEvents} isLoading={isLoading} />
            ) : (
              <div className="h-[80vh] flex items-center justify-center bg-darkbg-lighter rounded-lg">
                <div className="text-neon-yellow animate-pulse">Loading map...</div>
              </div>
            )}
          </div>
          
          {/* Featured Events List - shown below map */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              {filteredEvents.length === 0
                ? "No events found"
                : `${filteredEvents.length} Events nearby`}
            </h2>
            
            <div className="space-y-4">
              {filteredEvents.slice(0, 5).map(event => (
                <Card key={event.id} className="bg-darkbg-lighter border-gray-700 text-white overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-1/3 h-32">
                        <img 
                          src={event.media.url || "/placeholder.svg"} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 w-2/3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-md line-clamp-1">{event.title}</h3>
                          <div className="flex items-center mt-1 text-xs text-gray-300">
                            <MapPin size={12} className="mr-1" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <img 
                              src={event.organizer.avatar} 
                              alt={event.organizer.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="ml-1 text-xs truncate">{event.organizer.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-neon-yellow"
                            onClick={() => window.location.href = `/event/${event.id}`}
                          >
                            View Details
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-auto"
                            onClick={() => openInviteModal(event)}
                          >
                            <Share2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Invite Friend Modal */}
      <InviteFriendModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        event={selectedEvent}
      />
      
      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Discover;
