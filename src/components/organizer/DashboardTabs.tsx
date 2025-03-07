
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, BarChart3, Ticket, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import EventsTab from "./EventsTab";
import FollowersTab from "./FollowersTab";
import AnalyticsTab from "./AnalyticsTab";
import TicketsTab from "./TicketsTab";
import WalletTab from "./WalletTab";
import DashboardLoading from "./DashboardLoading";
import { useToast } from "@/hooks/use-toast";

const DashboardTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "events");
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [followers, setFollowers] = useState([]);
  const { profile, user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (profile?.id) {
      fetchOrganizerData();
    } else if (user) {
      // If we have a user but no profile, something is wrong
      console.error("User authenticated but no profile found");
      toast({
        title: "Profile Error",
        description: "Your profile information could not be loaded",
        variant: "destructive"
      });
    }
  }, [profile, user]);
  
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  
  const fetchOrganizerData = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching events for organizer ID:", profile?.id);
      
      // Fetch events
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', profile?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log("Events fetched:", eventsData?.length || 0);
      setEvents(eventsData || []);
      
      // Fetch followers (mock data for now)
      setFollowers([]);
      
    } catch (error: any) {
      console.error("Error fetching organizer data:", error);
      toast({
        title: "Error loading data",
        description: error.message || "Could not load your events",
        variant: "destructive"
      });
      // Still clear loading state even if there's an error
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };
  
  if (!user) {
    return <div className="text-white p-4">Please log in to view your dashboard</div>;
  }
  
  if (!profile) {
    return <DashboardLoading />;
  }
  
  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-5 bg-darkbg border border-gray-700 rounded-lg p-1">
        <TabsTrigger
          value="events"
          className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md flex items-center justify-center gap-2"
        >
          <CalendarDays className="w-4 h-4" />
          <span className="hidden sm:inline">Events</span>
        </TabsTrigger>
        <TabsTrigger
          value="followers"
          className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Followers</span>
        </TabsTrigger>
        <TabsTrigger
          value="analytics"
          className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md flex items-center justify-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Analytics</span>
        </TabsTrigger>
        <TabsTrigger
          value="tickets"
          className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          <span className="hidden sm:inline">Tickets</span>
        </TabsTrigger>
        <TabsTrigger
          value="wallet"
          className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md flex items-center justify-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">Wallet</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="events" className="mt-6">
        <EventsTab 
          events={events} 
          isLoading={isLoading} 
          onRefresh={fetchOrganizerData} 
        />
      </TabsContent>
      
      <TabsContent value="followers" className="mt-6">
        <FollowersTab 
          followers={followers} 
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-6">
        <AnalyticsTab 
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="tickets" className="mt-6">
        <TicketsTab />
      </TabsContent>
      
      <TabsContent value="wallet" className="mt-6">
        <WalletTab 
          isLoading={isLoading}
          onRefresh={fetchOrganizerData}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
