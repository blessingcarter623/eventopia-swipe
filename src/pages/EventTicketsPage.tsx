
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Ticket } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sold: number;
  event_id: string;
  max_per_purchase: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

interface Event {
  id: string;
  title: string;
  organizer_id: string;
}

export default function EventTicketsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // New ticket form state
  const [ticketName, setTicketName] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPrice, setTicketPrice] = useState("0");
  const [ticketQuantity, setTicketQuantity] = useState("100");
  const [maxPerPurchase, setMaxPerPurchase] = useState("10");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    fetchEventDetails();
    fetchTickets();
  }, [eventId]);
  
  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, organizer_id")
        .eq("id", eventId)
        .single();
        
      if (error) throw error;
      
      setEvent(data);
      
    } catch (error: any) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      });
    }
  };
  
  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("ticket_types")
        .select("*")
        .eq("event_id", eventId)
        .order("price", { ascending: true });
        
      if (error) throw error;
      
      setTickets(data || []);
      
    } catch (error: any) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to load ticket types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateTicket = async () => {
    if (!ticketName || !ticketQuantity) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setFormSubmitting(true);
      
      // Convert string inputs to appropriate types
      const price = parseFloat(ticketPrice) || 0;
      const quantity = parseInt(ticketQuantity) || 100;
      const maxPer = parseInt(maxPerPurchase) || 10;
      
      const newTicket = {
        name: ticketName,
        description: ticketDescription,
        price,
        quantity,
        sold: 0,
        event_id: eventId,
        max_per_purchase: maxPer,
        start_date: startDate ? startDate.toISOString() : null,
        end_date: endDate ? endDate.toISOString() : null,
        is_active: isActive
      };
      
      const { data, error } = await supabase
        .from("ticket_types")
        .insert(newTicket)
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Ticket type created successfully",
      });
      
      // Reset form
      setTicketName("");
      setTicketDescription("");
      setTicketPrice("0");
      setTicketQuantity("100");
      setMaxPerPurchase("10");
      setStartDate(new Date());
      setEndDate(undefined);
      setIsActive(true);
      setShowCreateForm(false);
      
      // Refresh ticket list
      fetchTickets();
      
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive",
      });
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const toggleTicketStatus = async (ticketId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("ticket_types")
        .update({ is_active: !currentStatus })
        .eq("id", ticketId);
        
      if (error) throw error;
      
      // Update local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, is_active: !currentStatus } 
          : ticket
      ));
      
      toast({
        title: "Status Updated",
        description: `Ticket is now ${!currentStatus ? "active" : "inactive"}`,
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
  
  const deleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket type?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("ticket_types")
        .delete()
        .eq("id", ticketId);
        
      if (error) throw error;
      
      // Update local state
      setTickets(tickets.filter(ticket => ticket.id !== ticketId));
      
      toast({
        title: "Success",
        description: "Ticket type deleted successfully",
      });
      
    } catch (error: any) {
      console.error("Error deleting ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete ticket",
        variant: "destructive",
      });
    }
  };
  
  // Check if user is the event organizer
  const isOrganizer = event && profile && event.organizer_id === profile.id;
  
  if (!isOrganizer && !isLoading) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-xl font-bold mb-4">Access Denied</h2>
        <p className="mb-4">You don't have permission to view this page.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">{event ? `Ticket Management for: ${event.title}` : "Loading..."}</h1>
      
      {!showCreateForm ? (
        <div className="mb-6">
          <Button onClick={() => setShowCreateForm(true)} className="bg-neon-yellow text-black hover:bg-neon-yellow/90">
            Create New Ticket Type
          </Button>
        </div>
      ) : (
        <Card className="mb-8 border-gray-700 bg-darkbg-lighter">
          <CardHeader>
            <CardTitle>Create New Ticket Type</CardTitle>
            <CardDescription>Set up a new ticket type for your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticketName">Ticket Name *</Label>
                <Input 
                  id="ticketName" 
                  value={ticketName} 
                  onChange={(e) => setTicketName(e.target.value)}
                  placeholder="Early Bird, VIP, Standard, etc."
                  className="bg-darkbg border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ticketPrice">Price *</Label>
                <Input 
                  id="ticketPrice" 
                  type="number"
                  value={ticketPrice} 
                  onChange={(e) => setTicketPrice(e.target.value)}
                  placeholder="0 for free tickets"
                  min="0"
                  className="bg-darkbg border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ticketQuantity">Quantity Available *</Label>
                <Input 
                  id="ticketQuantity" 
                  type="number"
                  value={ticketQuantity} 
                  onChange={(e) => setTicketQuantity(e.target.value)}
                  placeholder="Number of tickets available"
                  min="1"
                  className="bg-darkbg border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxPerPurchase">Max Per Purchase</Label>
                <Input 
                  id="maxPerPurchase" 
                  type="number"
                  value={maxPerPurchase} 
                  onChange={(e) => setMaxPerPurchase(e.target.value)}
                  placeholder="Maximum tickets per purchase"
                  min="1"
                  className="bg-darkbg border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Sale Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-darkbg border-gray-700",
                        !startDate && "text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-darkbg-lighter border-gray-700">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="bg-darkbg-lighter text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Sale End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-darkbg border-gray-700",
                        !endDate && "text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-darkbg-lighter border-gray-700">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="bg-darkbg-lighter text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ticketDescription">Description (Optional)</Label>
              <Textarea 
                id="ticketDescription" 
                value={ticketDescription} 
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Describe what this ticket includes"
                className="bg-darkbg border-gray-700"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                checked={isActive} 
                onCheckedChange={setIsActive} 
                id="ticket-active" 
              />
              <Label htmlFor="ticket-active">Active (available for purchase)</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateForm(false)}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTicket} 
              disabled={formSubmitting}
              className="bg-neon-yellow text-black hover:bg-neon-yellow/90"
            >
              {formSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Ticket"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className={`border ${ticket.is_active ? 'border-green-600/30' : 'border-gray-700'} bg-darkbg-lighter`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{ticket.name}</CardTitle>
                  <div className="text-xl font-bold text-neon-yellow">
                    {ticket.price === 0 ? "Free" : `R ${ticket.price.toFixed(2)}`}
                  </div>
                </div>
                <CardDescription>
                  {ticket.sold} / {ticket.quantity} sold
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ticket.description && (
                  <p className="text-sm text-gray-400 mb-4">{ticket.description}</p>
                )}
                <div className="text-xs space-y-1 text-gray-400">
                  {ticket.start_date && (
                    <div>Sale starts: {new Date(ticket.start_date).toLocaleDateString()}</div>
                  )}
                  {ticket.end_date && (
                    <div>Sale ends: {new Date(ticket.end_date).toLocaleDateString()}</div>
                  )}
                  <div>Max per purchase: {ticket.max_per_purchase || "Unlimited"}</div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="destructive" 
                  onClick={() => deleteTicket(ticket.id)}
                  className="bg-transparent border border-red-700 text-red-500 hover:bg-red-900/20"
                >
                  Delete
                </Button>
                <Button 
                  variant={ticket.is_active ? "outline" : "default"}
                  onClick={() => toggleTicketStatus(ticket.id, ticket.is_active)}
                  className={
                    ticket.is_active
                      ? "border-green-600 text-green-500 hover:bg-green-900/20"
                      : "bg-green-700 text-white hover:bg-green-600"
                  }
                >
                  {ticket.is_active ? "Active" : "Inactive"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-darkbg-lighter rounded-lg border border-gray-700">
          <Ticket className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">No Ticket Types</h3>
          <p className="text-gray-400 mb-4">Create ticket types to start selling tickets for your event</p>
        </div>
      )}
      
      <div className="mt-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="border-gray-700"
        >
          Back to Event
        </Button>
      </div>
    </div>
  );
}
