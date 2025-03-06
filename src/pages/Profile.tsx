
import React, { useState, useEffect } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { ArrowLeft, Settings, Share2, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types";

const Profile = () => {
  const { profile, signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"events" | "images" | "reels">("events");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch user's events from Supabase
  const { data: userEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['user-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get events where the user is the organizer
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id);
      
      if (error) {
        console.error("Error fetching user events:", error);
        throw error;
      }
      
      // Transform the data to match the Event type
      return events.map(event => ({
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
          id: profile?.id || '',
          name: profile?.display_name || 'Event Organizer',
          avatar: profile?.avatar_url || '',
          isVerified: profile?.is_verified || false,
        },
        stats: {
          likes: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 100),
          shares: Math.floor(Math.random() * 500),
          views: Math.floor(Math.random() * 10000),
        },
        tags: event.tags || [],
        isSaved: false,
      }));
    },
    enabled: !!user,
  });
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };
  
  if (!profile) {
    return (
      <div className="app-height bg-darkbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-yellow"></div>
      </div>
    );
  }
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <div className="flex gap-2">
            <button onClick={handleSignOut} className="text-white hover:text-neon-yellow">
              <LogOut className="w-6 h-6" />
            </button>
            <Settings className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="px-4 pt-4">
          <div className="flex items-start">
            <div className="relative">
              <img 
                src={profile.avatar_url} 
                alt={profile.display_name} 
                className="w-24 h-24 rounded-2xl object-cover border-2 border-neon-yellow"
              />
              {profile.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-neon-yellow text-black rounded-full p-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.25 6.75L9.75 17.25L4.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <h2 className="text-2xl font-bold text-white">{profile.display_name}</h2>
              <p className="text-gray-400">@{profile.username}</p>
              <div className="flex items-center mt-1">
                <span className="text-white bg-darkbg-lighter px-2 py-1 rounded-full text-xs font-medium">
                  {profile.role === 'organizer' ? 'Event Organizer' : 'User'}
                </span>
              </div>
              {profile.bio && <p className="text-white mt-1">{profile.bio}</p>}
              
              <div className="flex items-center gap-3 mt-3">
                <Link 
                  to="/profile/edit" 
                  className="bg-neon-yellow text-black font-medium px-5 py-2 rounded-full text-sm hover:brightness-110 transition-all flex-1 text-center"
                >
                  Edit Profile
                </Link>
                <button className="bg-white/10 text-white font-medium px-3 py-2 rounded-full text-sm border border-white/20">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              {/* Show Dashboard Link for Organizers */}
              {profile.role === 'organizer' && (
                <Link 
                  to="/organizer/dashboard" 
                  className="flex items-center justify-center gap-2 mt-3 bg-gradient-to-r from-neon-yellow to-amber-400 text-black font-medium px-5 py-2 rounded-full text-sm hover:brightness-110 transition-all w-full"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Organizer Dashboard
                </Link>
              )}
            </div>
          </div>
          
          {/* User Stats */}
          <div className="flex justify-between mt-6 border-b border-white/10 pb-4">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{profile.posts}</p>
              <p className="text-gray-400 text-sm">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{profile.followers}</p>
              <p className="text-gray-400 text-sm">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{profile.following}</p>
              <p className="text-gray-400 text-sm">Following</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-4">
          <div className="flex border-b border-white/10">
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === "events" ? "text-neon-yellow border-b-2 border-neon-yellow" : "text-gray-400"}`}
              onClick={() => setActiveTab("events")}
            >
              Events
            </button>
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === "images" ? "text-neon-yellow border-b-2 border-neon-yellow" : "text-gray-400"}`}
              onClick={() => setActiveTab("images")}
            >
              Images
            </button>
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === "reels" ? "text-neon-yellow border-b-2 border-neon-yellow" : "text-gray-400"}`}
              onClick={() => setActiveTab("reels")}
            >
              Reels
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-2">
            {activeTab === "events" && (
              isLoadingEvents ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-yellow mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading events...</p>
                </div>
              ) : userEvents.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {userEvents.map((event: Event) => (
                    <Link to={`/event/${event.id}`} key={event.id} className="relative aspect-square rounded-xl overflow-hidden">
                      <img 
                        src={event.media.url} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                        <h3 className="text-white font-bold text-sm line-clamp-1">{event.title}</h3>
                        <p className="text-gray-300 text-xs">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  {profile.role === 'organizer' ? 
                    <p>You haven't created any events yet. Go create some!</p> : 
                    <p>No events to show.</p>
                  }
                </div>
              )
            )}
            
            {activeTab === "images" && (
              <div className="text-center py-10 text-gray-400">
                <p>No images to display yet.</p>
              </div>
            )}
            
            {activeTab === "reels" && (
              <div className="text-center py-10 text-gray-400">
                <p>No reels to display yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Profile;
