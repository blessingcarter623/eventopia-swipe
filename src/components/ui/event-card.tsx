
import React, { useState, useRef, useEffect } from "react";
import { Event } from "@/types";
import { Heart, MessageCircle, Share2, Bookmark, Calendar, MapPin, UserPlus, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./button";

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
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Handle video playback based on card visibility
  useEffect(() => {
    const videoElement = localVideoRef.current;
    if (!videoElement) return;
    
    if (isActive && event.media.type === "video") {
      videoElement.muted = true; // Ensure it can autoplay
      videoElement.currentTime = 0; // Start from beginning
      videoElement.play().catch(err => console.log("Video autoplay prevented:", err));
    } else if (videoElement) {
      videoElement.pause();
    }
  }, [isActive, event.media.type]);

  const handleLike = () => {
    setLiked(!liked);
    onLike(event.id);
  };

  const handleSave = () => {
    setSaved(!saved);
    onBookmark(event.id);
  };

  return (
    <div 
      className={cn(
        "relative w-full h-full flex flex-col justify-between transition-opacity duration-300",
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
            muted
            playsInline
            loop
            preload="auto"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
      </div>
      
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 z-10">
        <div className="flex items-center">
          <img 
            src={event.organizer.avatar} 
            alt={event.organizer.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-neon-yellow"
          />
          <div className="ml-2">
            <div className="flex items-center">
              <p className="text-white font-semibold">{event.organizer.name}</p>
              {event.organizer.isVerified && (
                <span className="ml-1 bg-neon-yellow text-black text-xs px-1 rounded-full">✓</span>
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
      
      {/* Event Info */}
      <div className="mt-auto z-10">
        <div className="p-4 glass-card rounded-t-3xl">
          <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
          <p className="text-gray-300 text-sm line-clamp-2 mb-3">{event.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {event.tags.map((tag) => (
              <span key={tag} className="bg-white/10 px-2 py-1 rounded-full text-xs text-white">
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center text-gray-300 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{event.location}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-neon-yellow font-bold">
              {typeof event.price === 'number' ? `$${event.price.toFixed(2)}` : event.price}
            </div>
            <Button className="bg-neon-yellow hover:bg-neon-yellow/90 text-black font-bold px-6 py-2 rounded-full">
              Get Tickets
            </Button>
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="flex justify-between bg-darkbg-lighter p-4 rounded-b-3xl border-t border-white/5">
          <button 
            className="flex flex-col items-center" 
            onClick={handleLike}
            aria-label="Like event"
          >
            <Heart className={cn("w-6 h-6", liked ? "fill-neon-red text-neon-red" : "text-white")} />
            <span className="text-xs text-gray-300 mt-1">{liked ? event.stats.likes + 1 : event.stats.likes}</span>
          </button>
          
          <button 
            className="flex flex-col items-center"
            onClick={showComments}
            aria-label="Show comments"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="text-xs text-gray-300 mt-1">{event.stats.comments}</span>
          </button>
          
          <button 
            className="flex flex-col items-center"
            onClick={() => onShare(event.id)}
            aria-label="Share event"
          >
            <Share2 className="w-6 h-6 text-white" />
            <span className="text-xs text-gray-300 mt-1">{event.stats.shares}</span>
          </button>
          
          <button 
            className="flex flex-col items-center"
            onClick={handleSave}
            aria-label="Save event"
          >
            <Bookmark className={cn("w-6 h-6", saved ? "fill-neon-yellow text-neon-yellow" : "text-white")} />
            <span className="text-xs text-gray-300 mt-1">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}
