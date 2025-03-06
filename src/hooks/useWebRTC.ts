
import { useState, useEffect, useRef } from 'react';
import { WebRTCService } from '@/services/webrtcService';
import { StreamSettings } from '@/types/livestream';

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
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
    }
    
    // Get available devices
    const loadDevices = async () => {
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
    };
    
    loadDevices();
    
    // Cleanup
    return () => {
      if (webRTCServiceRef.current) {
        webRTCServiceRef.current.stopStreaming();
      }
    };
  }, []);

  // Start local streaming
  const startLocalStream = async () => {
    if (!webRTCServiceRef.current) return null;
    
    try {
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
      return null;
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
    devices,
    settings,
    updateSettings,
    startLocalStream,
    stopStreaming,
  };
};
