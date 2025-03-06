
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Camera, CameraOff, Settings, Gauge } from 'lucide-react';
import { StreamSettings } from '@/types/livestream';

interface LivestreamControlsProps {
  settings: StreamSettings;
  onUpdateSettings: (settings: Partial<StreamSettings>) => void;
  devices: {
    videoDevices: MediaDeviceInfo[];
    audioDevices: MediaDeviceInfo[];
  };
  isStreaming: boolean;
  onStartStream?: () => void;
  onStopStream?: () => void;
  isHost?: boolean;
}

export const LivestreamControls: React.FC<LivestreamControlsProps> = ({
  settings,
  onUpdateSettings,
  devices,
  isStreaming,
  onStartStream,
  onStopStream,
  isHost = false,
}) => {
  return (
    <div className="bg-darkbg-lighter border-t border-gray-800 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Video toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdateSettings({ video: !settings.video })}
            className={settings.video ? 'text-white' : 'text-gray-500'}
          >
            {settings.video ? <Camera /> : <CameraOff />}
          </Button>
          <Label>Camera</Label>
        </div>

        {/* Audio toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdateSettings({ audio: !settings.audio })}
            className={settings.audio ? 'text-white' : 'text-gray-500'}
          >
            {settings.audio ? <Mic /> : <MicOff />}
          </Button>
          <Label>Microphone</Label>
        </div>

        {/* Quality selector */}
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4" />
          <Select
            value={settings.quality}
            onValueChange={(value) => onUpdateSettings({ quality: value as StreamSettings['quality'] })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Camera selector */}
        {devices.videoDevices.length > 0 && (
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <Select
              value={settings.cameraId || undefined}
              onValueChange={(value) => onUpdateSettings({ cameraId: value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {devices.videoDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Microphone selector */}
        {devices.audioDevices.length > 0 && (
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <Select
              value={settings.microphoneId || undefined}
              onValueChange={(value) => onUpdateSettings({ microphoneId: value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {devices.audioDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stream control buttons */}
        {isHost && (
          <div className="ml-auto">
            {isStreaming ? (
              <Button
                variant="destructive"
                onClick={onStopStream}
              >
                Stop Stream
              </Button>
            ) : (
              <Button
                variant="default"
                className="bg-neon-yellow text-black hover:bg-neon-yellow/90"
                onClick={onStartStream}
              >
                Start Stream
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
