
import React, { useState, useRef, useEffect } from "react";
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
  const { toast } = useToast();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  
  const handleSwipe = (direction: "up" | "down") => {
    if (direction === "up" && currentIndex < events.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else if (direction === "down" && currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    
    const currentY = e.touches[0].clientY;
    const diff = startY.current - currentY;
    
    if (Math.abs(diff) > 50) {
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
  
  const handleLike = (eventId: string) => {
    // In a real app, this would call an API
    console.log(`Liked event ${eventId}`);
  };
  
  const handleComment = (eventId: string) => {
    setShowComments(true);
  };
  
  const handleShare = (eventId: string) => {
    toast({
      title: "Shared!",
      description: "Event shared with your followers",
    });
  };
  
  const handleBookmark = (eventId: string) => {
    // In a real app, this would call an API
    console.log(`Bookmarked event ${eventId}`);
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
  };
  
  const handleLikeComment = (commentId: string) => {
    // In a real app, this would call an API
    console.log(`Liked comment ${commentId}`);
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
  
  const handleNext = () => {
    if (currentIndex < events.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  };
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      {/* App Wrapper */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Event Cards */}
        <div className="h-full w-full">
          {events.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              isActive={index === currentIndex}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onBookmark={handleBookmark}
              showComments={() => setShowComments(true)}
            />
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
