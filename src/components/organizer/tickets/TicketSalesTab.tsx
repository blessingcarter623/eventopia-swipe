
import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Ticket } from "lucide-react";
import TicketSaleItem from "./TicketSaleItem";

interface TicketSale {
  id: string;
  event_id: string;
  ticket_type_id: string;
  user_id: string;
  purchase_date: string;
  status: string;
  price: number;
  checked_in: boolean;
  checked_in_at?: string;
  event_title?: string;
  ticket_type_name?: string;
  user_name?: string;
}

interface TicketSalesTabProps {
  isLoading: boolean;
  ticketSales: TicketSale[];
  updateCheckinStatus: (ticketId: string, checkedIn: boolean) => Promise<void>;
}

const TicketSalesTab = ({ 
  isLoading, 
  ticketSales, 
  updateCheckinStatus 
}: TicketSalesTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-darkbg-lighter p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (ticketSales.length === 0) {
    return (
      <div className="bg-darkbg-lighter p-6 rounded-lg border border-gray-700 text-center">
        <Ticket className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <h4 className="text-white font-semibold mb-2">No Tickets Sold</h4>
        <p className="text-gray-400">There are no ticket sales for this event yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-400">
          <span className="text-white font-bold">{ticketSales.length}</span> tickets sold
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <Filter className="w-3 h-3" /> Filter
        </Button>
      </div>
      
      <div className="space-y-3">
        {ticketSales.map((ticket) => (
          <TicketSaleItem 
            key={ticket.id} 
            ticket={ticket} 
            updateCheckinStatus={updateCheckinStatus} 
          />
        ))}
      </div>
    </>
  );
};

export default TicketSalesTab;
