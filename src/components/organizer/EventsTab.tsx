
import React from "react";
import { Calendar, PlusCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types";

interface EventsTabProps {
  events: Event[];
  averageTicketsSold: number;
}

const EventsTab = ({ events, averageTicketsSold }: EventsTabProps) => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Your Events</h3>
        <Button variant="outline" size="sm" className="border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black">
          <PlusCircle className="w-4 h-4 mr-2" />
          New
        </Button>
      </div>
      
      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="bg-darkbg-lighter p-4 rounded-xl">
              <div className="flex gap-3">
                <img 
                  src={event.media.url} 
                  alt={event.title} 
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-white font-bold">{event.title}</h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-neon-yellow font-bold">
                      R {typeof event.price === 'number' ? event.price.toFixed(2) : event.price}
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-neon-blue">{event.stats.views} views</Badge>
                      <Badge className="bg-neon-purple">{averageTicketsSold} tickets</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">You haven't created any events yet</p>
          <Button className="bg-neon-yellow hover:bg-neon-yellow/90 text-black">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Your First Event
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventsTab;
