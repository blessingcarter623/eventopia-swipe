
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Users, Calendar, DollarSign } from "lucide-react";

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
  ticket_type_name?: string;
  user_name?: string;
}

interface TicketSaleItemProps {
  ticket: TicketSale;
  updateCheckinStatus: (ticketId: string, checkedIn: boolean) => Promise<void>;
}

const TicketSaleItem = ({ ticket, updateCheckinStatus }: TicketSaleItemProps) => {
  return (
    <div className="bg-darkbg-lighter p-4 rounded-lg border border-gray-700">
      <div className="flex justify-between mb-1">
        <h4 className="font-semibold text-white">{ticket.ticket_type_name}</h4>
        <span className={`text-sm px-2 py-0.5 rounded-full ${
          ticket.checked_in ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'
        }`}>
          {ticket.checked_in ? (
            <><CheckCircle className="w-3 h-3 inline mr-1" /> Checked In</>
          ) : (
            <><Clock className="w-3 h-3 inline mr-1" /> Not Checked In</>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-2">
        <div className="text-xs text-gray-400">
          <Users className="w-3 h-3 inline mr-1" />
          {ticket.user_name}
        </div>
        <div className="text-xs text-gray-400">
          <Calendar className="w-3 h-3 inline mr-1" />
          {new Date(ticket.purchase_date).toLocaleDateString()}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-neon-yellow font-bold">
          <DollarSign className="w-4 h-4 inline" />
          R {ticket.price.toFixed(2)}
        </div>
        <Button
          size="sm"
          variant={ticket.checked_in ? "outline" : "default"}
          className={ticket.checked_in ? 
            "border-green-500 text-green-500 hover:bg-gray-700" : 
            "bg-green-500 text-black hover:bg-green-600"
          }
          onClick={() => updateCheckinStatus(ticket.id, !ticket.checked_in)}
        >
          {ticket.checked_in ? "Cancel Check-in" : "Check In"}
        </Button>
      </div>
    </div>
  );
};

export default TicketSaleItem;
