
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User, UserCheck } from "lucide-react";

export interface FollowersTabProps {
  followers: any[];
  isLoading?: boolean;
}

const FollowersTab: React.FC<FollowersTabProps> = ({ followers, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 text-neon-yellow animate-spin" />
      </div>
    );
  }
  
  if (followers.length === 0) {
    return (
      <div className="bg-darkbg-lighter border border-gray-700 rounded-lg p-8 text-center">
        <UserCheck className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Followers Yet</h3>
        <p className="text-gray-400">When someone follows you, they'll appear here.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {followers.map((follower, index) => (
          <Card key={index} className="bg-darkbg-lighter border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={follower.avatar} alt={follower.name} />
                  <AvatarFallback className="bg-gray-800">
                    <User className="h-6 w-6 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{follower.name}</h4>
                  <p className="text-sm text-gray-400">@{follower.username}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-700 hover:bg-neon-yellow hover:text-black"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Follow Back
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FollowersTab;
