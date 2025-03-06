
import React from "react";
import { Event } from "@/types";
import { MapPin, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EventListProps {
  events: Event[];
  onInvite: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onInvite }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white">No events found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.slice(0, 5).map(event => (
        <Card key={event.id} className="bg-darkbg-lighter border-gray-700 text-white overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              <div className="w-1/3 h-32">
                <img 
                  src={event.media.url || "/placeholder.svg"} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 w-2/3 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-md line-clamp-1">{event.title}</h3>
                  <div className="flex items-center mt-1 text-xs text-gray-300">
                    <MapPin size={12} className="mr-1" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <img 
                      src={event.organizer.avatar} 
                      alt={event.organizer.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="ml-1 text-xs truncate">{event.organizer.name}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-neon-yellow"
                    onClick={() => window.location.href = `/event/${event.id}`}
                  >
                    View Details
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={() => onInvite(event)}
                  >
                    <Share2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventList;
