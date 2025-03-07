
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, CalendarDays, MapPin, Clock, Edit, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export interface EventsTabProps {
  events: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

const EventsTab: React.FC<EventsTabProps> = ({ events, isLoading, onRefresh }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    setIsDeleting(eventId);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      });
      
      // Refresh the events list
      onRefresh();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 text-neon-yellow animate-spin" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Your Events</h3>
        <Link to="/create-event">
          <Button className="bg-neon-yellow text-black hover:bg-neon-yellow/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>
      
      {events.length === 0 ? (
        <div className="bg-darkbg-lighter border border-gray-700 rounded-lg p-8 text-center">
          <CalendarDays className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Events Yet</h3>
          <p className="text-gray-400 mb-4">Create your first event to attract attendees.</p>
          <Link to="/create-event">
            <Button className="bg-neon-yellow text-black hover:bg-neon-yellow/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="bg-darkbg-lighter border-gray-700">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-32 h-24 rounded-md overflow-hidden">
                    <img 
                      src={event.thumbnail_url || "/placeholder.svg"} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-medium">{event.title}</h4>
                      
                      <div>
                        {new Date(event.date) > new Date() ? (
                          <Badge className="bg-green-600">Upcoming</Badge>
                        ) : (
                          <Badge className="bg-gray-600">Past</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-400 mt-2 space-y-1">
                      {event.date && (
                        <div className="flex items-center">
                          <CalendarDays className="w-4 h-4 mr-2" />
                          {new Date(event.date).toLocaleDateString()}
                          {event.time && <span className="ml-1">at {event.time}</span>}
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link to={`/edit-event/${event.id}`}>
                        <Button size="sm" variant="outline" className="h-8 border-gray-700">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      
                      <Link to={`/event/scanner/${event.id}`}>
                        <Button size="sm" variant="outline" className="h-8 border-gray-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Scanner
                        </Button>
                      </Link>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled={isDeleting === event.id}
                        onClick={() => handleDeleteEvent(event.id)}
                        className="h-8 border-gray-700 hover:bg-red-800 hover:text-white hover:border-red-800"
                      >
                        {isDeleting === event.id ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Trash className="w-3 h-3 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsTab;
