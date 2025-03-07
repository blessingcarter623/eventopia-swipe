
import React, { useState } from "react";
import { Upload, X, Video, Image as ImageIcon } from "lucide-react";
import { EventImageUploaderProps } from "@/types/event-form";
import { Button } from "@/components/ui/button";
import { SoundWave } from "@/components/ui/sound-wave";

const EventImageUploader: React.FC<EventImageUploaderProps> = ({
  mediaFile,
  setMediaFile,
  previewUrl,
  setPreviewUrl,
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setMediaFile(file);
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  
  const handleClear = () => {
    setMediaFile(null);
    
    // If there's a preview URL from a local file, revoke it
    if (previewUrl && !previewUrl.startsWith('http')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(null);
    setIsVideoPlaying(false);
  };
  
  const isVideo = () => {
    if (mediaFile && mediaFile.type.startsWith('video/')) {
      return true;
    }
    // Check if the URL is a video (common video extensions)
    if (previewUrl && !mediaFile) {
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
      return videoExtensions.some(ext => previewUrl.toLowerCase().includes(ext));
    }
    return false;
  };
  
  const toggleVideoPlay = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (isVideoPlaying) {
      video.pause();
    } else {
      video.play().catch(err => console.error("Error playing video:", err));
    }
    setIsVideoPlaying(!isVideoPlaying);
  };
  
  return (
    <div className="space-y-2">
      <label className="block text-white mb-2">Event Media</label>
      
      {!previewUrl ? (
        <div className="border-2 border-dashed border-gray-700 rounded-md p-8 text-center">
          <input
            type="file"
            id="event-image"
            onChange={handleChange}
            className="hidden"
            accept="image/*,video/*"
          />
          <label
            htmlFor="event-image"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-white mb-1">Drag and drop or click to upload</p>
            <p className="text-gray-400 text-sm">JPG, PNG, GIF, MP4 or WebM</p>
          </label>
        </div>
      ) : (
        <div className="relative rounded-md overflow-hidden border border-gray-700">
          {isVideo() ? (
            <div className="relative aspect-video">
              <video
                src={previewUrl}
                className="w-full h-full object-cover cursor-pointer"
                onClick={toggleVideoPlay}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={() => setIsVideoPlaying(false)}
                playsInline
                controls // Add controls to enable user to control volume
              />
              <div className="absolute bottom-3 left-3 z-10">
                {isVideoPlaying && <SoundWave isPlaying={true} />}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              <div className="absolute top-3 right-3 z-10">
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video">
              <img
                src={previewUrl}
                alt="Event preview"
                className="w-full h-full object-cover"
              />
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8 rounded-full absolute top-3 right-3"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between text-sm text-gray-400 mt-1">
        <span>
          {isVideo() ? (
            <span className="flex items-center">
              <Video className="w-4 h-4 mr-1" /> Video
            </span>
          ) : (
            <span className="flex items-center">
              <ImageIcon className="w-4 h-4 mr-1" /> Image
            </span>
          )}
        </span>
        <span>Max size: 10MB</span>
      </div>
    </div>
  );
};

export default EventImageUploader;
