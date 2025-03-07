
import { useState, useRef, useCallback } from "react";
import jsQR from "jsqr";
import { ScanResult } from "./types";
import { fetchTicketDetails, checkInTicket } from "./scannerService";
import { useToast } from "@/hooks/use-toast";

export const useQrScanner = (eventId?: string, onSuccess?: (ticketId: string, eventId: string) => void) => {
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startScanner = useCallback(async () => {
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
  }, []);

  const stopScanner = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }, []);

  const scanQrCode = useCallback(() => {
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
  }, [scanning]);

  const handleScannedData = useCallback(async (data: string) => {
    try {
      // Assume the QR data is just the ticket ID
      const ticketId = data.trim();
      
      // Process scan result
      const result = await fetchTicketDetails(ticketId, eventId);
      setScanResult(result);
      
      if (result.isValid && !result.isCheckedIn && onSuccess) {
        onSuccess(ticketId, result.eventId);
      }
      
      setShowResultDialog(true);
      setScanning(false);
    } catch (error) {
      console.error("Error handling scanned data:", error);
      setScanning(false);
    }
  }, [eventId, onSuccess]);

  const handleCheckIn = useCallback(async () => {
    if (!scanResult) return;
    
    try {
      setHasCheckedIn(true);
      
      await checkInTicket(scanResult.ticketId);
      
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
  }, [scanResult, onSuccess, toast]);

  const scanAnother = useCallback(() => {
    setShowResultDialog(false);
    startScanner();
  }, [startScanner]);

  return {
    scanning,
    cameraError,
    scanResult,
    showResultDialog,
    setShowResultDialog,
    hasCheckedIn,
    videoRef,
    canvasRef,
    startScanner,
    stopScanner,
    handleCheckIn,
    scanAnother
  };
};
