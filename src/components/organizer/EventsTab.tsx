
import React, { useState } from "react";
import { Calendar, PlusCircle, Pencil, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EventsTabProps {
  events: Event[];
  averageTicketsSold: number;
  isLoading: boolean;
  refreshEvents: () => void;
}

const EventsTab = ({ events, averageTicketsSold, isLoading, refreshEvents }: EventsTabProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleEditEvent = (eventId: string) => {
    navigate(`/event/edit/${eventId}`);
  };
  
  const openDeleteDialog = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };
  
  const deleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted",
      });
      refreshEvents();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Your Events</h3>
        <Link to="/create-event">
          <Button variant="outline" size="sm" className="border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        // Loading skeleton
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-darkbg-lighter p-4 rounded-xl">
              <div className="flex gap-3">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        events.length > 0 ? (
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
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-gray-400 hover:text-white"
                          onClick={() => handleEditEvent(event.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-gray-400 hover:text-red-500"
                          onClick={() => openDeleteDialog(event)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(event.date).toLocaleDateString()} • {event.time}
                    </div>
                    <div className="flex justify-between mt-2">
                      <p className="text-neon-yellow font-bold">
                        R {typeof event.price === 'number' ? event.price.toFixed(2) : event.price}
                      </p>
                      <div className="flex gap-2">
                        <Badge className="bg-neon-blue">{event.stats.views} views</Badge>
                        <Badge className="bg-neon-purple">{event.stats.likes} likes</Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-neon-yellow hover:text-neon-yellow/80 hover:bg-transparent p-0 h-auto mt-2"
                      onClick={() => navigate(`/event/manage/${event.id}`)}
                    >
                      Manage Tickets <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4">You haven't created any events yet</p>
            <Link to="/create-event">
              <Button className="bg-neon-yellow hover:bg-neon-yellow/90 text-black">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </div>
        )
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-darkbg-lighter border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="border-gray-700 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteEvent}
            >
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsTab;
