
import React, { useEffect, useState } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import EventForm from "@/components/event/EventForm";
import { useEventForm } from "@/hooks/useEventForm";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SoundWave } from "@/components/ui/sound-wave";

interface EventVideo {
  id: string;
  title: string;
  description: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

const CreateEventPage = () => {
  const {
    isLoading,
    formData,
    setFormData,
    previewUrl,
    setPreviewUrl,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleTagKeyDown,
    handleFileChange,
    handleSubmit,
  } = useEventForm();

  const { user } = useAuth();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  // Fetch user's videos from Supabase
  const { data: userVideos = [], isLoading: isLoadingVideos } = useQuery({
    queryKey: ['user-videos', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('event_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching user videos:", error);
        throw error;
      }
      
      return data as EventVideo[];
    },
    enabled: !!user,
  });

  const selectVideo = (video: EventVideo) => {
    setSelectedVideoId(video.id);
    
    // Update form data with video details
    if (video.media_url) {
      setFormData(prev => ({
        ...prev,
        mediaFile: null, // Clear any file selection
        videoId: video.id,
        videoUrl: video.media_url,
      }));
      
      setPreviewUrl(video.media_url);
    }
    
    setIsVideoDialogOpen(false);
  };

  const handleVideoHover = (videoId: string, play: boolean) => {
    if (play) {
      setCurrentlyPlaying(videoId);
    } else if (currentlyPlaying === videoId) {
      setCurrentlyPlaying(null);
    }
  };

  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <Link to="/" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Create Event</h1>
          <div className="w-6"></div> {/* Empty div for spacing */}
        </div>
        
        {/* Video Selection Button */}
        <div className="px-4 pt-4">
          <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full border-dashed border-white/30 text-white bg-darkbg-lighter hover:bg-darkbg flex items-center justify-center gap-2 h-12"
              >
                <Video className="w-5 h-5 text-neon-yellow" />
                {selectedVideoId ? "Change Event Video" : "Select an Event Video"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] bg-darkbg text-white border-gray-800 max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Select Event Video</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Choose a video you've created in the Video Studio
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {isLoadingVideos ? (
                  <div className="col-span-2 flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-yellow"></div>
                  </div>
                ) : userVideos.length > 0 ? (
                  userVideos.map((video) => (
                    <div 
                      key={video.id}
                      className={`relative rounded-lg overflow-hidden cursor-pointer border-2 ${selectedVideoId === video.id ? 'border-neon-yellow' : 'border-transparent'}`}
                      onClick={() => selectVideo(video)}
                      onMouseEnter={() => handleVideoHover(video.id, true)}
                      onMouseLeave={() => handleVideoHover(video.id, false)}
                    >
                      {video.media_url ? (
                        <div className="aspect-video">
                          <video 
                            src={video.media_url} 
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            // Conditionally play on hover
                            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                            <h3 className="text-white font-bold text-sm line-clamp-1">{video.title}</h3>
                            <div className="flex items-center mt-1">
                              <p className="text-gray-300 text-xs">
                                {new Date(video.created_at).toLocaleDateString()}
                              </p>
                              {currentlyPlaying === video.id && (
                                <SoundWave isPlaying={true} className="ml-2" />
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-darkbg-lighter flex items-center justify-center">
                          <p className="text-white/50">No preview</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-6 bg-darkbg-lighter rounded-lg text-center">
                    <Video className="w-10 h-10 text-white/30 mx-auto mb-3" />
                    <p className="text-white">No videos available</p>
                    <p className="text-gray-400 text-sm mt-1">Create videos in the Video Studio first</p>
                    <Link to="/video-studio">
                      <Button className="mt-4 bg-neon-yellow text-black hover:bg-neon-yellow/90">
                        Go to Video Studio
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <EventForm
          isLoading={isLoading}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          tagInput={tagInput}
          setTagInput={setTagInput}
          addTag={addTag}
          removeTag={removeTag}
          handleTagKeyDown={handleTagKeyDown}
          handleFileChange={handleFileChange}
        />
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default CreateEventPage;
