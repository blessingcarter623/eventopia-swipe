
import React from "react";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScanResult } from "./types";

interface ScanResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanResult: ScanResult | null;
  hasCheckedIn: boolean;
  onCheckIn: () => void;
  onScanAnother: () => void;
}

const ScanResultDialog: React.FC<ScanResultDialogProps> = ({
  open,
  onOpenChange,
  scanResult,
  hasCheckedIn,
  onCheckIn,
  onScanAnother,
}) => {
  if (!scanResult) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-darkbg border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Scan Result</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col items-center mb-6">
            {scanResult.isValid ? (
              <div className={`p-3 rounded-full ${scanResult.isCheckedIn ? "bg-gray-600/30" : "bg-green-600/30"} mb-4`}>
                {scanResult.isCheckedIn ? (
                  <CheckCircle className="w-10 h-10 text-gray-400" />
                ) : (
                  <CheckCircle className="w-10 h-10 text-green-500" />
                )}
              </div>
            ) : (
              <div className="p-3 rounded-full bg-red-600/30 mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            )}
            
            <h3 className={`text-lg font-bold ${
              scanResult.isValid 
                ? scanResult.isCheckedIn ? "text-gray-300" : "text-green-500" 
                : "text-red-500"
            }`}>
              {scanResult.isValid 
                ? scanResult.isCheckedIn ? "Already Checked In" : "Valid Ticket" 
                : "Invalid Ticket"}
            </h3>
            <p className="text-gray-400 text-sm mt-1">{scanResult.message}</p>
          </div>
          
          {scanResult.isValid && (
            <div className="space-y-3 bg-darkbg-lighter p-4 rounded-lg mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Attendee:</span>
                <span className="text-white font-medium">{scanResult.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ticket Type:</span>
                <span className="text-white font-medium">{scanResult.ticketType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ticket ID:</span>
                <span className="text-white font-medium">{scanResult.ticketId.substring(0, 8)}</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
              onClick={onScanAnother}
            >
              Scan Another
            </Button>
            
            {scanResult.isValid && !scanResult.isCheckedIn && (
              <Button 
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={onCheckIn}
                disabled={hasCheckedIn}
              >
                {hasCheckedIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Check In"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScanResultDialog;
