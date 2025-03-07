
import React, { useRef } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScannerViewProps {
  isScanning: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onStopScanner: () => void;
}

const ScannerView: React.FC<ScannerViewProps> = ({ 
  isScanning, 
  videoRef, 
  canvasRef, 
  onStopScanner 
}) => {
  return (
    <div className="relative w-full max-w-sm">
      <div className="aspect-square relative overflow-hidden rounded-lg bg-black">
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover" 
          playsInline
        />
        <div className="absolute inset-0 border-2 border-neon-yellow/80 rounded-lg"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 border-2 border-neon-yellow rounded-lg flex items-center justify-center">
            <QrCode className="w-12 h-12 text-neon-yellow/30" />
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <Button 
        className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white"
        onClick={onStopScanner}
      >
        Stop Scanning
      </Button>
    </div>
  );
};

export default ScannerView;
