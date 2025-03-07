
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import QrCodeScanner from "@/components/organizer/tickets/QrCodeScanner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const EventScannerPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated after loading completes
    if (!loading) {
      setIsInitialized(true);
      if (!user) {
        navigate('/login');
      }
    }
  }, [loading, user, navigate]);
  
  const handleScanSuccess = (ticketId: string, scannedEventId: string) => {
    toast({
      title: "Ticket scanned successfully",
      description: `Ticket ID: ${ticketId.substring(0, 8)}...`,
    });
  };
  
  if (loading || !isInitialized) {
    return (
      <div className="app-height bg-darkbg flex flex-col items-center justify-center p-4">
        <div className="text-white">Loading scanner...</div>
      </div>
    );
  }
  
  return (
    <div className="app-height bg-darkbg flex flex-col p-4">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          className="p-2 mr-2" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </Button>
        <h1 className="text-xl font-bold text-white">Ticket Scanner</h1>
      </div>
      
      {eventId ? (
        <QrCodeScanner
          eventId={eventId}
          onSuccess={handleScanSuccess}
        />
      ) : (
        <div className="text-center text-red-500 mt-4">
          No event ID provided. Please go back and try again.
        </div>
      )}
    </div>
  );
};

export default EventScannerPage;
