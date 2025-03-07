
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import QrCodeScanner from "@/components/organizer/tickets/QrCodeScanner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useOrganizerData } from "@/hooks/useOrganizerData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OrganizerScannerPage = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const { organizerEvents, isLoading } = useOrganizerData();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleScanSuccess = (ticketId: string, eventId: string) => {
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
      
      {!selectedEventId && (
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Select an event to scan tickets for:
          </label>
          <Select
            value={selectedEventId}
            onValueChange={setSelectedEventId}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full bg-darkbg-lighter border-gray-700">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent className="bg-darkbg-lighter border-gray-700">
              {organizerEvents.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {selectedEventId && (
        <QrCodeScanner
          eventId={selectedEventId}
          onSuccess={handleScanSuccess}
        />
      )}
    </div>
  );
};

export default OrganizerScannerPage;
