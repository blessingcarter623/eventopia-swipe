
import React, { useState, useRef, useEffect } from "react";
import { Event } from "@/types";
import { Heart, MessageCircle, Share2, Bookmark, Calendar, MapPin, UserPlus, UserCheck, ChevronDown, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./button";
import { Badge } from "./badge";
import { SoundWave } from "./sound-wave";
import { TicketPurchaseDialog } from "./ticket-purchase-dialog";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface EventCardProps {
  event: Event;
  isActive: boolean;
  onLike: (eventId: string) => void;
  onComment: (eventId: string) => void;
  onShare: (eventId: string) => void;
  onBookmark: (eventId: string) => void;
  showComments: () => void;
  videoRef?: (el: HTMLVideoElement | null) => void;
  isFollowed?: boolean;
  onFollow: () => void;
}

export function EventCard({
  event,
  isActive,
  onLike,
  onComment,
  onShare,
  onBookmark,
  showComments,
  videoRef,
  isFollowed = false,
  onFollow,
}: EventCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(event.isSaved || false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if description is overflowing
  useEffect(() => {
    if (descriptionRef.current) {
      setIsDescriptionOverflowing(
        descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight
      );
    }
  }, [event.description]);

  // Check if user has ticket for this event
  useEffect(() => {
    if (user && event.id) {
      const checkUserTicket = async () => {
        const { data, error } = await supabase
          .from('tickets')
          .select('id')
          .eq('event_id', event.id)
          .eq('user_id', user.id)
          .limit(1);
          
        if (!error && data && data.length > 0) {
          setHasTicket(true);
        } else {
          setHasTicket(false);
        }
      };
      
      checkUserTicket();
    }
  }, [user, event.id]);

  // Handle video playback based on card visibility
  useEffect(() => {
    const videoElement = localVideoRef.current;
    if (!videoElement) return;
    
    if (isActive && event.media.type === "video") {
      videoElement.muted = false; // Allow sound to play
      videoElement.currentTime = 0; // Start from beginning
      videoElement.play()
        .then(() => setIsVideoPlaying(true))
        .catch(err => {
          console.log("Video autoplay prevented:", err);
          setIsVideoPlaying(false);
        });
    } else if (videoElement) {
      videoElement.pause();
      setIsVideoPlaying(false);
    }
    
    // Add play/pause listeners
    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);
    
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [isActive, event.media.type]);

  const handleLike = () => {
    setLiked(!liked);
    onLike(event.id);
  };

  const handleSave = () => {
    setSaved(!saved);
    onBookmark(event.id);
  };
  
  const navigateToUserProfile = () => {
    navigate(`/user/${event.organizer.id}`);
  };

  return (
    <div 
      className={cn(
        "event-card-container relative w-full h-full flex flex-col justify-between transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Event Media */}
      <div className="absolute inset-0 -z-10">
        {event.media.type === "image" ? (
          <img 
            src={event.media.url} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <video 
            ref={(el) => {
              localVideoRef.current = el;
              if (videoRef) videoRef(el);
            }}
            src={event.media.url} 
            poster={event.media.thumbnail} 
            className="w-full h-full object-cover"
            playsInline
            loop
            preload="auto"
            controls={isActive} // Add controls when the video is active
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>
      
      {/* Top Bar with User Info */}
      <div className="flex justify-between items-center p-4 z-10 pt-10">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={navigateToUserProfile}
        >
          <div className="relative">
            <img 
              src={event.organizer.avatar} 
              alt={event.organizer.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-neon-yellow"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-neon-yellow rounded-full flex items-center justify-center text-xs text-black font-bold">+</div>
          </div>
          <div className="ml-2">
            <div className="flex items-center">
              <p className="text-white font-semibold">{event.organizer.name}</p>
              {event.organizer.isVerified && (
                <span className="ml-1 text-neon-yellow">✓</span>
              )}
            </div>
            <p className="text-gray-300 text-xs">{formatDistanceToNow(new Date(event.date), { addSuffix: true })}</p>
          </div>
        </div>
        <button 
          className={cn(
            "flex items-center gap-1 font-medium px-4 py-1 rounded-full text-sm transition-all",
            isFollowed 
              ? "bg-white/20 text-white hover:bg-white/30" 
              : "bg-neon-yellow text-black hover:brightness-110"
          )}
          onClick={onFollow}
        >
          {isFollowed ? (
            <>
              <UserCheck className="w-4 h-4" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Follow
            </>
          )}
        </button>
      </div>
      
      {/* Right Side Action Icons */}
      <div className="absolute right-4 bottom-1/3 flex flex-col gap-5 z-20">
        <button 
          className="flex flex-col items-center"
          onClick={handleLike}
          aria-label="Like event"
        >
          <div className="bg-black/30 w-12 h-12 rounded-full flex items-center justify-center">
            <Heart 
              className={cn(
                "heart-icon w-7 h-7 transition-all duration-300 transform hover:scale-110", 
                liked ? "fill-neon-red text-neon-red" : "text-white"
              )} 
            />
          </div>
          <span className="text-xs text-white mt-1">{liked ? event.stats.likes + 1 : event.stats.likes}</span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={showComments}
          aria-label="Show comments"
        >
          <div className="bg-black/30 w-12 h-12 rounded-full flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white transition-all duration-300 transform hover:scale-110" />
          </div>
          <span className="text-xs text-white mt-1">{event.stats.comments}</span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={() => onShare(event.id)}
          aria-label="Share event"
        >
          <div className="bg-black/30 w-12 h-12 rounded-full flex items-center justify-center">
            <Share2 className="w-7 h-7 text-white transition-all duration-300 transform hover:scale-110" />
          </div>
          <span className="text-xs text-white mt-1">{event.stats.shares}</span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={handleSave}
          aria-label="Save event"
        >
          <div className="bg-black/30 w-12 h-12 rounded-full flex items-center justify-center">
            <Bookmark 
              className={cn(
                "w-7 h-7 transition-all duration-300 transform hover:scale-110", 
                saved ? "fill-neon-yellow text-neon-yellow" : "text-white"
              )} 
            />
          </div>
          <span className="text-xs text-white mt-1">Save</span>
        </button>
      </div>
      
      {/* Event Info at Bottom */}
      <div className="mt-auto z-10 px-4 pb-20">
        <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
        
        <div 
          ref={descriptionRef}
          className={cn(
            "text-white text-sm mb-3 transition-all duration-300",
            showFullDescription ? "" : "line-clamp-2"
          )}
        >
          {event.description}
        </div>
        
        {isDescriptionOverflowing && (
          <button 
            className="text-neon-yellow text-xs mb-3"
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            {showFullDescription ? "Show less" : "Read more"}
          </button>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          {event.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="bg-black/30 border-white/20 text-white hover:bg-black/50"
            >
              #{tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-white text-sm">
            <Calendar className="w-4 h-4 mr-1 text-neon-yellow" />
            <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
          </div>
          <div className="flex items-center text-white text-sm">
            <MapPin className="w-4 h-4 mr-1 text-neon-yellow" />
            <span>{event.location}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-neon-yellow font-bold text-xl">
            {typeof event.price === 'number' ? (event.price === 0 ? "Free" : `R ${event.price.toFixed(2)}`) : event.price}
          </div>
          <Button 
            className={cn(
              "font-bold px-6 py-2 rounded-full shadow-lg transition-transform duration-200 transform hover:scale-105",
              hasTicket 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-neon-yellow hover:bg-neon-yellow/90 text-black"
            )}
            onClick={() => !hasTicket && setShowTicketDialog(true)}
            disabled={hasTicket}
          >
            {hasTicket ? "Ticket Purchased" : (typeof event.price === 'number' && event.price === 0 ? "RSVP" : "Get Tickets")}
          </Button>
        </div>
        
        {/* Music Playing Indicator (TikTok-style) */}
        <div className="flex items-center mt-3 text-white text-xs">
          <div className="flex items-center mr-2">
            <Music className="w-3 h-3 text-neon-yellow mr-1" />
            <SoundWave isPlaying={isVideoPlaying || isActive} className="mr-1" />
          </div>
          <div className="overflow-hidden max-w-[80%]">
            <div className="animate-marquee whitespace-nowrap">
              {event.category} • {event.organizer.name} • {event.title} • {event.tags.join(' • ')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Swipe Down Indicator */}
      <div className="absolute left-0 right-0 bottom-4 flex justify-center z-20 pointer-events-none">
        <div className="animate-bounce text-white/70 flex flex-col items-center">
          <span className="text-xs">Swipe for next event</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {/* Ticket Purchase Dialog */}
      <TicketPurchaseDialog 
        event={event}
        isOpen={showTicketDialog}
        onClose={() => setShowTicketDialog(false)}
      />
    </div>
  );
}
