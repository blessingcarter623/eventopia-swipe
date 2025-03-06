
import React, { useState } from "react";
import { PlusCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrganizerProfileProps {
  organizer: User;
  eventsCount: number;
}

const OrganizerProfile = ({ organizer, eventsCount }: OrganizerProfileProps) => {
  const { profile } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(organizer.followers);
  
  // Check if the current user is this organizer
  const isCurrentUser = profile?.id === organizer.id;
  
  const handleFollow = async () => {
    if (!profile) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow this organizer",
        variant: "destructive",
      });
      return;
    }
    
    // Toggle following state
    setIsFollowing(!isFollowing);
    
    // Update followers count
    if (!isFollowing) {
      setFollowersCount(followersCount + 1);
      toast({
        title: "Success!",
        description: `You are now following ${organizer.displayName}`,
      });
    } else {
      setFollowersCount(followersCount - 1);
      toast({
        title: "Unfollowed",
        description: `You are no longer following ${organizer.displayName}`,
      });
    }
    
    // In a real implementation, you would update the database
    // This would be implemented with a followers table in the database
  };
  
  return (
    <div className="bg-gradient-to-b from-darkbg-lighter to-darkbg p-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img 
            src={organizer.avatar} 
            alt={organizer.displayName} 
            className="w-16 h-16 rounded-full object-cover border-2 border-neon-yellow"
          />
          {organizer.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-neon-yellow text-black rounded-full p-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.25 6.75L9.75 17.25L4.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{organizer.displayName}</h2>
          <p className="text-gray-400">@{organizer.username}</p>
          <div className="flex gap-3 mt-1">
            <span className="text-sm text-gray-400">
              <span className="text-white font-bold">{followersCount}</span> followers
            </span>
            <span className="text-sm text-gray-400">
              <span className="text-white font-bold">{eventsCount}</span> events
            </span>
          </div>
        </div>
      </div>
      
      {isCurrentUser ? (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Link to="/create-event" className="block">
            <Button className="w-full bg-neon-yellow hover:bg-neon-yellow/90 text-black">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </Link>
          <Link to="/organizer/analytics" className="block">
            <Button variant="outline" className="w-full border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
        </div>
      ) : (
        <Button 
          onClick={handleFollow}
          className={`w-full mt-4 ${isFollowing ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-neon-yellow hover:bg-neon-yellow/90 text-black'}`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
};

export default OrganizerProfile;
