
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import QrCodeScanner from "@/components/organizer/tickets/QrCodeScanner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const EventScannerPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleScanSuccess = (ticketId: string, scannedEventId: string) => {
    toast({
      title: "Ticket scanned successfully",
      description: `Ticket ID: ${ticketId.substring(0, 8)}...`,
    });
  };
  
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
      
      <QrCodeScanner
        eventId={eventId}
        onSuccess={handleScanSuccess}
      />
    </div>
  );
};

export default EventScannerPage;
