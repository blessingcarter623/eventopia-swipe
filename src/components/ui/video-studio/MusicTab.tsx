
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Music, Play, Upload, Pause, Info } from "lucide-react";
import { SoundWave } from "@/components/ui/sound-wave";
import { toast } from "@/hooks/use-toast";

interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  duration: string;
  src: string;
}

interface MusicTabProps {
  volume: number[];
  handleVolumeChange: (newVolume: number[]) => void;
}

export const MusicTab = ({
  volume,
  handleVolumeChange
}: MusicTabProps) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  // Sample tracks (in a real app, fetch from an API or database)
  const tracks: MusicTrack[] = [
    { 
      id: "track1", 
      name: "Upbeat Electronic", 
      artist: "TikTok Music",
      duration: "2:45", 
      src: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_febc508520.mp3?filename=electronic-future-beats-117997.mp3" 
    },
    { 
      id: "track2", 
      name: "Festival Vibes", 
      artist: "Event Artist",
      duration: "3:12", 
      src: "https://cdn.pixabay.com/download/audio/2022/06/29/audio_9a40cd6fb3.mp3?filename=nightlife-electro-122074.mp3" 
    },
    { 
      id: "track3", 
      name: "Trending Sound #1", 
      artist: "Viral Creator",
      duration: "0:45", 
      src: "https://cdn.pixabay.com/download/audio/2022/08/27/audio_a4d0dc2012.mp3?filename=hip-hop-rock-beats-118000.mp3" 
    },
  ];

  const handlePlay = (track: MusicTrack) => {
    // Stop any currently playing audio
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
    }

    if (currentlyPlaying === track.id) {
      // If the same track was playing, stop it
      setCurrentlyPlaying(null);
      setAudioInstance(null);
    } else {
      // Play the new track
      const audio = new Audio(track.src);
      audio.volume = volume[0] / 100;
      audio.onended = () => {
        setCurrentlyPlaying(null);
        setAudioInstance(null);
      };
      audio.play().catch(error => {
        toast({
          title: "Playback Error",
          description: "Could not play the selected track",
          variant: "destructive",
        });
        console.error("Audio playback error:", error);
      });

      setCurrentlyPlaying(track.id);
      setAudioInstance(audio);
    }
  };

  const handleUploadClick = () => {
    toast({
      title: "Upload Music",
      description: "Custom music upload will be available soon!",
    });
  };

  // Update volume of current audio when slider changes
  React.useEffect(() => {
    if (audioInstance) {
      audioInstance.volume = volume[0] / 100;
    }
  }, [volume, audioInstance]);

  // Cleanup audio on unmount
  React.useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }
    };
  }, [audioInstance]);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white mb-2 block">Select Audio Track</Label>
        <div className="space-y-2">
          {tracks.map((track) => (
            <div key={track.id} className="bg-darkbg rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center flex-1">
                <Music className="w-5 h-5 text-neon-yellow mr-3" />
                <div className="flex-1">
                  <p className="text-white">{track.name}</p>
                  <div className="flex items-center">
                    <p className="text-xs text-gray-400">{track.artist} • {track.duration}</p>
                    {currentlyPlaying === track.id && (
                      <SoundWave isPlaying={true} className="ml-2" />
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10"
                onClick={() => handlePlay(track)}
              >
                {currentlyPlaying === track.id ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="text-white mb-2 block">Upload Custom Audio</Label>
        <Button 
          variant="outline" 
          className="w-full border-white/20 text-white"
          onClick={handleUploadClick}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Audio File
        </Button>
      </div>

      <div className="bg-darkbg rounded-lg p-3">
        <Label className="text-white mb-3 flex justify-between items-center">
          <span>Audio Volume</span>
          <span>{volume[0]}%</span>
        </Label>
        <Slider
          value={volume}
          min={0}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="mt-2"
        />
      </div>
      
      <div className="bg-darkbg/50 rounded-lg p-3 flex items-start">
        <Info className="w-4 h-4 text-white/70 mt-0.5 mr-2 shrink-0" />
        <p className="text-xs text-white/70">
          Music tracks are for preview purposes. When creating real events, 
          please ensure you have the rights to use the selected music.
        </p>
      </div>
    </div>
  );
};
