
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Ticket, Search } from "lucide-react";
import TicketSaleItem from "./TicketSaleItem";
import { Input } from "@/components/ui/input";

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
  eventId?: string;
}

const TicketSalesTab = ({ 
  isLoading, 
  ticketSales, 
  updateCheckinStatus,
  eventId
}: TicketSalesTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterByCheckedIn, setFilterByCheckedIn] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter tickets based on search query and checked-in status
  const filteredTickets = ticketSales.filter(ticket => {
    // Filter by search query (ticket type name or user name)
    const matchesSearch = searchQuery === "" || 
      (ticket.ticket_type_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       ticket.user_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by checked in status
    const matchesCheckedIn = filterByCheckedIn === null || 
      ticket.checked_in === filterByCheckedIn;
    
    return matchesSearch && matchesCheckedIn;
  });

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
          <span className="text-white font-bold">{filteredTickets.length}</span> tickets sold
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3 h-3" /> Filter
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-darkbg-lighter p-3 rounded-lg border border-gray-700 mb-3 space-y-2">
          <div className="flex items-center relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-2" />
            <Input
              placeholder="Search by ticket type or purchaser"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-darkbg border-gray-600"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={filterByCheckedIn === null ? "default" : "outline"}
              className={filterByCheckedIn === null ? "bg-neon-yellow text-black" : ""}
              onClick={() => setFilterByCheckedIn(null)}
            >
              All
            </Button>
            <Button 
              size="sm" 
              variant={filterByCheckedIn === true ? "default" : "outline"}
              className={filterByCheckedIn === true ? "bg-green-500 text-black" : ""}
              onClick={() => setFilterByCheckedIn(true)}
            >
              Checked In
            </Button>
            <Button 
              size="sm" 
              variant={filterByCheckedIn === false ? "default" : "outline"}
              className={filterByCheckedIn === false ? "bg-blue-500 text-black" : ""}
              onClick={() => setFilterByCheckedIn(false)}
            >
              Not Checked In
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketSaleItem 
              key={ticket.id} 
              ticket={ticket} 
              updateCheckinStatus={updateCheckinStatus} 
            />
          ))
        ) : (
          <div className="bg-darkbg-lighter p-4 rounded-lg border border-gray-700 text-center">
            <p className="text-gray-400">No tickets match your filters</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TicketSalesTab;
