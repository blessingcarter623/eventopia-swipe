
import React, { useState, useRef, useEffect } from "react";
import { Event } from "@/types";
import { Heart, MessageCircle, Share2, Bookmark, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface EventCardProps {
  event: Event;
  isActive: boolean;
  onLike: (eventId: string) => void;
  onComment: (eventId: string) => void;
  onShare: (eventId: string) => void;
  onBookmark: (eventId: string) => void;
  showComments: () => void;
}

export function EventCard({
  event,
  isActive,
  onLike,
  onComment,
  onShare,
  onBookmark,
  showComments,
}: EventCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(event.isSaved || false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle video playback based on card visibility
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive && event.media.type === "video") {
      videoRef.current.play().catch(err => console.log("Video autoplay prevented:", err));
    } else if (videoRef.current) {
      videoRef.current.pause();
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
            ref={videoRef}
            src={event.media.url} 
            poster={event.media.thumbnail} 
            className="w-full h-full object-cover"
            muted
            playsInline
            loop
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
        <button className="bg-neon-yellow text-black font-medium px-4 py-1 rounded-full text-sm hover:brightness-110 transition-all">
          Follow
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
            <button className="bg-neon-yellow text-black font-bold px-6 py-2 rounded-full hover:brightness-110 transition-all">
              Get Tickets
            </button>
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="flex justify-between bg-darkbg-lighter p-4 rounded-b-3xl border-t border-white/5">
          <button 
            className="flex flex-col items-center" 
            onClick={handleLike}
          >
            <Heart className={cn("w-6 h-6", liked ? "fill-neon-red text-neon-red" : "text-white")} />
            <span className="text-xs text-gray-300 mt-1">{liked ? event.stats.likes + 1 : event.stats.likes}</span>
          </button>
          
          <button 
            className="flex flex-col items-center"
            onClick={showComments}
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="text-xs text-gray-300 mt-1">{event.stats.comments}</span>
          </button>
          
          <button 
            className="flex flex-col items-center"
            onClick={() => onShare(event.id)}
          >
            <Share2 className="w-6 h-6 text-white" />
            <span className="text-xs text-gray-300 mt-1">{event.stats.shares}</span>
          </button>
          
          <button 
            className="flex flex-col items-center"
            onClick={handleSave}
          >
            <Bookmark className={cn("w-6 h-6", saved ? "fill-neon-yellow text-neon-yellow" : "text-white")} />
            <span className="text-xs text-gray-300 mt-1">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}
