
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import EventSelector from "./tickets/EventSelector";
import TicketTypesTab from "./tickets/TicketTypesTab";
import TicketSalesTab from "./tickets/TicketSalesTab";

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
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl === "tickets" ? "types" : "types");
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

  useEffect(() => {
    if (!selectedEvent) return;
    
    const channel = supabase
      .channel('ticket-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `event_id=eq.${selectedEvent}`
        },
        () => {
          console.log('Tickets table updated, refreshing sales data');
          fetchTicketSales();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
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
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', selectedEvent);
      
      if (ticketsError) throw ticketsError;
      
      if (ticketsData && ticketsData.length > 0) {
        const { data: typesData, error: typesError } = await supabase
          .from('ticket_types')
          .select('id, name')
          .in('id', ticketsData.map(ticket => ticket.ticket_type_id));
          
        if (typesError) throw typesError;
        
        const typeMap = {};
        typesData?.forEach(type => {
          typeMap[type.id] = type.name;
        });
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', ticketsData.map(ticket => ticket.user_id));
          
        if (profilesError) throw profilesError;
        
        const profileMap = {};
        profilesData?.forEach(profile => {
          profileMap[profile.id] = profile.display_name;
        });
        
        const formattedSales: TicketSale[] = ticketsData.map(ticket => ({
          id: ticket.id,
          event_id: ticket.event_id,
          ticket_type_id: ticket.ticket_type_id,
          user_id: ticket.user_id,
          purchase_date: ticket.purchase_date || new Date().toISOString(),
          status: ticket.status || 'active',
          price: ticket.price,
          checked_in: ticket.checked_in || false,
          checked_in_at: ticket.checked_in_at,
          ticket_type_name: typeMap[ticket.ticket_type_id] || 'Unknown',
          user_name: profileMap[ticket.user_id] || 'Unknown User'
        }));
        
        setTicketSales(formattedSales);
      } else {
        setTicketSales([]);
      }
      
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
        <div className="flex items-center gap-2">
          <EventSelector 
            events={events} 
            selectedEvent={selectedEvent} 
            setSelectedEvent={setSelectedEvent} 
          />
        </div>
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
          <TicketTypesTab 
            isLoading={isLoading}
            ticketTypes={ticketTypes}
            selectedEvent={selectedEvent}
            toggleTicketStatus={toggleTicketStatus}
          />
        </TabsContent>
        
        <TabsContent value="sales" className="mt-4">
          <TicketSalesTab 
            isLoading={isLoading}
            ticketSales={ticketSales}
            updateCheckinStatus={updateCheckinStatus}
            eventId={selectedEvent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketsTab;
