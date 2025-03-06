
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWebRTC } from '@/hooks/useWebRTC';
import { LivestreamControls } from './LivestreamControls';

interface JoinAsCameraProps {
  livestreamId: string;
}

export const JoinAsCamera: React.FC<JoinAsCameraProps> = ({ livestreamId }) => {
  const [joinToken, setJoinToken] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  
  const {
    localStream,
    devices,
    settings,
    updateSettings,
    joinStreamAsCamera,
    stopStreaming,
    isLoading
  } = useWebRTC();
  
  const handleJoin = async () => {
    if (!joinToken.trim()) return;
    
    setIsJoining(true);
    try {
      const success = await joinStreamAsCamera(joinToken);
      if (success) {
        setHasJoined(true);
      }
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleClose = () => {
    if (hasJoined) {
      stopStreaming();
      setHasJoined(false);
    }
    setIsDialogOpen(false);
  };
  
  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Join as Camera</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] bg-darkbg border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Join Livestream as Camera</DialogTitle>
            <DialogDescription>
              Enter the camera join token provided by the livestream host.
            </DialogDescription>
          </DialogHeader>
          
          {!hasJoined ? (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="token" className="text-white col-span-4">
                    Join Token
                  </Label>
                  <Input 
                    id="token"
                    value={joinToken}
                    onChange={(e) => setJoinToken(e.target.value)}
                    placeholder="Enter join token"
                    className="col-span-4"
                    disabled={isJoining}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleJoin} disabled={isJoining || !joinToken.trim()}>
                  {isJoining ? "Connecting..." : "Join"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded overflow-hidden">
                {localStream ? (
                  <video
                    className="w-full h-full object-contain mirror"
                    autoPlay
                    playsInline
                    muted
                    ref={(videoRef) => {
                      if (videoRef && localStream) {
                        videoRef.srcObject = localStream;
                      }
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">Starting camera...</p>
                  </div>
                )}
              </div>
              
              <LivestreamControls
                settings={settings}
                onUpdateSettings={updateSettings}
                devices={devices}
                isStreaming={true}
                onStopStream={handleClose}
                isHost={false}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
