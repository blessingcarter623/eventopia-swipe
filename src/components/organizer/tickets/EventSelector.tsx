
import React from "react";
import { Link } from "react-router-dom";
import { TicketPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Event {
  id: string;
  title: string;
}

interface EventSelectorProps {
  events: Event[];
  selectedEvent: string | null;
  setSelectedEvent: (eventId: string) => void;
}

const EventSelector = ({ events, selectedEvent, setSelectedEvent }: EventSelectorProps) => {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedEvent || undefined}
        onValueChange={(value) => setSelectedEvent(value)}
      >
        <SelectTrigger className="w-[180px] bg-darkbg-lighter border-gray-700">
          <SelectValue placeholder="Select event" />
        </SelectTrigger>
        <SelectContent className="bg-darkbg-lighter border-gray-700">
          {events.map((event) => (
            <SelectItem key={event.id} value={event.id} className="text-white">
              {event.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedEvent && (
        <Link to={`/event/tickets/${selectedEvent}`}>
          <Button size="sm" className="h-10 bg-neon-yellow text-black hover:bg-neon-yellow/90">
            <TicketPlus className="mr-2 h-4 w-4" />
            Manage Tickets
          </Button>
        </Link>
      )}
    </div>
  );
};

export default EventSelector;
