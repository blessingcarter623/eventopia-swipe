
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Event } from "@/types";
import { useTicketPurchase, TicketType } from "@/hooks/useTicketPurchase";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TicketPurchaseDialogProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export function TicketPurchaseDialog({ event, isOpen, onClose }: TicketPurchaseDialogProps) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const { purchaseTicket, isLoading } = useTicketPurchase();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && event) {
      fetchTicketTypes();
    }
  }, [isOpen, event]);

  const fetchTicketTypes = async () => {
    try {
      setIsLoadingTickets(true);
      console.log("Fetching ticket types for event:", event.id);
      
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', event.id)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;

      console.log("Ticket types fetched:", data);
      
      setTicketTypes(data || []);
      if (data && data.length > 0) {
        setSelectedTicketId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching ticket types:", error);
      toast({
        title: "Error",
        description: "Could not load ticket types. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedTicketId) return;
    
    const selectedTicket = ticketTypes.find(ticket => ticket.id === selectedTicketId);
    if (!selectedTicket) return;

    await purchaseTicket(
      selectedTicket,
      {
        id: event.id,
        title: event.title,
        organizer_id: event.organizer.id
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-darkbg border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Get Tickets</DialogTitle>
        </DialogHeader>

        {isLoadingTickets ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
          </div>
        ) : ticketTypes.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400">No tickets available for this event.</p>
          </div>
        ) : (
          <div className="py-4">
            <RadioGroup value={selectedTicketId || ""} onValueChange={setSelectedTicketId}>
              {ticketTypes.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between space-x-2 p-3 rounded-lg border border-gray-700 mb-3">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={ticket.id} id={ticket.id} className="border-gray-500" />
                    <div>
                      <Label htmlFor={ticket.id} className="text-white font-medium">
                        {ticket.name}
                      </Label>
                      {ticket.description && (
                        <p className="text-sm text-gray-400">{ticket.description}</p>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {ticket.sold} / {ticket.quantity} sold
                      </div>
                    </div>
                  </div>
                  <div className="text-neon-yellow font-bold">
                    {ticket.price === 0 ? "Free" : `R ${ticket.price.toFixed(2)}`}
                  </div>
                </div>
              ))}
            </RadioGroup>
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
            onClick={handlePurchase}
            disabled={isLoading || isLoadingTickets || ticketTypes.length === 0 || !selectedTicketId}
            className="bg-neon-yellow text-black font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {selectedTicketId && 
                  ticketTypes.find(t => t.id === selectedTicketId)?.price === 0 
                  ? "RSVP Now" 
                  : "Purchase Ticket"
                }
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
