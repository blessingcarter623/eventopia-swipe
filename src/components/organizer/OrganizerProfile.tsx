
import React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface OrganizerProfileProps {
  organizer: User;
  eventsCount: number;
}

const OrganizerProfile = ({ organizer, eventsCount }: OrganizerProfileProps) => {
  const { profile } = useAuth();
  
  // Check if the current user is this organizer
  const isCurrentUser = profile?.id === organizer.id;
  
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
              <span className="text-white font-bold">{organizer.followers}</span> followers
            </span>
            <span className="text-sm text-gray-400">
              <span className="text-white font-bold">{eventsCount}</span> events
            </span>
          </div>
        </div>
      </div>
      
      {isCurrentUser ? (
        <Link to="/create-event">
          <Button className="w-full mt-4 bg-neon-yellow hover:bg-neon-yellow/90 text-black">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New Event
          </Button>
        </Link>
      ) : (
        <Button className="w-full mt-4 bg-neon-yellow hover:bg-neon-yellow/90 text-black">
          Follow
        </Button>
      )}
    </div>
  );
};

export default OrganizerProfile;
