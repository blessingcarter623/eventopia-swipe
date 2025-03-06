
import React, { useState, useRef, useEffect, useCallback } from "react";
import { EventCard } from "@/components/ui/event-card";
import { CommentsDrawer } from "@/components/ui/comments-drawer";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const fetchEvents = async (): Promise<Event[]> => {
  // First fetch events
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

const Index = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [followedOrganizers, setFollowedOrganizers] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: events = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const isSwiping = useRef(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  
  // Initialize video refs based on events length
  useEffect(() => {
    videoRefs.current = Array(events.length).fill(null);
  }, [events.length]);
  
  // Preload videos for faster rendering
  useEffect(() => {
    const preloadNextVideo = (index: number) => {
      if (index < events.length - 1 && events[index + 1].media.type === "video") {
        const nextVideo = videoRefs.current[index + 1];
        if (nextVideo) {
          nextVideo.load();
        }
      }
    };
    
    // Preload current and next videos
    if (events[currentIndex]?.media.type === "video") {
      const currentVideo = videoRefs.current[currentIndex];
      if (currentVideo) {
        currentVideo.load();
        currentVideo.play().catch(err => console.log("Video autoplay prevented:", err));
      }
    }
    
    // Preload next video for faster transition
    preloadNextVideo(currentIndex);
    
    // Preload previous video if available
    if (currentIndex > 0 && events[currentIndex - 1].media.type === "video") {
      const prevVideo = videoRefs.current[currentIndex - 1];
      if (prevVideo) {
        prevVideo.load();
      }
    }
  }, [currentIndex, events]);
  
  const handleSwipe = useCallback((direction: "up" | "down") => {
    if (isSwiping.current) return;
    isSwiping.current = true;
    
    // Pause the current video
    if (events[currentIndex]?.media.type === "video") {
      const currentVideo = videoRefs.current[currentIndex];
      if (currentVideo) {
        currentVideo.pause();
      }
    }
    
    if (direction === "up" && currentIndex < events.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else if (direction === "down" && currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
    
    // Reset swiping flag after animation and play the new video
    setTimeout(() => {
      isSwiping.current = false;
      if (events[currentIndex]?.media.type === "video") {
        const newVideo = videoRefs.current[currentIndex];
        if (newVideo) {
          newVideo.play().catch(err => console.log("Video autoplay prevented:", err));
        }
      }
    }, 300);
  }, [currentIndex, events]);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null || isSwiping.current) return;
    
    const currentY = e.touches[0].clientY;
    const diff = startY.current - currentY;
    
    // Only trigger swipe if movement is significant (more than 30px for faster response)
    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        handleSwipe("up");
      } else {
        handleSwipe("down");
      }
      startY.current = null;
    }
  };
  
  const handleTouchEnd = () => {
    startY.current = null;
  };
  
  // Add wheel event support for desktop with smooth snap scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isSwiping.current) return;
      
      // Use a threshold to make the snap scroll more responsive
      if (Math.abs(e.deltaY) > 30) {
        if (e.deltaY > 0) {
          handleSwipe("up");
        } else if (e.deltaY < 0) {
          handleSwipe("down");
        }
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }
    
    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleSwipe]);
  
  const handleLike = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like events",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Liked!",
      description: "You liked this event",
    });
    
    // In a real app, you would update Supabase here
    // For example:
    // await supabase.from('event_likes').insert({ user_id: user.id, event_id: eventId });
  };
  
  const handleFollow = (organizerId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to follow organizers",
        variant: "destructive"
      });
      return;
    }
    
    if (followedOrganizers.includes(organizerId)) {
      setFollowedOrganizers(prev => prev.filter(id => id !== organizerId));
      toast({
        title: "Unfollowed!",
        description: "You unfollowed this organizer",
      });
    } else {
      setFollowedOrganizers(prev => [...prev, organizerId]);
      toast({
        title: "Following!",
        description: "You are now following this organizer",
      });
    }
    
    // In a real app, you would update Supabase here
    // For example:
    // if (followedOrganizers.includes(organizerId)) {
    //   await supabase.from('follows').delete().eq('user_id', user.id).eq('organizer_id', organizerId);
    // } else {
    //   await supabase.from('follows').insert({ user_id: user.id, organizer_id: organizerId });
    // }
  };
  
  const handleComment = (eventId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment",
        variant: "destructive"
      });
      return;
    }
    setShowComments(true);
  };
  
  const handleShare = (eventId: string) => {
    toast({
      title: "Shared!",
      description: "Event shared with your followers",
    });
    
    // In a real app, you would update Supabase here
    // For example:
    // await supabase.from('shares').insert({ user_id: user.id, event_id: eventId });
  };
  
  const handleBookmark = (eventId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save events",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Saved!",
      description: "Event added to your saved collection",
    });
    
    // In a real app, you would update Supabase here
    // For example:
    // await supabase.from('saved_events').insert({ user_id: user.id, event_id: eventId });
  };
  
  if (isLoading) {
    return (
      <div className="app-height bg-darkbg flex flex-col items-center justify-center">
        <div className="text-neon-yellow text-xl animate-pulse">Loading events...</div>
      </div>
    );
  }
  
  if (isError || events.length === 0) {
    return (
      <div className="app-height bg-darkbg flex flex-col items-center justify-center p-4">
        <div className="text-neon-yellow text-xl mb-4">No events found</div>
        <p className="text-white text-center">
          There are no events to display right now. Check back later or try refreshing the page.
        </p>
        <NavigationBar />
      </div>
    );
  }
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      {/* App Wrapper */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative snap-y snap-mandatory"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Event Cards */}
        <div className="h-full w-full">
          {events.map((event, index) => (
            <div 
              key={event.id} 
              className="h-full w-full snap-start snap-always"
            >
              <EventCard
                event={event}
                isActive={index === currentIndex}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onBookmark={handleBookmark}
                showComments={() => setShowComments(true)}
                videoRef={event.media.type === "video" ? (el) => {
                  videoRefs.current[index] = el;
                } : undefined}
                isFollowed={followedOrganizers.includes(event.organizer.id)}
                onFollow={() => handleFollow(event.organizer.id)}
              />
            </div>
          ))}
        </div>
        
        {/* Navigation Indicators */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-2 z-10">
          {events.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-neon-yellow w-3 h-3" : "bg-white/30"
              }`}
            />
          ))}
        </div>
        
        {/* Swipe Indicators */}
        <div className="absolute left-0 right-0 top-4 flex justify-center z-10 pointer-events-none">
          {currentIndex > 0 && (
            <div className="animate-bounce text-white/70 flex flex-col items-center">
              <ChevronUp className="w-6 h-6" />
              <span className="text-xs">Swipe up</span>
            </div>
          )}
        </div>
        
        <div className="absolute left-0 right-0 bottom-16 flex justify-center z-10 pointer-events-none">
          {currentIndex < events.length - 1 && (
            <div className="animate-bounce text-white/70 flex flex-col items-center">
              <span className="text-xs">Swipe down</span>
              <ChevronDown className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
      
      {/* Comments Drawer */}
      <CommentsDrawer
        eventId={events[currentIndex]?.id || ""}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
      
      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Index;
