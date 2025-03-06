
import React, { useState, useEffect } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Search, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { useQuery } from "@tanstack/react-query";

const categories = [
  "All", "Music", "Art", "Business", "Wellness", "Film", "Food", "Sports", "Technology"
];

const fetchEvents = async (): Promise<Event[]> => {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  // Then fetch organizer profiles for the events
  const eventIds = events.map(event => event.organizer_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', eventIds);

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const { data: allEvents = [], isLoading, isError } = useQuery({
    queryKey: ['discover-events'],
    queryFn: fetchEvents,
  });
  
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    if (allEvents.length > 0) {
      filterEvents(searchQuery, selectedCategory);
    }
  }, [allEvents, searchQuery, selectedCategory]);
  
  const filterEvents = (query: string, category: string) => {
    let filtered = allEvents;
    
    // Filter by search query
    if (query.trim() !== "") {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        event.location.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Filter by category
    if (category !== "All") {
      filtered = filtered.filter(event => event.category === category);
    }
    
    setFilteredEvents(filtered);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };
  
  if (isLoading) {
    return (
      <div className="app-height bg-darkbg flex flex-col">
        <div className="flex-1 items-center justify-center flex">
          <div className="text-neon-yellow text-xl animate-pulse">Loading events...</div>
        </div>
        <NavigationBar />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="app-height bg-darkbg flex flex-col">
        <div className="flex-1 items-center justify-center flex p-4">
          <div className="text-neon-yellow text-xl mb-4">Error loading events</div>
          <p className="text-white text-center">
            There was an error loading events. Please try again later.
          </p>
        </div>
        <NavigationBar />
      </div>
    );
  }
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-4">Discover Events</h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search events, locations..."
              className="w-full bg-darkbg-lighter border border-white/10 rounded-full py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-yellow"
            />
          </div>
          
          {/* Categories */}
          <div className="overflow-x-auto scrollbar-none -mx-4 px-4 pb-2">
            <div className="flex space-x-2">
              {categories.map(category => (
                <button 
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-neon-yellow text-black font-medium"
                      : "bg-darkbg-lighter text-gray-300 border border-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-3">
            {filteredEvents.length === 0
              ? "No events found"
              : `${filteredEvents.length} Events found`}
          </h2>
          
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <Link to={`/event/${event.id}`} key={event.id} className="block">
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="relative h-40">
                    <img 
                      src={event.media.url} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-neon-yellow text-black px-2 py-1 rounded-lg text-xs font-medium">
                      {event.category}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                    
                    <div className="flex items-center text-gray-300 text-sm mb-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{event.location}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <img 
                          src={event.organizer.avatar} 
                          alt={event.organizer.name}
                          className="w-6 h-6 rounded-full object-cover border border-white/20"
                        />
                        <span className="text-white text-sm ml-2">{event.organizer.name}</span>
                        {event.organizer.isVerified && (
                          <span className="ml-1 bg-neon-yellow text-black text-xs px-1 rounded-full">✓</span>
                        )}
                      </div>
                      <div className="text-neon-yellow font-bold">
                        {typeof event.price === 'number' ? `$${event.price.toFixed(2)}` : event.price}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-darkbg-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400">No events match your search criteria.</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Discover;
