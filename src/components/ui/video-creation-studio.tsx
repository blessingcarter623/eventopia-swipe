import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { 
  Video, Upload, Scissors, Music, Map, 
  Paintbrush, Play, Pause, Volume2, Share,
  Camera, Trash, Check, Image, Type, PlusCircle,
  Loader2
} from "lucide-react";

interface EventVideo {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  event_price: string;
  media_url: string;
  thumbnail_url: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

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

  const { user, profile } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
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
    setVideoSrc("https://i.pravatar.cc/300"); // Placeholder for demo
    toast({
      title: "Recording completed",
      description: "Your video has been captured",
    });
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
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
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
            <Card className="border border-dashed border-white/20 bg-darkbg/50 py-10 flex flex-col items-center justify-center cursor-pointer hover:bg-darkbg/70 transition-colors" onClick={triggerFileInput}>
              <input 
                type="file" 
                className="hidden" 
                accept="video/*" 
                onChange={handleFileUpload} 
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
                  onEnded={() => setIsPlaying(false)}
                />
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="record" className="mt-0">
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
          </TabsContent>
        </Tabs>
      </div>
      
      {videoSrc && (
        <>
          {/* Video Controls */}
          <div className="p-4 bg-darkbg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>
                <div className="flex items-center space-x-2 text-white">
                  <Volume2 className="w-4 h-4" />
                  <div className="w-24">
                    <Slider
                      value={volume}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => {
                  setVideoSrc(null);
                  setIsPlaying(false);
                  setVideoFile(null);
                }}
              >
                <Trash className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
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
                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 block">Trim Video</Label>
                    <div className="bg-darkbg rounded-lg p-4">
                      <div className="w-full h-2 bg-white/20 rounded-full mb-4 relative">
                        <div 
                          className="absolute top-0 left-0 h-full bg-neon-yellow rounded-full" 
                          style={{ 
                            left: `${trimStart[0]}%`, 
                            width: `${trimEnd[0] - trimStart[0]}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <Label className="text-white text-xs">Start Point</Label>
                          <Slider
                            value={trimStart}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value) => {
                              if (value[0] < trimEnd[0]) {
                                setTrimStart(value);
                              }
                            }}
                            className="w-36"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-xs">End Point</Label>
                          <Slider
                            value={trimEnd}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value) => {
                              if (value[0] > trimStart[0]) {
                                setTrimEnd(value);
                              }
                            }}
                            className="w-36"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white mb-2 block">Preview Duration: 00:32</Label>
                    <div className="bg-darkbg rounded-lg p-2 flex space-x-2">
                      <Badge className="bg-neon-yellow text-black">Trim</Badge>
                      <Badge variant="outline">Split</Badge>
                      <Badge variant="outline">Speed</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 block">Add Text Overlay</Label>
                    <div className="space-y-3">
                      <div>
                        <Input 
                          placeholder="Event Title" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-darkbg border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Textarea 
                          placeholder="Event Description" 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="bg-darkbg border-white/20 text-white min-h-20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Input 
                            placeholder="Event Date & Time" 
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="bg-darkbg border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <Input 
                            placeholder="Price" 
                            value={eventPrice}
                            onChange={(e) => setEventPrice(e.target.value)}
                            className="bg-darkbg border-white/20 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Input 
                          placeholder="Location" 
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          className="bg-darkbg border-white/20 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white mb-2 block">Text Style</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <Button variant="outline" className="h-12 text-white border-white/20">
                        Aa
                      </Button>
                      <Button variant="outline" className="h-12 text-white border-white/20 font-serif">
                        Aa
                      </Button>
                      <Button variant="outline" className="h-12 text-white border-white/20 font-mono">
                        Aa
                      </Button>
                      <Button variant="outline" className="h-12 text-white border-white/20 italic">
                        Aa
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="music" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 block">Select Audio Track</Label>
                    <div className="space-y-2">
                      <div className="bg-darkbg rounded-lg p-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <Music className="w-5 h-5 text-neon-yellow mr-3" />
                          <div>
                            <p className="text-white">Upbeat Electronic</p>
                            <p className="text-xs text-gray-400">2:45</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-white">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="bg-darkbg rounded-lg p-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <Music className="w-5 h-5 text-neon-yellow mr-3" />
                          <div>
                            <p className="text-white">Festival Vibes</p>
                            <p className="text-xs text-gray-400">3:12</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-white">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="bg-darkbg rounded-lg p-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <Music className="w-5 h-5 text-neon-yellow mr-3" />
                          <div>
                            <p className="text-white">Trending Sound #1</p>
                            <p className="text-xs text-gray-400">0:45</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-white">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white mb-2 block">Upload Custom Audio</Label>
                    <Button variant="outline" className="w-full border-white/20 text-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Audio File
                    </Button>
                  </div>
                  
                  <div>
                    <Label className="text-white mb-2 flex justify-between">
                      <span>Audio Volume</span>
                      <span>{volume[0]}%</span>
                    </Label>
                    <Slider
                      value={volume}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="effects" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 block">Video Filters</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <Button variant="outline" className="h-12 text-white border-white/20 bg-darkbg">
                        None
                      </Button>
                      <Button variant="outline" className="h-12 text-white border-white/20 bg-blue-500/30">
                        Cool
                      </Button>
                      <Button variant="outline" className="h-12 text-white border-white/20 bg-amber-500/30">
                        Warm
                      </Button>
                      <Button variant="outline" className="h-12 text-white border-white/20 bg-gray-500/30">
                        B&W
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white mb-2 block">Add Venue Location</Label>
                    <div className="bg-darkbg rounded-lg p-3 flex items-center">
                      <Map className="w-5 h-5 text-neon-yellow mr-3" />
                      <Input 
                        placeholder="Search for a location" 
                        className="bg-transparent border-0 text-white focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white mb-2 block">Transitions</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" className="h-12 text-white border-white/20">
                        None
                      </Button>
                      <Button variant="outline" className="h-12 text-white border-white/20">
                        Fade
                      </Button>
                      <Button variant="outline" className="h-12 text-white border-white/20">
                        Wipe
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Add Branding</Label>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Auto-Generate Thumbnail</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Publish Actions */}
          <div className="p-4 bg-darkbg-lighter border-t border-white/10">
            <div className="flex justify-between items-center">
              <Button variant="outline" className="text-white border-white/20">
                <Image className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white"
                  onClick={handleSaveDraft}
                  disabled={isSaving || isUploading}
                >
                  {(isSaving || isUploading) && publishStatus === 'draft' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Save Draft
                </Button>
                <Button 
                  className="bg-neon-yellow hover:bg-neon-yellow/90 text-black"
                  onClick={handlePublish}
                  disabled={isSaving || isUploading}
                >
                  {(isSaving || isUploading) && publishStatus === 'published' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Publish Event
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {!videoSrc && (
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
      )}
    </div>
  );
}
