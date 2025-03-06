
import React, { useState, useRef, useEffect, useCallback } from "react";
import { EventCard } from "@/components/ui/event-card";
import { CommentsDrawer } from "@/components/ui/comments-drawer";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { mockEvents, mockComments } from "@/data/index";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown } from "lucide-react";

const Index = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(mockComments);
  const [events, setEvents] = useState(mockEvents);
  const [followedOrganizers, setFollowedOrganizers] = useState<string[]>([]);
  const { toast } = useToast();
  
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
  
  const handleLike = (eventId: string) => {
    // Update the UI to reflect the like status
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, stats: { ...event.stats, likes: event.stats.likes + 1 } } 
        : event
    ));
    
    toast({
      title: "Liked!",
      description: "You liked this event",
    });
  };
  
  const handleFollow = (organizerId: string) => {
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
  };
  
  const handleComment = (eventId: string) => {
    setShowComments(true);
  };
  
  const handleShare = (eventId: string) => {
    // Update the UI to reflect the share count
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, stats: { ...event.stats, shares: event.stats.shares + 1 } } 
        : event
    ));
    
    toast({
      title: "Shared!",
      description: "Event shared with your followers",
    });
  };
  
  const handleBookmark = (eventId: string) => {
    // Update the isSaved status for this event
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, isSaved: !event.isSaved } 
        : event
    ));
    
    toast({
      title: "Saved!",
      description: "Event added to your saved collection",
    });
  };
  
  const handleAddComment = (eventId: string, content: string) => {
    const newComment = {
      id: `new-${Date.now()}`,
      userId: "5", // In a real app, this would be the current user's ID
      username: "festivalgoer",
      avatar: "https://i.pravatar.cc/150?img=5",
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
    };
    
    setComments(prev => [newComment, ...prev]);
    
    // Update event comment count
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, stats: { ...event.stats, comments: event.stats.comments + 1 } } 
          : event
      )
    );
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added successfully",
    });
  };
  
  const handleLikeComment = (commentId: string) => {
    // In a real app, this would call an API
    console.log(`Liked comment ${commentId}`);
    toast({
      title: "Liked comment",
      description: "You liked this comment",
    });
  };
  
  const handleReplyComment = (commentId: string, content: string) => {
    setComments(prev => 
      prev.map(comment => {
        if (comment.id === commentId) {
          const newReply = {
            id: `reply-${Date.now()}`,
            userId: "5", // In a real app, this would be the current user's ID
            username: "festivalgoer",
            avatar: "https://i.pravatar.cc/150?img=5",
            content,
            timestamp: new Date().toISOString(),
            likes: 0,
          };
          
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          };
        } else if (comment.replies) {
          const foundInReplies = comment.replies.some(reply => reply.id === commentId);
          if (foundInReplies) {
            const newReply = {
              id: `reply-${Date.now()}`,
              userId: "5", // In a real app, this would be the current user's ID
              username: "festivalgoer",
              avatar: "https://i.pravatar.cc/150?img=5",
              content,
              timestamp: new Date().toISOString(),
              likes: 0,
            };
            
            return {
              ...comment,
              replies: [...comment.replies, newReply],
            };
          }
        }
        
        return comment;
      })
    );
    
    // Update event comment count
    setEvents(prev => 
      prev.map(event => 
        event.id === events[currentIndex].id 
          ? { ...event, stats: { ...event.stats, comments: event.stats.comments + 1 } } 
          : event
      )
    );
  };
  
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
        comments={comments}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onReplyComment={handleReplyComment}
      />
      
      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Index;
