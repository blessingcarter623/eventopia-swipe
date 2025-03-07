
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle, Clock, DollarSign, Filter, Ticket, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Event {
  id: string;
  title: string;
}

const TicketsTab = () => {
  const [activeTab, setActiveTab] = useState("types");
  const [isLoading, setIsLoading] = useState(true);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [ticketSales, setTicketSales] = useState<TicketSale[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (profile) {
      fetchEvents();
    }
  }, [profile]);
  
  useEffect(() => {
    if (selectedEvent) {
      fetchTicketTypes();
      fetchTicketSales();
    }
  }, [selectedEvent]);
  
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('organizer_id', profile?.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setEvents(data);
        setSelectedEvent(data[0].id);
      } else {
        setEvents([]);
        setSelectedEvent(null);
        setIsLoading(false);
      }
      
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch events",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const fetchTicketTypes = async () => {
    if (!selectedEvent) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', selectedEvent);
      
      if (error) throw error;
      
      setTicketTypes(data || []);
      
    } catch (error: any) {
      console.error("Error fetching ticket types:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch ticket types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTicketSales = async () => {
    if (!selectedEvent) return;
    
    setIsLoading(true);
    try {
      // Join query to get ticket details with user and ticket type info
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          events!inner(title),
          ticket_types!inner(name)
        `)
        .eq('event_id', selectedEvent);
      
      if (error) throw error;
      
      // Transform the data to include the joined fields
      const formattedData = data?.map(ticket => ({
        ...ticket,
        event_title: ticket.events.title,
        ticket_type_name: ticket.ticket_types.name,
        user_name: "User", // In a real app, you would join with profiles table
      })) || [];
      
      setTicketSales(formattedData);
      
    } catch (error: any) {
      console.error("Error fetching ticket sales:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch ticket sales",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCheckinStatus = async (ticketId: string, checkedIn: boolean) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          checked_in: checkedIn,
          checked_in_at: checkedIn ? new Date().toISOString() : null
        })
        .eq('id', ticketId);
      
      if (error) throw error;
      
      // Update the local state
      setTicketSales(tickets => 
        tickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, checked_in: checkedIn, checked_in_at: checkedIn ? new Date().toISOString() : undefined } 
            : ticket
        )
      );
      
      toast({
        title: checkedIn ? "Ticket checked in" : "Check-in cancelled",
        description: checkedIn ? "Attendee has been checked in successfully" : "Attendee check-in has been cancelled",
      });
      
    } catch (error: any) {
      console.error("Error updating ticket status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };
  
  const toggleTicketStatus = async (typeId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('ticket_types')
        .update({ is_active: active })
        .eq('id', typeId);
      
      if (error) throw error;
      
      // Update the local state
      setTicketTypes(types => 
        types.map(type => 
          type.id === typeId ? { ...type, is_active: active } : type
        )
      );
      
      toast({
        title: active ? "Ticket type activated" : "Ticket type deactivated",
        description: `The ticket type is now ${active ? "available" : "unavailable"} for purchase`,
      });
      
    } catch (error: any) {
      console.error("Error updating ticket type:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket type",
        variant: "destructive",
      });
    }
  };
  
  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Please log in to manage tickets</p>
      </div>
    );
  }
  
  if (events.length === 0 && !isLoading) {
    return (
      <div className="p-6 text-center">
        <Ticket className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Events Yet</h3>
        <p className="text-gray-400 mb-4">You need to create an event before you can manage tickets</p>
        <Link to="/create-event">
          <Button className="bg-neon-yellow text-black hover:bg-neon-yellow/90">
            Create an Event
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Ticket Management</h3>
        
        {events.length > 0 && (
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
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 bg-darkbg-lighter border border-gray-700 rounded-lg p-1">
          <TabsTrigger 
            value="types" 
            className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md"
          >
            Ticket Types
          </TabsTrigger>
          <TabsTrigger 
            value="sales" 
            className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md"
          >
            Ticket Sales
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="types" className="mt-4">
          {isLoading ? (
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
          ) : (
            <>
              {ticketTypes.length > 0 ? (
                <div className="space-y-4">
                  {ticketTypes.map((type) => (
                    <div key={type.id} className="bg-darkbg-lighter p-4 rounded-lg border border-gray-700">
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
                  ))}
                  
                  <Link to={`/event/tickets/${selectedEvent}`}>
                    <Button variant="outline" className="w-full mt-2 border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black">
                      Manage Ticket Types
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-darkbg-lighter p-6 rounded-lg border border-gray-700 text-center">
                  <Ticket className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <h4 className="text-white font-semibold mb-2">No Ticket Types</h4>
                  <p className="text-gray-400 mb-4">Create ticket types for your event to start selling</p>
                  <Link to={`/event/tickets/${selectedEvent}`}>
                    <Button className="bg-neon-yellow text-black hover:bg-neon-yellow/90">
                      Create Ticket Types
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="sales" className="mt-4">
          {isLoading ? (
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
          ) : (
            <>
              {ticketSales.length > 0 ? (
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
                      <div key={ticket.id} className="bg-darkbg-lighter p-4 rounded-lg border border-gray-700">
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
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-darkbg-lighter p-6 rounded-lg border border-gray-700 text-center">
                  <Ticket className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <h4 className="text-white font-semibold mb-2">No Tickets Sold</h4>
                  <p className="text-gray-400">There are no ticket sales for this event yet</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketsTab;
