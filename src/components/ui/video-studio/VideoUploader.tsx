
import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface VideoUploaderProps {
  videoSrc: string | null;
  videoMode: 'upload' | 'record';
  isRecording: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setIsRecording: (isRecording: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const VideoUploader = ({
  videoSrc,
  videoMode,
  isRecording,
  onFileUpload,
  setIsRecording,
  videoRef
}: VideoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const startRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording started",
      description: "Your video recording has begun",
    });
    // In a real implementation, this would access the camera and start recording
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    // In a real implementation, this would stop recording and set the videoSrc
    toast({
      title: "Recording completed",
      description: "Your video has been captured",
    });
  };
  
  if (videoMode === 'upload') {
    return (
      <Card className="border border-dashed border-white/20 bg-darkbg/50 py-10 flex flex-col items-center justify-center cursor-pointer hover:bg-darkbg/70 transition-colors" onClick={triggerFileInput}>
        <input 
          type="file" 
          className="hidden" 
          accept="video/*" 
          onChange={onFileUpload} 
          ref={fileInputRef}
        />
        {!videoSrc ? (
          <>
            <Upload className="w-12 h-12 text-neon-yellow mb-4" />
            <p className="text-white font-medium">Upload your event video</p>
            <p className="text-gray-400 text-sm mt-1">Drag and drop or click to browse</p>
          </>
        ) : (
          <video 
            ref={videoRef}
            src={videoSrc} 
            className="max-h-60 rounded-lg" 
            controls={false}
          />
        )}
      </Card>
    );
  }
  
  return (
    <Card className="border border-white/20 bg-darkbg/50 py-10 flex flex-col items-center justify-center">
      {!isRecording ? (
        <>
          <Camera className="w-12 h-12 text-neon-yellow mb-4" />
          <p className="text-white font-medium">Record a new video</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Create a video using your camera</p>
          <Button 
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Start Recording
          </Button>
        </>
      ) : (
        <>
          <div className="relative w-full max-w-md h-60 bg-black rounded-lg mb-4 flex items-center justify-center">
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-white text-sm">Recording</span>
            </div>
            <Camera className="w-16 h-16 text-white/30" />
          </div>
          <Button 
            onClick={stopRecording}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Stop Recording
          </Button>
        </>
      )}
    </Card>
  );
};
