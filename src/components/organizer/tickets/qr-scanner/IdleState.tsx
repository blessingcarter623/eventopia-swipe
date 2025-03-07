
import React from "react";
import { QrCode, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IdleStateProps {
  cameraError: string | null;
  onStartScanner: () => void;
}

const IdleState: React.FC<IdleStateProps> = ({ cameraError, onStartScanner }) => {
  return (
    <div className="text-center">
      {cameraError ? (
        <div className="text-red-500 mb-4 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 mb-2" />
          <p>{cameraError}</p>
        </div>
      ) : (
        <div className="bg-darkbg-lighter p-8 rounded-lg mb-4 flex flex-col items-center">
          <QrCode className="w-20 h-20 text-neon-yellow mb-4" />
          <p className="text-white text-lg">Scan ticket QR codes</p>
          <p className="text-gray-400 text-sm mt-1">Tap the button below to start scanning</p>
        </div>
      )}
      
      <Button 
        className="bg-neon-yellow text-black hover:bg-neon-yellow/90"
        onClick={onStartScanner}
      >
        Start QR Scanner
      </Button>
    </div>
  );
};

export default IdleState;
