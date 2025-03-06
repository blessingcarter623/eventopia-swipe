
import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useLivestreams } from '@/hooks/useLivestreams';
import { useAuth } from '@/context/AuthContext';
import { LivestreamControls } from '@/components/livestream/LivestreamControls';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Users } from 'lucide-react';

const LivestreamPage = () => {
  const { livestreamId } = useParams<{ livestreamId: string }>();
  const { profile } = useAuth();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const {
    localStream,
    remoteStream,
    isConnected,
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
  } = useLivestreams();
  
  const currentLivestream = livestreams.find(stream => stream.id === livestreamId);
  const isHost = currentLivestream?.host_id === profile?.id;
  const isLive = currentLivestream?.status === 'live';
  
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
    
    await startLocalStream();
    await startLivestream(livestreamId);
  };
  
  const handleStopStream = async () => {
    if (!livestreamId) return;
    
    stopStreaming();
    await endLivestream(livestreamId);
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
        </div>

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
              <p className="text-gray-500">No video signal</p>
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
