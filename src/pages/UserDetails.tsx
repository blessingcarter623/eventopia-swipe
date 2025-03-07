
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, User, Star, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  role: string;
  followers: number;
  following: number;
  posts: number;
  is_verified: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  thumbnail_url: string;
  price: number;
  tags: string[];
}

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserEvents();
    }
  }, [userId]);
  
  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      setProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  
  const fetchUserEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', userId);
        
      if (error) throw error;
      
      const now = new Date();
      const upcoming: Event[] = [];
      const past: Event[] = [];
      
      data?.forEach(event => {
        const eventDate = event.date ? new Date(event.date) : null;
        
        if (eventDate && eventDate > now) {
          upcoming.push(event);
        } else {
          past.push(event);
        }
      });
      
      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (error) {
      console.error("Error fetching user events:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderEventCard = (event: Event) => (
    <Link to={`/event/${event.id}`} key={event.id}>
      <Card className="hover:shadow-lg transition-shadow overflow-hidden bg-darkbg-lighter border-gray-700">
        <div className="relative">
          <img 
            src={event.thumbnail_url || '/placeholder.svg'} 
            alt={event.title} 
            className="w-full h-40 object-cover"
          />
          {event.price > 0 ? (
            <Badge className="absolute bottom-2 right-2 bg-neon-yellow text-black">
              R {event.price.toFixed(2)}
            </Badge>
          ) : (
            <Badge className="absolute bottom-2 right-2 bg-green-500 text-white">
              Free
            </Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-white mb-2 truncate">{event.title}</h3>
          
          {event.date && (
            <div className="flex items-center text-xs text-gray-400 mb-1">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(event.date).toLocaleDateString()}
              {event.time && <span className="ml-1">• {event.time}</span>}
            </div>
          )}
          
          {event.location && (
            <div className="flex items-center text-xs text-gray-400">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-darkbg text-white p-4">
        <div className="max-w-3xl mx-auto mt-20 text-center">
          <div className="animate-pulse">
            <div className="h-24 w-24 rounded-full bg-gray-700 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-darkbg text-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <Avatar className="w-24 h-24 border-2 border-neon-yellow">
            <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
            <AvatarFallback className="bg-gray-800">
              <User className="w-12 h-12 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold">{profile.display_name}</h1>
              {profile.is_verified && (
                <Star className="w-5 h-5 text-neon-yellow fill-neon-yellow" />
              )}
            </div>
            
            <p className="text-gray-400 mb-3">@{profile.username}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
              <div className="text-center">
                <p className="font-semibold">{profile.followers || 0}</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{profile.following || 0}</p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{upcomingEvents.length + pastEvents.length}</p>
                <p className="text-xs text-gray-400">Events</p>
              </div>
            </div>
            
            <div className="flex justify-center md:justify-start gap-2">
              <Button className="bg-neon-yellow text-black hover:bg-neon-yellow/90">
                Follow
              </Button>
              <Button variant="outline" className="border-gray-700">
                Message
              </Button>
            </div>
          </div>
        </div>
        
        {profile.bio && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-300">{profile.bio}</p>
          </div>
        )}
        
        <Separator className="bg-gray-800 mb-8" />
        
        <h2 className="text-lg font-semibold mb-4">Events</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-2 bg-darkbg-lighter border border-gray-700 rounded-lg p-1">
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
          
          <TabsContent value="upcoming" className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-800 h-40 rounded-t-lg"></div>
                    <div className="bg-gray-800 p-4 rounded-b-lg">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map(event => renderEventCard(event))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No upcoming events</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-800 h-40 rounded-t-lg"></div>
                    <div className="bg-gray-800 p-4 rounded-b-lg">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastEvents.map(event => renderEventCard(event))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No past events</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDetails;
