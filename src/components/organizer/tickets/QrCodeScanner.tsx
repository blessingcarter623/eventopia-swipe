
import React, { useState, useEffect, useRef } from "react";
import { Loader2, QrCode, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsQR from "jsqr"; // Import jsQR directly

interface QrCodeScannerProps {
  onSuccess?: (ticketId: string, eventId: string) => void;
  eventId?: string;
}

interface ScanResult {
  ticketId: string;
  eventId: string;
  ticketType: string;
  userName: string;
  isValid: boolean;
  message: string;
  isCheckedIn: boolean;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onSuccess, eventId }) => {
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  const startScanner = async () => {
    setCameraError(null);
    setScanning(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Start scanning frames
      requestAnimationFrame(scanQrCode);
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError("Could not access camera. Please check permissions.");
      setScanning(false);
    }
  };
  
  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    setScanResult(null);
    setHasCheckedIn(false);
  };
  
  const scanQrCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code) {
        console.log("QR code detected:", code.data);
        // Stop scanning when a valid code is found
        handleScannedData(code.data);
        return;
      }
    }
    
    // Continue scanning
    requestAnimationFrame(scanQrCode);
  };
  
  const handleScannedData = async (data: string) => {
    try {
      // Assume the QR data is just the ticket ID
      const ticketId = data.trim();
      
      // Fetch ticket details
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          id, 
          event_id, 
          ticket_type_id, 
          user_id, 
          checked_in,
          events(title),
          ticket_types(name),
          profiles:user_id(display_name)
        `)
        .eq('id', ticketId)
        .single();
      
      if (ticketError || !ticketData) {
        setScanResult({
          ticketId: ticketId,
          eventId: '',
          ticketType: '',
          userName: '',
          isValid: false,
          message: 'Invalid ticket. Ticket not found in database.',
          isCheckedIn: false
        });
      } else {
        // Check if the ticket is for the correct event (if eventId is provided)
        const isForCurrentEvent = !eventId || ticketData.event_id === eventId;
        
        if (!isForCurrentEvent) {
          setScanResult({
            ticketId: ticketId,
            eventId: ticketData.event_id,
            ticketType: ticketData.ticket_types?.name || 'Unknown',
            userName: ticketData.profiles?.display_name || 'Unknown',
            isValid: false,
            message: 'Ticket is for a different event.',
            isCheckedIn: ticketData.checked_in
          });
        } else {
          setScanResult({
            ticketId: ticketId,
            eventId: ticketData.event_id,
            ticketType: ticketData.ticket_types?.name || 'Unknown',
            userName: ticketData.profiles?.display_name || 'Unknown',
            isValid: true,
            message: ticketData.checked_in ? 'Ticket already checked in.' : 'Valid ticket.',
            isCheckedIn: ticketData.checked_in
          });
          
          if (onSuccess && !ticketData.checked_in) {
            onSuccess(ticketId, ticketData.event_id);
          }
        }
      }
      
      setShowResultDialog(true);
      setScanning(false);
    } catch (error) {
      console.error("Error processing QR code:", error);
      setScanResult({
        ticketId: '',
        eventId: '',
        ticketType: '',
        userName: '',
        isValid: false,
        message: 'Error processing QR code. Please try again.',
        isCheckedIn: false
      });
      setShowResultDialog(true);
    }
  };
  
  const handleCheckIn = async () => {
    if (!scanResult) return;
    
    try {
      setHasCheckedIn(true);
      
      const { error } = await supabase
        .from('tickets')
        .update({ 
          checked_in: true,
          checked_in_at: new Date().toISOString()
        })
        .eq('id', scanResult.ticketId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Ticket has been checked in successfully",
      });
      
      // Update the scan result
      setScanResult({
        ...scanResult,
        isCheckedIn: true,
        message: 'Ticket has been checked in successfully.'
      });
      
      if (onSuccess) {
        onSuccess(scanResult.ticketId, scanResult.eventId);
      }
      
    } catch (error: any) {
      console.error("Error checking in ticket:", error);
      toast({
        title: "Error",
        description: "Failed to check in ticket. Please try again.",
        variant: "destructive"
      });
      setHasCheckedIn(false);
    }
  };
  
  return (
    <div className="qr-scanner">
      <div className="flex flex-col items-center">
        {scanning ? (
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
              onClick={stopScanner}
            >
              Stop Scanning
            </Button>
          </div>
        ) : (
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
              onClick={startScanner}
            >
              Start QR Scanner
            </Button>
          </div>
        )}
      </div>
      
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="bg-darkbg border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Scan Result</DialogTitle>
          </DialogHeader>
          
          {scanResult && (
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
                  onClick={() => {
                    setShowResultDialog(false);
                    startScanner();
                  }}
                >
                  Scan Another
                </Button>
                
                {scanResult.isValid && !scanResult.isCheckedIn && (
                  <Button 
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleCheckIn}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QrCodeScanner;
