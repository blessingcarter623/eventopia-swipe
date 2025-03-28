
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
  sold: number;
  is_active: boolean;
}

export interface EventForTicket {
  id: string;
  title: string;
  organizer_id: string;
}

export const useTicketPurchase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const purchaseTicket = async (
    ticketType: TicketType,
    event: EventForTicket
  ) => {
    if (!user || !profile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to purchase tickets",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log("Starting ticket purchase process for:", {
        user: user.id,
        event: event.id,
        ticketType: ticketType.id,
        price: ticketType.price
      });
      
      // Check if ticket type is still available and not sold out
      const { data: latestTicketData, error: ticketCheckError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('id', ticketType.id)
        .eq('is_active', true)
        .single();
      
      if (ticketCheckError || !latestTicketData) {
        throw new Error("This ticket type is no longer available");
      }
      
      if (latestTicketData.sold >= latestTicketData.quantity) {
        throw new Error("This ticket type is sold out");
      }
      
      const callbackUrl = `${window.location.origin}/tickets`;
      
      const payload = {
        amount: ticketType.price,
        email: user.email,
        eventId: event.id,
        ticketTypeId: ticketType.id,
        userId: user.id,
        callbackUrl,
        metadata: {
          eventTitle: event.title,
          ticketType: ticketType.name,
          organizerId: event.organizer_id
        }
      };
      
      console.log("Sending payment request with payload:", payload);
      
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: payload
      });
      
      if (error) {
        console.error("Error invoking process-payment function:", error);
        throw error;
      }
      
      console.log("Payment process response:", data);
      
      if (data.success) {
        if (data.paymentUrl) {
          // For paid tickets, redirect to Paystack
          window.location.href = data.paymentUrl;
        } else if (data.redirectUrl) {
          // For free tickets, go directly to success page
          toast({
            title: "Ticket reserved!",
            description: "Your free ticket has been reserved successfully",
          });
          navigate(data.redirectUrl);
        }
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process ticket purchase",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyPayment = async (reference: string) => {
    try {
      setIsLoading(true);
      
      console.log("Verifying payment with reference:", reference);
      
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { reference }
      });
      
      if (error) {
        console.error("Error invoking verify-payment function:", error);
        throw error;
      }
      
      console.log("Payment verification response:", data);
      
      if (data.success) {
        toast({
          title: "Payment successful!",
          description: "Your ticket has been purchased successfully",
        });
        return true;
      } else {
        toast({
          title: "Payment not completed",
          description: data.message || "Your payment could not be verified",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify payment",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    purchaseTicket,
    verifyPayment,
    isLoading
  };
};
