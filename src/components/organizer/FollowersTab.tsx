
import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "@/types";

interface FollowersTabProps {
  followers: User[];
}

const FollowersTab = ({ followers }: FollowersTabProps) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Your Followers</h3>
      
      <div className="space-y-3">
        {followers.map(follower => (
          <div key={follower.id} className="bg-darkbg-lighter p-3 rounded-xl flex items-center gap-3">
            <img 
              src={follower.avatar} 
              alt={follower.displayName} 
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="text-white font-medium">{follower.displayName}</h4>
              <p className="text-gray-400 text-sm">@{follower.username}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              Following
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowersTab;
