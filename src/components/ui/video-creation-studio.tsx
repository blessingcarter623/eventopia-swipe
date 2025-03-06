
import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scissors, Music, Paintbrush, Type, Video, Upload, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/hooks/use-toast";
import { VideoUploader } from "./video-studio/VideoUploader";
import { VideoControls } from "./video-studio/VideoControls";
import { TrimTab } from "./video-studio/TrimTab";
import { TextTab } from "./video-studio/TextTab";
import { MusicTab } from "./video-studio/MusicTab";
import { EffectsTab } from "./video-studio/EffectsTab";
import { PublishActions } from "./video-studio/PublishActions";
import { EmptyState } from "./video-studio/EmptyState";
import { EventVideo } from "./video-studio/types";

export function VideoCreationStudio() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoMode, setVideoMode] = useState<'upload' | 'record'>('upload');
  const [activeEditTab, setActiveEditTab] = useState('trim');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventPrice, setEventPrice] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [trimStart, setTrimStart] = useState([0]);
  const [trimEnd, setTrimEnd] = useState([100]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('draft');

  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume[0] / 100;
    }
  };
  
  const uploadVideoToStorage = async () => {
    if (!videoFile || !user) return null;
    
    setIsUploading(true);
    try {
      const fileExt = videoFile.name.split('.').pop();
      const filePath = `${user.id}/${uuidv4()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('event_videos')
        .upload(filePath, videoFile);
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event_videos')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const saveEventVideo = async (status: 'draft' | 'published' = 'draft') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your event video",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      let mediaUrl = videoSrc;
      
      // If we have a local file, upload it first
      if (videoFile) {
        mediaUrl = await uploadVideoToStorage();
        if (!mediaUrl) return;
      }
      
      const videoData = {
        title: title || "Untitled Event",
        description,
        location: eventLocation,
        event_date: eventDate,
        event_time: "",
        event_price: eventPrice,
        media_url: mediaUrl,
        thumbnail_url: null, // We could generate this in the future
        status,
        user_id: user.id,
      };
      
      let result;
      
      if (currentVideoId) {
        // Update existing video
        result = await supabase
          .from('event_videos')
          .update(videoData)
          .eq('id', currentVideoId);
      } else {
        // Insert new video
        result = await supabase
          .from('event_videos')
          .insert(videoData)
          .select();
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // If this was a new insert, store the ID
      if (result.data && !currentVideoId) {
        setCurrentVideoId(result.data[0].id);
      }
      
      setPublishStatus(status);
      
      toast({
        title: status === 'published' ? "Event published!" : "Draft saved",
        description: status === 'published' 
          ? "Your event video has been created and is now live" 
          : "Your event video draft has been saved",
      });
      
    } catch (error) {
      console.error('Error saving event video:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your event video",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePublish = () => saveEventVideo('published');
  const handleSaveDraft = () => saveEventVideo('draft');
  
  const handleDeleteVideo = () => {
    setVideoSrc(null);
    setIsPlaying(false);
    setVideoFile(null);
  };
  
  useEffect(() => {
    // Add listener for video end
    if (videoRef.current) {
      videoRef.current.onended = () => setIsPlaying(false);
    }
  }, [videoSrc]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Mode Selection */}
      <div className="p-4 bg-darkbg-lighter">
        <Tabs 
          value={videoMode} 
          onValueChange={(v) => setVideoMode(v as 'upload' | 'record')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full mb-2">
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </TabsTrigger>
            <TabsTrigger 
              value="record" 
              className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black"
            >
              <Camera className="w-4 h-4 mr-2" />
              Record Video
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <VideoUploader 
              videoSrc={videoSrc}
              videoMode="upload"
              isRecording={isRecording}
              onFileUpload={handleFileUpload}
              setIsRecording={setIsRecording}
              videoRef={videoRef}
            />
          </TabsContent>
          
          <TabsContent value="record" className="mt-0">
            <VideoUploader 
              videoSrc={videoSrc}
              videoMode="record"
              isRecording={isRecording}
              onFileUpload={handleFileUpload}
              setIsRecording={setIsRecording}
              videoRef={videoRef}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {videoSrc && (
        <>
          {/* Video Controls */}
          <VideoControls 
            isPlaying={isPlaying}
            volume={volume}
            handlePlayPause={handlePlayPause}
            handleVolumeChange={handleVolumeChange}
            onDelete={handleDeleteVideo}
          />
          
          {/* Editing Tabs */}
          <div className="flex-1 overflow-y-auto p-4 bg-darkbg-lighter">
            <Tabs value={activeEditTab} onValueChange={setActiveEditTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger 
                  value="trim" 
                  className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black"
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  Trim
                </TabsTrigger>
                <TabsTrigger 
                  value="text" 
                  className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Text
                </TabsTrigger>
                <TabsTrigger 
                  value="music" 
                  className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Music
                </TabsTrigger>
                <TabsTrigger 
                  value="effects" 
                  className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black"
                >
                  <Paintbrush className="w-4 h-4 mr-2" />
                  Effects
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="trim" className="mt-4">
                <TrimTab 
                  trimStart={trimStart}
                  trimEnd={trimEnd}
                  setTrimStart={setTrimStart}
                  setTrimEnd={setTrimEnd}
                />
              </TabsContent>
              
              <TabsContent value="text" className="mt-4">
                <TextTab 
                  title={title}
                  description={description}
                  eventDate={eventDate}
                  eventPrice={eventPrice}
                  eventLocation={eventLocation}
                  setTitle={setTitle}
                  setDescription={setDescription}
                  setEventDate={setEventDate}
                  setEventPrice={setEventPrice}
                  setEventLocation={setEventLocation}
                />
              </TabsContent>
              
              <TabsContent value="music" className="mt-4">
                <MusicTab 
                  volume={volume}
                  handleVolumeChange={handleVolumeChange}
                />
              </TabsContent>
              
              <TabsContent value="effects" className="mt-4">
                <EffectsTab 
                  eventLocation={eventLocation}
                  setEventLocation={setEventLocation}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Publish Actions */}
          <PublishActions 
            isSaving={isSaving}
            isUploading={isUploading}
            publishStatus={publishStatus}
            handleSaveDraft={handleSaveDraft}
            handlePublish={handlePublish}
          />
        </>
      )}
      
      {!videoSrc && <EmptyState />}
    </div>
  );
}
