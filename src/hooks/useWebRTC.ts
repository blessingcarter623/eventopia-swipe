
import { useState, useEffect, useRef } from 'react';
import { WebRTCService } from '@/services/webrtcService';
import { StreamSettings } from '@/types/livestream';
import { useToast } from '@/hooks/use-toast';

export const useWebRTC = () => {
  const { toast } = useToast();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<{
    videoDevices: MediaDeviceInfo[];
    audioDevices: MediaDeviceInfo[];
  }>({ videoDevices: [], audioDevices: [] });
  
  const [settings, setSettings] = useState<StreamSettings>({
    video: true,
    audio: true,
    quality: 'medium',
    cameraId: null,
    microphoneId: null,
  });
  
  const webRTCServiceRef = useRef<WebRTCService | null>(null);

  // Initialize WebRTC service
  useEffect(() => {
    webRTCServiceRef.current = new WebRTCService();
    
    // Configure handlers
    if (webRTCServiceRef.current) {
      webRTCServiceRef.current.onStream((stream) => {
        setRemoteStream(stream);
        setIsConnected(true);
      });
      
      webRTCServiceRef.current.onDisconnect(() => {
        setIsConnected(false);
      });
      
      webRTCServiceRef.current.onError((err) => {
        setError(err.message);
        toast({
          title: "Stream Error",
          description: err.message,
          variant: "destructive"
        });
      });
    }
    
    // Get available devices
    const loadDevices = async () => {
      try {
        const availableDevices = await WebRTCService.getDevices();
        setDevices(availableDevices);
        
        // Set default devices if available
        if (availableDevices.videoDevices.length > 0) {
          setSettings(prev => ({
            ...prev,
            cameraId: availableDevices.videoDevices[0].deviceId
          }));
        }
        
        if (availableDevices.audioDevices.length > 0) {
          setSettings(prev => ({
            ...prev,
            microphoneId: availableDevices.audioDevices[0].deviceId
          }));
        }
      } catch (error) {
        console.error("Failed to load devices:", error);
        toast({
          title: "Device Error",
          description: "Could not access media devices",
          variant: "destructive"
        });
      }
    };
    
    loadDevices();
    
    // Cleanup
    return () => {
      if (webRTCServiceRef.current) {
        webRTCServiceRef.current.stopStreaming();
      }
    };
  }, [toast]);

  // Start local streaming
  const startLocalStream = async () => {
    if (!webRTCServiceRef.current) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: settings.video ? {
          deviceId: settings.cameraId ? { exact: settings.cameraId } : undefined,
          width: getResolutionForQuality(settings.quality).width,
          height: getResolutionForQuality(settings.quality).height
        } : false,
        audio: settings.audio ? {
          deviceId: settings.microphoneId ? { exact: settings.microphoneId } : undefined,
        } : false,
      };
      
      const stream = await webRTCServiceRef.current.startLocalStream(constraints);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Failed to start local stream:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera or microphone';
      setError(errorMessage);
      
      toast({
        title: "Stream Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Join a stream as camera
  const joinStreamAsCamera = async (joinToken: string) => {
    if (!webRTCServiceRef.current) {
      setError("WebRTC service not initialized");
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First start local stream
      const stream = await startLocalStream();
      if (!stream) {
        throw new Error("Failed to start local stream");
      }
      
      // Then join as camera
      const joined = await webRTCServiceRef.current.joinStreamAsCamera(joinToken);
      if (joined) {
        toast({
          title: "Connected",
          description: "Successfully joined livestream as camera",
        });
        return true;
      } else {
        throw new Error("Failed to join livestream");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join livestream';
      setError(errorMessage);
      
      toast({
        title: "Join Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update stream settings
  const updateSettings = (newSettings: Partial<StreamSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Helper function to get resolution based on quality setting
  const getResolutionForQuality = (quality: StreamSettings['quality']) => {
    switch (quality) {
      case 'low':
        return { width: 640, height: 480 };
      case 'medium':
        return { width: 1280, height: 720 };
      case 'high':
        return { width: 1920, height: 1080 };
      default:
        return { width: 1280, height: 720 };
    }
  };

  // Stop streaming
  const stopStreaming = () => {
    if (webRTCServiceRef.current) {
      webRTCServiceRef.current.stopStreaming();
      setLocalStream(null);
      setRemoteStream(null);
      setIsConnected(false);
    }
  };

  return {
    localStream,
    remoteStream,
    isConnected,
    isLoading,
    error,
    devices,
    settings,
    updateSettings,
    startLocalStream,
    joinStreamAsCamera,
    stopStreaming,
  };
};
