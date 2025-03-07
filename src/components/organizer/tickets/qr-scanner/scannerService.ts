
import { supabase } from "@/integrations/supabase/client";
import { ScanResult } from "./types";

export const fetchTicketDetails = async (ticketId: string, eventId?: string): Promise<ScanResult> => {
  try {
    // Fetch ticket details
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        id, 
        event_id, 
        ticket_type_id, 
        user_id, 
        checked_in,
        events(title),
        ticket_types(name)
      `)
      .eq('id', ticketId)
      .single();
    
    if (ticketError || !ticketData) {
      return {
        ticketId: ticketId,
        eventId: '',
        ticketType: '',
        userName: '',
        isValid: false,
        message: 'Invalid ticket. Ticket not found in database.',
        isCheckedIn: false
      };
    } 
    
    // Now fetch the profile data separately
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', ticketData.user_id)
      .single();
      
    const userName = profileError ? 'Unknown User' : (profileData?.display_name || 'Unknown User');
      
    // Check if the ticket is for the correct event (if eventId is provided)
    const isForCurrentEvent = !eventId || ticketData.event_id === eventId;
    
    if (!isForCurrentEvent) {
      return {
        ticketId: ticketId,
        eventId: ticketData.event_id,
        ticketType: ticketData.ticket_types?.name || 'Unknown',
        userName: userName,
        isValid: false,
        message: 'Ticket is for a different event.',
        isCheckedIn: ticketData.checked_in
      };
    } else {
      return {
        ticketId: ticketId,
        eventId: ticketData.event_id,
        ticketType: ticketData.ticket_types?.name || 'Unknown',
        userName: userName,
        isValid: true,
        message: ticketData.checked_in ? 'Ticket already checked in.' : 'Valid ticket.',
        isCheckedIn: ticketData.checked_in
      };
    }
  } catch (error) {
    console.error("Error processing QR code:", error);
    return {
      ticketId: '',
      eventId: '',
      ticketType: '',
      userName: '',
      isValid: false,
      message: 'Error processing QR code. Please try again.',
      isCheckedIn: false
    };
  }
};

export const checkInTicket = async (ticketId: string) => {
  const { error } = await supabase
    .from('tickets')
    .update({ 
      checked_in: true,
      checked_in_at: new Date().toISOString()
    })
    .eq('id', ticketId);
  
  if (error) throw error;
  return true;
};
