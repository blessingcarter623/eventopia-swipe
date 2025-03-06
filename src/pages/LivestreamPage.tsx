
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useLivestreams } from '@/hooks/useLivestreams';
import { useAuth } from '@/context/AuthContext';
import { LivestreamControls } from '@/components/livestream/LivestreamControls';
import { JoinAsCamera } from '@/components/livestream/JoinAsCamera';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronLeft, Users, AlertCircle, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LivestreamPage = () => {
  const { livestreamId } = useParams<{ livestreamId: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [cameraToken, setCameraToken] = useState<string | null>(null);
  
  const {
    localStream,
    remoteStream,
    isConnected,
    isLoading,
    error,
    devices,
    settings,
    updateSettings,
    startLocalStream,
    stopStreaming,
  } = useWebRTC();
  
  const {
    livestreams,
    startLivestream,
    endLivestream,
    isLoadingLivestreams,
    addCamera,
  } = useLivestreams();
  
  const currentLivestream = livestreams.find(stream => stream.id === livestreamId);
  const isHost = currentLivestream?.host_id === profile?.id;
  const isLive = currentLivestream?.status === 'live';
  
  // Generate a camera join token
  const generateCameraToken = async () => {
    if (!livestreamId || !profile?.id) return;
    
    try {
      const camera = await addCamera.mutateAsync({
        livestreamId,
        userId: profile.id,
        cameraLabel: `${profile.display_name || 'User'}'s Camera`
      });
      
      setCameraToken(camera.join_token);
      
      toast({
        title: "Camera Join Token",
        description: "Token generated successfully. Share this with additional camera operators.",
      });
    } catch (error) {
      console.error("Failed to generate camera token:", error);
      toast({
        title: "Error",
        description: "Failed to generate camera token",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
  
  const handleStartStream = async () => {
    if (!livestreamId) return;
    
    try {
      // First start capturing media
      const stream = await startLocalStream();
      if (!stream) {
        toast({
          title: "Stream Error",
          description: "Could not access camera or microphone",
          variant: "destructive"
        });
        return;
      }
      
      // Then start the livestream
      await startLivestream(livestreamId);
      
      toast({
        title: "Stream Started",
        description: "Your livestream is now active",
      });
    } catch (error) {
      console.error("Failed to start stream:", error);
      toast({
        title: "Stream Error",
        description: "Failed to start livestream",
        variant: "destructive"
      });
    }
  };
  
  const handleStopStream = async () => {
    if (!livestreamId) return;
    
    try {
      stopStreaming();
      await endLivestream(livestreamId);
      
      toast({
        title: "Stream Ended",
        description: "Your livestream has ended",
      });
    } catch (error) {
      console.error("Failed to stop stream:", error);
      toast({
        title: "Error",
        description: "Failed to end livestream",
        variant: "destructive"
      });
    }
  };

  if (isLoadingLivestreams || !currentLivestream) {
    return (
      <div className="app-height bg-darkbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-yellow"></div>
      </div>
    );
  }

  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/livestreams" className="text-white">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">{currentLivestream.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentLivestream.host?.avatar} />
                  <AvatarFallback>{currentLivestream.host?.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-400">{currentLivestream.host?.name}</span>
                {isLive && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>•</span>
                    <Users className="h-4 w-4" />
                    <span>0 viewers</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side actions */}
          {isHost && isLive && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={generateCameraToken}
            >
              <Camera className="h-4 w-4" />
              Add Camera
            </Button>
          )}
          
          {!isHost && !localStream && (
            <JoinAsCamera livestreamId={livestreamId} />
          )}
        </div>

        {/* Camera token display */}
        {cameraToken && (
          <div className="p-4">
            <Alert className="border-blue-500 bg-blue-500/10">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-500">Camera Join Token</AlertTitle>
              <AlertDescription className="text-blue-300">
                Share this token with additional camera operators: <span className="font-mono bg-blue-500/20 px-2 py-1 rounded">{cameraToken}</span>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stream Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Stream Content */}
        <div className="relative aspect-video bg-black">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
            />
          ) : localStream ? (
            <video
              ref={localVideoRef}
              className="w-full h-full object-contain mirror"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-yellow"></div>
                  <p className="text-gray-500">Accessing camera...</p>
                </div>
              ) : (
                <p className="text-gray-500">No video signal</p>
              )}
            </div>
          )}
        </div>

        {/* Stream Controls */}
        {(isHost || localStream) && (
          <LivestreamControls
            settings={settings}
            onUpdateSettings={updateSettings}
            devices={devices}
            isStreaming={isLive}
            onStartStream={handleStartStream}
            onStopStream={handleStopStream}
            isHost={isHost}
          />
        )}

        {/* Stream Info */}
        <div className="p-4 space-y-4">
          <div className="bg-darkbg-lighter rounded-lg p-4 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-2">About this stream</h2>
            {currentLivestream.description ? (
              <p className="text-gray-400">{currentLivestream.description}</p>
            ) : (
              <p className="text-gray-500 italic">No description available</p>
            )}
          </div>
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default LivestreamPage;
