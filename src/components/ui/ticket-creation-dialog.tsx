
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Event {
  id: string;
  title: string;
}

interface TicketCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TicketCreationDialog({ isOpen, onClose }: TicketCreationDialogProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "0",
    quantity: "50",
    eventId: "",
    isActive: true,
    endDate: null as Date | null,
  });

  useEffect(() => {
    if (isOpen && profile) {
      fetchEvents();
    }
  }, [isOpen, profile]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('organizer_id', profile?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setEvents(data || []);
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, eventId: data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Could not load your events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Missing information",
          description: "Please provide a name for the ticket",
          variant: "destructive",
        });
        return;
      }

      if (!formData.eventId) {
        toast({
          title: "Missing information",
          description: "Please select an event for this ticket",
          variant: "destructive",
        });
        return;
      }

      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity < 1) {
        toast({
          title: "Invalid quantity",
          description: "Please provide a valid quantity (minimum 1)",
          variant: "destructive",
        });
        return;
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        toast({
          title: "Invalid price",
          description: "Please provide a valid price (minimum 0)",
          variant: "destructive",
        });
        return;
      }

      setIsCreating(true);

      const { data, error } = await supabase
        .from('ticket_types')
        .insert({
          name: formData.name,
          description: formData.description || null,
          price: price,
          quantity: quantity,
          event_id: formData.eventId,
          is_active: formData.isActive,
          end_date: formData.endDate?.toISOString() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Ticket has been created successfully",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "0",
        quantity: "50",
        eventId: events[0]?.id || "",
        isActive: true,
        endDate: null,
      });

      onClose();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-darkbg border-gray-700 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Ticket</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400">You need to create an event first before creating tickets.</p>
            <Button 
              onClick={onClose} 
              className="mt-4 bg-neon-yellow text-black"
              asChild
            >
              <a href="/create-event">Create an Event</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="event">Select Event</Label>
              <Select
                value={formData.eventId}
                onValueChange={(value) => setFormData({ ...formData, eventId: value })}
              >
                <SelectTrigger className="bg-darkbg-lighter border-gray-700 text-white">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent className="bg-darkbg-lighter border-gray-700 text-white">
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Ticket Name</Label>
              <Input
                id="name"
                className="bg-darkbg-lighter border-gray-700 text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. General Admission, VIP, Early Bird"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                className="bg-darkbg-lighter border-gray-700 text-white resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what's included with this ticket"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (R)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="bg-darkbg-lighter border-gray-700 text-white"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  className="bg-darkbg-lighter border-gray-700 text-white"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-darkbg-lighter border-gray-700 text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-darkbg-lighter border-gray-700">
                  <Calendar
                    mode="single"
                    selected={formData.endDate || undefined}
                    onSelect={(date) => setFormData({ ...formData, endDate: date })}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="bg-darkbg"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="active">Active (available for purchase)</Label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="border border-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || events.length === 0}
            className="bg-neon-yellow text-black font-semibold"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Ticket"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
