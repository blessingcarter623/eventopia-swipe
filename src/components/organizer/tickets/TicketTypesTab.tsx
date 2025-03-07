
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket } from "lucide-react";
import TicketTypeItem from "./TicketTypeItem";

interface TicketType {
  id: string;
  name: string;
  event_id: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
  max_per_purchase?: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

interface TicketTypesTabProps {
  isLoading: boolean;
  ticketTypes: TicketType[];
  selectedEvent: string | null;
  toggleTicketStatus: (typeId: string, active: boolean) => Promise<void>;
}

const TicketTypesTab = ({ 
  isLoading, 
  ticketTypes, 
  selectedEvent,
  toggleTicketStatus 
}: TicketTypesTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-darkbg-lighter p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-3" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (ticketTypes.length === 0) {
    return (
      <div className="bg-darkbg-lighter p-6 rounded-lg border border-gray-700 text-center">
        <Ticket className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <h4 className="text-white font-semibold mb-2">No Ticket Types</h4>
        <p className="text-gray-400 mb-4">Create ticket types for your event to start selling</p>
        {selectedEvent && (
          <Link to={`/event/tickets/${selectedEvent}`}>
            <Button className="bg-neon-yellow text-black hover:bg-neon-yellow/90">
              Create Ticket Types
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ticketTypes.map((type) => (
        <TicketTypeItem 
          key={type.id} 
          type={type} 
          toggleTicketStatus={toggleTicketStatus} 
        />
      ))}
      
      {selectedEvent && (
        <Link to={`/event/tickets/${selectedEvent}`}>
          <Button variant="outline" className="w-full mt-2 border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black">
            Manage Ticket Types
          </Button>
        </Link>
      )}
    </div>
  );
};

export default TicketTypesTab;
