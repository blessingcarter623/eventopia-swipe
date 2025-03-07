
import React, { useEffect, useState } from "react";
import { PlusCircle, TicketPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const DashboardActions = () => {
  const [firstEventId, setFirstEventId] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      fetchFirstEvent();
    }
  }, [profile]);

  const fetchFirstEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', profile?.id)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
        console.error("Error fetching first event:", error);
        return;
      }
      
      if (data) {
        setFirstEventId(data.id);
      }
    } catch (error) {
      console.error("Error in fetchFirstEvent:", error);
    }
  };

  return (
    <div className="px-4 py-2 flex justify-end gap-2">
      <Link to="/create-event">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </Link>
      
      <Link to={firstEventId ? `/event/tickets/${firstEventId}` : "/organizer/dashboard?tab=tickets"}>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black"
        >
          <TicketPlus className="w-4 h-4 mr-2" />
          Create Tickets
        </Button>
      </Link>
    </div>
  );
};

export default DashboardActions;
