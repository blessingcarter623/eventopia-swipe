
import React from "react";
import { Card } from "@/components/ui/card";
import { Video } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
      <Video className="w-16 h-16 text-neon-yellow mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Create Your First Event Video</h3>
      <p className="text-gray-400 max-w-md mb-6">
        Upload or record a video to promote your event. Add text, music, and effects to make it stand out.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        <Card className="bg-darkbg-lighter border-white/10 p-4">
          <div className="flex items-center mb-3">
            <div className="bg-neon-yellow w-8 h-8 rounded-full flex items-center justify-center text-black font-bold mr-3">1</div>
            <h4 className="text-white font-medium">Create</h4>
          </div>
          <p className="text-gray-400 text-sm">Upload or record your event video</p>
        </Card>
        <Card className="bg-darkbg-lighter border-white/10 p-4">
          <div className="flex items-center mb-3">
            <div className="bg-neon-yellow w-8 h-8 rounded-full flex items-center justify-center text-black font-bold mr-3">2</div>
            <h4 className="text-white font-medium">Edit</h4>
          </div>
          <p className="text-gray-400 text-sm">Add text, music, and effects</p>
        </Card>
        <Card className="bg-darkbg-lighter border-white/10 p-4">
          <div className="flex items-center mb-3">
            <div className="bg-neon-yellow w-8 h-8 rounded-full flex items-center justify-center text-black font-bold mr-3">3</div>
            <h4 className="text-white font-medium">Publish</h4>
          </div>
          <p className="text-gray-400 text-sm">Share your event with the world</p>
        </Card>
      </div>
    </div>
  );
};
