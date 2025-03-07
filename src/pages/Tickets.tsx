
import React, { useState, useEffect } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Ticket, Calendar, MapPin, ArrowRight, QrCode, Loader2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useTicketPurchase } from "@/hooks/useTicketPurchase";
import { useToast } from "@/hooks/use-toast";

interface TicketData {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketType: string;
  ticketPrice: number;
  purchaseDate: string;
  status: string;
  checked_in: boolean;
  qr_code?: string;
}

const Tickets = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const { verifyPayment } = useTicketPurchase();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      fetchTickets();
    } else {
      setIsLoading(false);
      setTickets([]);
    }
  }, [user]);
  
  // Check for payment reference in URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const reference = query.get('reference');
    
    if (reference) {
      handlePaymentVerification(reference);
      
      // Remove the query parameter from the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location]);
  
  const handlePaymentVerification = async (reference: string) => {
    const success = await verifyPayment(reference);
    if (success) {
      await fetchTickets();
    }
  };
  
  const fetchTickets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch tickets with event and ticket type information
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          price,
          status,
          checked_in,
          purchase_date,
          qr_code,
          event_id,
          ticket_type_id,
          events(title, location, date, time, media_url, media_type),
          ticket_types(name)
        `)
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Transform the data to our ticket format
        const transformedTickets: TicketData[] = data.map(ticket => ({
          id: ticket.id,
          eventId: ticket.event_id,
          eventTitle: ticket.events.title,
          eventImage: ticket.events.media_url || '/placeholder.svg',
          eventDate: ticket.events.date,
          eventTime: ticket.events.time || '19:00',
          eventLocation: ticket.events.location || 'TBA',
          ticketType: ticket.ticket_types?.name || 'General Admission',
          ticketPrice: ticket.price,
          purchaseDate: ticket.purchase_date,
          status: ticket.status,
          checked_in: ticket.checked_in,
          qr_code: ticket.qr_code
        }));
        
        setTickets(transformedTickets);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to load your tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const upcomingTickets = tickets.filter(ticket => 
    new Date(ticket.eventDate) >= new Date() && ticket.status === 'active'
  );
  
  const pastTickets = tickets.filter(ticket => 
    new Date(ticket.eventDate) < new Date() || ticket.status !== 'active'
  );
  
  if (!user) {
    return (
      <div className="app-height bg-darkbg flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-none pb-16 flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to view your tickets</p>
            <Link to="/login">
              <Button className="bg-neon-yellow text-black hover:bg-neon-yellow/90">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        <NavigationBar />
      </div>
    );
  }
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-4">My Tickets</h1>
          
          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
            <button 
              className={`flex-1 py-3 text-center font-medium smooth-transition ${activeTab === "upcoming" ? "bg-neon-yellow text-black" : "bg-darkbg-lighter text-gray-300"}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
            <button 
              className={`flex-1 py-3 text-center font-medium smooth-transition ${activeTab === "past" ? "bg-neon-yellow text-black" : "bg-darkbg-lighter text-gray-300"}`}
              onClick={() => setActiveTab("past")}
            >
              Past
            </button>
          </div>
        </div>
        
        {/* Tickets List */}
        <div className="px-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
              <span className="ml-2 text-white">Loading tickets...</span>
            </div>
          ) : activeTab === "upcoming" ? (
            upcomingTickets.length > 0 ? (
              upcomingTickets.map(ticket => (
                <div key={ticket.id} className="glass-card rounded-xl overflow-hidden">
                  <div className="relative h-40">
                    <img 
                      src={ticket.eventImage} 
                      alt={ticket.eventTitle} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{ticket.eventTitle}</h3>
                      <div className="flex items-center text-gray-300 text-sm mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(ticket.eventDate).toLocaleDateString()} • {ticket.eventTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center text-gray-300 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{ticket.eventLocation}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{ticket.ticketType}</div>
                        <div className="text-neon-yellow font-bold">
                          {ticket.ticketPrice === 0 ? "Free" : `$${ticket.ticketPrice.toFixed(2)}`}
                        </div>
                      </div>
                      
                      <Link 
                        to={`/ticket/${ticket.id}`}
                        className="bg-neon-yellow text-black px-4 py-2 rounded-lg font-medium flex items-center"
                      >
                        View Ticket <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-darkbg-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">You don't have any upcoming tickets.</p>
                <p className="text-gray-500 text-sm mt-1">Browse events to find something exciting!</p>
                <Link 
                  to="/discover"
                  className="bg-neon-yellow text-black px-4 py-2 rounded-lg font-medium inline-block mt-4"
                >
                  Discover Events
                </Link>
              </div>
            )
          ) : (
            // Past tickets
            pastTickets.length > 0 ? (
              pastTickets.map(ticket => (
                <div key={ticket.id} className="glass-card rounded-xl overflow-hidden opacity-70">
                  <div className="relative h-40">
                    <img 
                      src={ticket.eventImage} 
                      alt={ticket.eventTitle} 
                      className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{ticket.eventTitle}</h3>
                      <div className="flex items-center text-gray-300 text-sm mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(ticket.eventDate).toLocaleDateString()} • {ticket.eventTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center text-gray-300 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{ticket.eventLocation}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{ticket.ticketType}</div>
                        <div className="text-gray-400">
                          {ticket.ticketPrice === 0 ? "Free" : `$${ticket.ticketPrice.toFixed(2)}`}
                        </div>
                      </div>
                      
                      <div className="bg-gray-600 text-white px-3 py-1 rounded-lg text-sm">
                        {ticket.checked_in ? "Checked In" : "Expired"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-darkbg-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">You don't have any past tickets.</p>
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Tickets;
