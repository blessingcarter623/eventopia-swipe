
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ChevronLeft, PlusCircle, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface TicketType {
  id?: string;
  event_id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  max_per_purchase: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

interface Event {
  id: string;
  title: string;
}

const EventTicketsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  // New ticket form state
  const [newTicket, setNewTicket] = useState<Omit<TicketType, 'id'>>({
    event_id: eventId || '',
    name: '',
    description: '',
    price: 0,
    quantity: 100,
    max_per_purchase: 10,
    start_date: null,
    end_date: null,
    is_active: true
  });
  
  useEffect(() => {
    if (eventId && profile) {
      fetchEvent();
      fetchTicketTypes();
    }
  }, [eventId, profile]);
  
  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      
      setEvent(data);
      
    } catch (error: any) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Could not load event details",
        variant: "destructive",
      });
      navigate('/organizer/dashboard');
    }
  };
  
  const fetchTicketTypes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setTicketTypes(data || []);
      
    } catch (error: any) {
      console.error("Error fetching ticket types:", error);
      toast({
        title: "Error",
        description: "Could not load ticket types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveTicketTypes = async () => {
    if (!profile) {
      toast({
        title: "Authentication required",
        description: "Please log in to save ticket types",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // Process only tickets with changes
      for (const ticketType of ticketTypes) {
        if (ticketType.id) {
          // Update existing ticket type
          const { error } = await supabase
            .from('ticket_types')
            .update({
              name: ticketType.name,
              description: ticketType.description,
              price: ticketType.price,
              quantity: ticketType.quantity,
              max_per_purchase: ticketType.max_per_purchase,
              start_date: ticketType.start_date,
              end_date: ticketType.end_date,
              is_active: ticketType.is_active
            })
            .eq('id', ticketType.id);
          
          if (error) throw error;
        }
      }
      
      toast({
        title: "Success",
        description: "Ticket types have been saved",
      });
      
    } catch (error: any) {
      console.error("Error saving ticket types:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save ticket types",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const createTicketType = async () => {
    if (!profile) {
      toast({
        title: "Authentication required",
        description: "Please log in to create ticket types",
        variant: "destructive",
      });
      return;
    }
    
    if (!newTicket.name) {
      toast({
        title: "Missing information",
        description: "Please provide a name for the ticket type",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .insert({
          ...newTicket,
          event_id: eventId || ''
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "New ticket type has been created",
      });
      
      // Add new ticket type to the list
      if (data && data.length > 0) {
        setTicketTypes([data[0], ...ticketTypes]);
      }
      
      // Reset form and close dialog
      setNewTicket({
        event_id: eventId || '',
        name: '',
        description: '',
        price: 0,
        quantity: 100,
        max_per_purchase: 10,
        start_date: null,
        end_date: null,
        is_active: true
      });
      setNewTicketDialogOpen(false);
      
    } catch (error: any) {
      console.error("Error creating ticket type:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket type",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const deleteTicketType = async () => {
    if (!ticketToDelete) return;
    
    try {
      const { error } = await supabase
        .from('ticket_types')
        .delete()
        .eq('id', ticketToDelete);
      
      if (error) throw error;
      
      // Remove ticket type from the list
      setTicketTypes(ticketTypes.filter(t => t.id !== ticketToDelete));
      
      toast({
        title: "Success",
        description: "Ticket type has been deleted",
      });
      
    } catch (error: any) {
      console.error("Error deleting ticket type:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete ticket type",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setTicketToDelete(null);
    }
  };
  
  const handleTicketChange = (id: string | undefined, field: keyof TicketType, value: any) => {
    setTicketTypes(types => 
      types.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };
  
  const handleNewTicketChange = (field: keyof Omit<TicketType, 'id'>, value: any) => {
    setNewTicket(prev => ({ ...prev, [field]: value }));
  };
  
  const promptDeleteTicket = (id: string | undefined) => {
    if (!id) return;
    setTicketToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="p-4 flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full text-white"
            onClick={() => navigate('/organizer/dashboard')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">Manage Tickets</h1>
        </div>
        
        {/* Event info */}
        {event && (
          <div className="bg-darkbg-lighter p-4 border-y border-white/10">
            <h2 className="text-lg font-semibold text-white">{event.title}</h2>
            <p className="text-gray-400 text-sm">Configure ticket types for this event</p>
          </div>
        )}
        
        {/* Ticket Types */}
        <div className="p-4 space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">Ticket Types</h3>
            <Button
              size="sm"
              className="bg-neon-yellow text-black hover:bg-neon-yellow/80"
              onClick={() => setNewTicketDialogOpen(true)}
            >
              <PlusCircle className="w-4 h-4 mr-1" /> Add Ticket Type
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-yellow mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading ticket types...</p>
            </div>
          ) : (
            <>
              {ticketTypes.length > 0 ? (
                <div className="space-y-6">
                  {ticketTypes.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="bg-darkbg-lighter p-4 rounded-lg border border-white/10"
                    >
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`name-${ticket.id}`} className="text-white">Name</Label>
                            <Input 
                              id={`name-${ticket.id}`}
                              className="bg-darkbg border-gray-700 text-white"
                              value={ticket.name}
                              onChange={(e) => handleTicketChange(ticket.id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`price-${ticket.id}`} className="text-white">Price (R)</Label>
                            <Input 
                              id={`price-${ticket.id}`}
                              type="number"
                              className="bg-darkbg border-gray-700 text-white"
                              value={ticket.price}
                              onChange={(e) => handleTicketChange(ticket.id, 'price', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`description-${ticket.id}`} className="text-white">Description</Label>
                          <Textarea 
                            id={`description-${ticket.id}`}
                            className="bg-darkbg border-gray-700 text-white resize-none h-20"
                            value={ticket.description}
                            onChange={(e) => handleTicketChange(ticket.id, 'description', e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`quantity-${ticket.id}`} className="text-white">Quantity</Label>
                            <Input 
                              id={`quantity-${ticket.id}`}
                              type="number"
                              className="bg-darkbg border-gray-700 text-white"
                              value={ticket.quantity}
                              onChange={(e) => handleTicketChange(ticket.id, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`max-${ticket.id}`} className="text-white">Max per Purchase</Label>
                            <Input 
                              id={`max-${ticket.id}`}
                              type="number"
                              className="bg-darkbg border-gray-700 text-white"
                              value={ticket.max_per_purchase}
                              onChange={(e) => handleTicketChange(ticket.id, 'max_per_purchase', parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white">Start Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal bg-darkbg border-gray-700",
                                    !ticket.start_date && "text-gray-400"
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {ticket.start_date ? format(new Date(ticket.start_date), "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-darkbg-lighter border border-gray-700 text-white">
                                {/* Calendar component would go here */}
                                <div className="p-3">
                                  <p className="text-sm">Please select a date</p>
                                  <Button 
                                    className="w-full mt-2"
                                    onClick={() => handleTicketChange(ticket.id, 'start_date', new Date().toISOString())}
                                  >
                                    Set to Today
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">End Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal bg-darkbg border-gray-700",
                                    !ticket.end_date && "text-gray-400"
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {ticket.end_date ? format(new Date(ticket.end_date), "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-darkbg-lighter border border-gray-700 text-white">
                                {/* Calendar component would go here */}
                                <div className="p-3">
                                  <p className="text-sm">Please select a date</p>
                                  <Button 
                                    className="w-full mt-2"
                                    onClick={() => {
                                      const futureDate = new Date();
                                      futureDate.setMonth(futureDate.getMonth() + 1);
                                      handleTicketChange(ticket.id, 'end_date', futureDate.toISOString());
                                    }}
                                  >
                                    Set to +1 Month
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`active-${ticket.id}`}
                              checked={ticket.is_active}
                              onCheckedChange={(checked) => handleTicketChange(ticket.id, 'is_active', checked)}
                            />
                            <Label htmlFor={`active-${ticket.id}`} className="text-white">
                              {ticket.is_active ? 'Active' : 'Inactive'}
                            </Label>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-900/20"
                            onClick={() => promptDeleteTicket(ticket.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    className="w-full bg-neon-yellow hover:bg-neon-yellow/90 text-black"
                    onClick={saveTicketTypes}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 mb-4">No ticket types have been created yet</p>
                  <Button
                    className="bg-neon-yellow hover:bg-neon-yellow/90 text-black"
                    onClick={() => setNewTicketDialogOpen(true)}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Your First Ticket Type
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-darkbg-lighter border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Ticket Type</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this ticket type? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-700 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteTicketType}
            >
              Delete Ticket Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Ticket dialog */}
      <Dialog open={newTicketDialogOpen} onOpenChange={setNewTicketDialogOpen}>
        <DialogContent className="bg-darkbg-lighter border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Create New Ticket Type</DialogTitle>
            <DialogDescription className="text-gray-400">
              Define a new ticket type for your event
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-ticket-name" className="text-white">Name</Label>
                <Input 
                  id="new-ticket-name"
                  className="bg-darkbg border-gray-700 text-white"
                  value={newTicket.name}
                  onChange={(e) => handleNewTicketChange('name', e.target.value)}
                  placeholder="General Admission"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-ticket-price" className="text-white">Price (R)</Label>
                <Input 
                  id="new-ticket-price"
                  type="number"
                  className="bg-darkbg border-gray-700 text-white"
                  value={newTicket.price}
                  onChange={(e) => handleNewTicketChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-ticket-description" className="text-white">Description</Label>
              <Textarea 
                id="new-ticket-description"
                className="bg-darkbg border-gray-700 text-white resize-none h-20"
                value={newTicket.description}
                onChange={(e) => handleNewTicketChange('description', e.target.value)}
                placeholder="Standard entry ticket with access to all areas"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-ticket-quantity" className="text-white">Quantity</Label>
                <Input 
                  id="new-ticket-quantity"
                  type="number"
                  className="bg-darkbg border-gray-700 text-white"
                  value={newTicket.quantity}
                  onChange={(e) => handleNewTicketChange('quantity', parseInt(e.target.value) || 0)}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-ticket-max" className="text-white">Max per Purchase</Label>
                <Input 
                  id="new-ticket-max"
                  type="number"
                  className="bg-darkbg border-gray-700 text-white"
                  value={newTicket.max_per_purchase}
                  onChange={(e) => handleNewTicketChange('max_per_purchase', parseInt(e.target.value) || 1)}
                  placeholder="10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="new-ticket-active"
                checked={newTicket.is_active}
                onCheckedChange={(checked) => handleNewTicketChange('is_active', checked)}
              />
              <Label htmlFor="new-ticket-active" className="text-white">
                {newTicket.is_active ? 'Active' : 'Inactive'}
              </Label>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setNewTicketDialogOpen(false)}
              className="border-gray-700 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              className="bg-neon-yellow hover:bg-neon-yellow/90 text-black"
              onClick={createTicketType}
              disabled={isSaving}
            >
              {isSaving ? "Creating..." : "Create Ticket Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <NavigationBar />
    </div>
  );
};

export default EventTicketsPage;
