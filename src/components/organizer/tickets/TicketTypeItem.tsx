
import React from "react";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar } from "lucide-react";

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
  is_active: boolean;
  end_date?: string;
}

interface TicketTypeItemProps {
  type: TicketType;
  toggleTicketStatus: (typeId: string, active: boolean) => Promise<void>;
}

const TicketTypeItem = ({ type, toggleTicketStatus }: TicketTypeItemProps) => {
  return (
    <div className="bg-darkbg-lighter p-4 rounded-lg border border-gray-700">
      <div className="flex justify-between mb-1">
        <h4 className="font-semibold text-white">{type.name}</h4>
        <span className="text-neon-yellow font-bold">R {type.price.toFixed(2)}</span>
      </div>
      {type.description && (
        <p className="text-sm text-gray-400 mb-2">{type.description}</p>
      )}
      <div className="flex justify-between items-center">
        <div className="space-x-3">
          <span className="text-xs bg-gray-700 text-white px-2 py-1 rounded-full">
            <Ticket className="w-3 h-3 inline mr-1" />
            {type.sold} / {type.quantity}
          </span>
          
          {type.end_date && (
            <span className="text-xs bg-gray-700 text-white px-2 py-1 rounded-full">
              <Calendar className="w-3 h-3 inline mr-1" />
              {new Date(type.end_date).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <Button
          size="sm"
          variant={type.is_active ? "outline" : "default"}
          className={type.is_active ? 
            "border-green-500 text-green-500 hover:bg-green-500 hover:text-black" : 
            "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }
          onClick={() => toggleTicketStatus(type.id, !type.is_active)}
        >
          {type.is_active ? "Active" : "Inactive"}
        </Button>
      </div>
    </div>
  );
};

export default TicketTypeItem;
