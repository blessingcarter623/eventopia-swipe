
import React, { useState, useEffect } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Profile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  is_verified: boolean;
  role: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  media_url: string;
  media_type: string;
}

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileError) throw profileError;
        setProfile(profileData);
        
        // Get current date
        const currentDate = new Date();
        
        // Fetch user's events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('organizer_id', userId);
          
        if (eventsError) throw eventsError;
        
        // Split events into past and upcoming
        const past: Event[] = [];
        const upcoming: Event[] = [];
        
        eventsData?.forEach(event => {
          const eventDate = new Date(event.date);
          if (eventDate < currentDate) {
            past.push(event);
          } else {
            upcoming.push(event);
          }
        });
        
        setPastEvents(past);
        setUpcomingEvents(upcoming);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId]);
  
  if (isLoading) {
    return (
      <div className="app-height bg-darkbg flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-neon-yellow animate-spin" />
        <p className="mt-4 text-white">Loading user profile...</p>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="app-height bg-darkbg flex flex-col items-center justify-center p-4">
        <p className="text-white text-lg">User not found</p>
        <Link to="/" className="mt-4">
          <Button className="bg-neon-yellow text-black">Back to Home</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header with back button */}
        <div className="bg-darkbg-lighter p-4 flex items-center">
          <Link to="/" className="mr-4">
            <ArrowLeft className="text-white" />
          </Link>
          <h1 className="text-xl font-semibold text-white">User Profile</h1>
        </div>
        
        {/* User Profile Info */}
        <div className="p-4">
          <div className="flex items-center mb-6">
            <img 
              src={profile.avatar_url} 
              alt={profile.display_name} 
              className="w-20 h-20 rounded-full object-cover border-2 border-neon-yellow"
            />
            <div className="ml-4">
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-white">{profile.display_name}</h2>
                {profile.is_verified && (
                  <span className="ml-1 text-neon-yellow">✓</span>
                )}
              </div>
              <p className="text-gray-400">@{profile.username}</p>
              <div className="mt-1 flex items-center">
                <span className="text-xs bg-neon-yellow text-black px-2 py-0.5 rounded-full">
                  {profile.role === 'organizer' ? 'Organizer' : 'User'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-darkbg-lighter rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{profile.events || 0}</div>
              <div className="text-xs text-gray-400">Events</div>
            </div>
            <div className="bg-darkbg-lighter rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{profile.followers || 0}</div>
              <div className="text-xs text-gray-400">Followers</div>
            </div>
            <div className="bg-darkbg-lighter rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{profile.following || 0}</div>
              <div className="text-xs text-gray-400">Following</div>
            </div>
          </div>
          
          {/* Bio */}
          {profile.bio && (
            <div className="mb-6 p-3 bg-darkbg-lighter rounded-lg">
              <p className="text-white text-sm">{profile.bio}</p>
            </div>
          )}
          
          {/* Events Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 bg-darkbg-lighter border border-gray-700 rounded-lg p-1 mb-4">
              <TabsTrigger 
                value="upcoming" 
                className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md"
              >
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md"
              >
                Past Events
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No upcoming events
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <Link key={event.id} to={`/event/${event.id}`}>
                      <EventCard event={event} />
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {pastEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No past events
                </div>
              ) : (
                <div className="space-y-4">
                  {pastEvents.map(event => (
                    <Link key={event.id} to={`/event/${event.id}`}>
                      <EventCard event={event} isPast />
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

// Helper component for event cards
const EventCard = ({ event, isPast = false }) => {
  return (
    <Card className={`overflow-hidden border-gray-700 ${isPast ? 'opacity-70' : ''}`}>
      <CardContent className="p-0">
        <div className="flex">
          <div className="w-1/3 h-24">
            <img 
              src={event.media_url || "/placeholder.svg"} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3 w-2/3 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-md text-white line-clamp-1">{event.title}</h3>
              <div className="flex items-center mt-1 text-xs text-gray-300">
                <Calendar size={12} className="mr-1" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
                <Clock size={12} className="ml-2 mr-1" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center mt-1 text-xs text-gray-300">
                <MapPin size={12} className="mr-1" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-neon-yellow font-semibold">
                {event.price === 0 ? "Free" : `R ${event.price.toFixed(2)}`}
              </span>
              {isPast ? (
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                </span>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-neon-yellow"
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
