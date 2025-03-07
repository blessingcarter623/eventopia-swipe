import React, { useState, useRef, useEffect, useCallback } from "react";
import { EventCard } from "@/components/ui/event-card";
import { CommentsDrawer } from "@/components/ui/comments-drawer";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const fetchEvents = async (): Promise<Event[]> => {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  const eventIds = events.map(event => event.organizer_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', eventIds);

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    throw profilesError;
  }

  const profileMap = new Map(profiles.map(profile => [profile.id, profile]));
  
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
  const [showFollowingToast, setShowFollowingToast] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwipeTransitioning, setIsSwipeTransitioning] = useState(false);
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
  
  useEffect(() => {
    videoRefs.current = Array(events.length).fill(null);
  }, [events.length]);
  
  useEffect(() => {
    const preloadNextVideo = (index: number) => {
      if (index < events.length - 1 && events[index + 1].media.type === "video") {
        const nextVideo = videoRefs.current[index + 1];
        if (nextVideo) {
          nextVideo.load();
        }
      }
    };
    
    if (events[currentIndex]?.media.type === "video") {
      const currentVideo = videoRefs.current[currentIndex];
      if (currentVideo) {
        currentVideo.load();
        currentVideo.play().catch(err => console.log("Video autoplay prevented:", err));
      }
    }
    
    preloadNextVideo(currentIndex);
    
    if (currentIndex > 0 && events[currentIndex - 1].media.type === "video") {
      const prevVideo = videoRefs.current[currentIndex - 1];
      if (prevVideo) {
        prevVideo.pause();
      }
    }
  }, [currentIndex, events]);
  
  const handleSwipe = useCallback((direction: "up" | "down") => {
    if (isSwiping.current || isSwipeTransitioning) return;
    isSwiping.current = true;
    setIsSwipeTransitioning(true);
    
    document.documentElement.style.setProperty('--swipe-direction', direction === "up" ? "-100%" : "100%");
    document.documentElement.classList.add('swiping');
    
    if (events[currentIndex]?.media.type === "video") {
      const currentVideo = videoRefs.current[currentIndex];
      if (currentVideo) {
        currentVideo.pause();
      }
    }
    
    if (direction === "up" && currentIndex < events.length - 1) {
      setCurrentIndex(prevIndex => {
        return prevIndex + 1;
      });
    } else if (direction === "down" && currentIndex > 0) {
      setCurrentIndex(prevIndex => {
        return prevIndex - 1;
      });
    }
    
    setTimeout(() => {
      document.documentElement.classList.remove('swiping');
      isSwiping.current = false;
      setIsSwipeTransitioning(false);
      setSwipeDistance(0);
      
      if (events[currentIndex]?.media.type === "video") {
        const newVideo = videoRefs.current[currentIndex];
        if (newVideo) {
          newVideo.play().catch(err => console.log("Video autoplay prevented:", err));
        }
      }
    }, 400);
  }, [currentIndex, events, isSwipeTransitioning]);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSwipeTransitioning) return;
    startY.current = e.touches[0].clientY;
    setTouchStartY(e.touches[0].clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null || isSwiping.current || isSwipeTransitioning) return;
    
    const currentY = e.touches[0].clientY;
    const diff = startY.current - currentY;
    
    if ((diff > 0 && currentIndex < events.length - 1) || (diff < 0 && currentIndex > 0)) {
      setSwipeDistance(diff);
    }
    
    if (Math.abs(diff) > 80) {
      if (diff > 0) {
        handleSwipe("up");
      } else {
        handleSwipe("down");
      }
      startY.current = null;
      setTouchStartY(null);
    }
  };
  
  const handleTouchEnd = () => {
    startY.current = null;
    setTouchStartY(null);
    setSwipeDistance(0);
  };
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isSwiping.current || isSwipeTransitioning) return;
      
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
    
    const heartIcon = document.querySelector(`[data-event-id="${eventId}"] .heart-icon`);
    if (heartIcon) {
      heartIcon.classList.add('heart-animation');
      setTimeout(() => {
        heartIcon?.classList.remove('heart-animation');
      }, 700);
    }
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
    
    const isCurrentlyFollowing = followedOrganizers.includes(organizerId);
    
    if (isCurrentlyFollowing) {
      setFollowedOrganizers(prev => prev.filter(id => id !== organizerId));
      toast({
        title: "Unfollowed!",
        description: "You unfollowed this organizer",
      });
    } else {
      setFollowedOrganizers(prev => [...prev, organizerId]);
      setShowFollowingToast(true);
      
      setTimeout(() => {
        setShowFollowingToast(false);
      }, 2000);
    }
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
  };
  
  if (isLoading) {
    return (
      <div className="app-height bg-darkbg flex flex-col items-center justify-center">
        <div className="text-neon-yellow text-xl">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-neon-yellow rounded-full animate-ping"></div>
            <div className="w-4 h-4 bg-neon-yellow rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 bg-neon-yellow rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <div className="mt-4">Loading events...</div>
        </div>
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
      <ProgressBar 
        currentIndex={currentIndex} 
        total={events.length} 
        className="absolute top-0 left-0 right-0 z-50" 
      />
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative snap-y snap-mandatory"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: !isSwipeTransitioning && swipeDistance !== 0 ? 
            `translateY(${-swipeDistance * 0.2}px)` : 'translateY(0)',
          transition: !isSwipeTransitioning ? 'transform 0.1s ease' : undefined
        }}
      >
        <div className="h-full w-full transform transition-transform duration-400">
          {events.map((event, index) => (
            <div 
              key={event.id} 
              className="h-full w-full snap-start snap-always absolute inset-0 transition-opacity duration-400"
              style={{ 
                opacity: index === currentIndex ? 1 : 0,
                pointerEvents: index === currentIndex ? 'auto' : 'none',
                zIndex: index === currentIndex ? 10 : 1
              }}
              data-event-id={event.id}
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
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-2 z-30">
          {events.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-neon-yellow w-3 h-3" : "bg-white/30"
              }`}
            />
          ))}
        </div>
        
        {currentIndex > 0 && (
          <div className="absolute left-0 right-0 top-4 flex justify-center z-30 pointer-events-none">
            <div className="animate-bounce text-white/70 flex flex-col items-center">
              <ChevronUp className="w-6 h-6" />
              <span className="text-xs">Previous event</span>
            </div>
          </div>
        )}
        
        {currentIndex < events.length - 1 && (
          <div className="absolute left-0 right-0 bottom-16 flex justify-center z-30 pointer-events-none">
            <div className="animate-bounce text-white/70 flex flex-col items-center">
              <span className="text-xs">Next event</span>
              <ChevronDown className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>
      
      {showFollowingToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 rounded-xl z-50 animate-fade-in">
          <div className="text-center">
            <div className="text-neon-yellow text-2xl mb-2">Following!</div>
            <p>You are now following this organizer</p>
          </div>
        </div>
      )}
      
      <CommentsDrawer
        eventId={events[currentIndex]?.id || ""}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
      
      <NavigationBar />
    </div>
  );
};

export default Index;
