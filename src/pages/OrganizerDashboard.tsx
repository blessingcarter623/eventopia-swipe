
import React, { useState, useEffect, useCallback } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import DashboardHeader from "@/components/organizer/DashboardHeader";
import OrganizerProfile from "@/components/organizer/OrganizerProfile";
import DashboardTabs from "@/components/organizer/DashboardTabs";
import { Event, User } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mockUsers, mockEvents } from "@/data/index"; // Fallback for development only

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [isLoading, setIsLoading] = useState(true);
  const [organizer, setOrganizer] = useState<User | null>(null);
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const { profile, user } = useAuth();
  const { toast } = useToast();
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    totalTicketsSold: 0,
    totalRevenue: 0,
    averageAttendance: 0,
    popularEvents: [] as {name: string; sales: number; percentage: number}[]
  });
  
  // Fetch events from Supabase
  const fetchEvents = useCallback(async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', profile.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform data to match Event type
        const transformedEvents: Event[] = data.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description || '',
          media: {
            type: event.media_type as 'image' | 'video',
            url: event.media_url || 'https://placehold.co/600x400?text=Event',
          },
          location: event.location || 'TBA',
          date: event.date || new Date().toISOString(),
          time: event.time || '19:00',
          price: event.price || 'Free',
          category: event.category || 'Other',
          organizer: {
            id: profile.id,
            name: profile.display_name || 'Organizer',
            avatar: profile.avatar_url || 'https://placehold.co/100?text=User',
            isVerified: profile.is_verified || false,
          },
          stats: {
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
          },
          tags: event.tags || [],
        }));
        
        setOrganizerEvents(transformedEvents);
      } else {
        // Use mock data for development purposes
        // In production, you would handle empty states differently
        setOrganizerEvents([]);
      }
      
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch events",
        variant: "destructive",
      });
      // Fallback to mock data for development
      const filteredEvents = mockEvents.filter(event => event.organizer.id === profile.id);
      setOrganizerEvents(filteredEvents);
    } finally {
      setIsLoading(false);
    }
  }, [profile, toast]);
  
  // Fetch analytics data from Supabase
  const fetchAnalyticsData = useCallback(async () => {
    if (!profile) return;
    
    try {
      // Get all ticket sales for events by this organizer
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          *,
          events!inner(title, organizer_id)
        `)
        .eq('events.organizer_id', profile.id);
      
      if (ticketError) throw ticketError;
      
      if (ticketData && ticketData.length > 0) {
        // Calculate total tickets sold and revenue
        const totalTicketsSold = ticketData.length;
        const totalRevenue = ticketData.reduce((sum, ticket) => sum + parseFloat(String(ticket.price)), 0);
        
        // Calculate average attendance (checked in tickets / total tickets)
        const checkedInCount = ticketData.filter(ticket => ticket.checked_in).length;
        const averageAttendance = totalTicketsSold > 0 
          ? Math.round((checkedInCount / totalTicketsSold) * 100) 
          : 0;
        
        // Calculate popular events
        const eventSales: Record<string, {name: string; sales: number}> = {};
        
        ticketData.forEach(ticket => {
          const eventId = ticket.event_id;
          const eventTitle = ticket.events.title;
          
          if (!eventSales[eventId]) {
            eventSales[eventId] = { name: eventTitle, sales: 0 };
          }
          
          eventSales[eventId].sales += 1;
        });
        
        // Convert to array and sort by sales
        const popularEventsArray = Object.values(eventSales)
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 3);
        
        // Calculate percentages
        const maxSales = Math.max(...popularEventsArray.map(e => e.sales));
        const popularEventsWithPercentage = popularEventsArray.map(event => ({
          name: event.name,
          sales: event.sales,
          percentage: maxSales > 0 ? Math.round((event.sales / maxSales) * 100) : 0
        }));
        
        setAnalyticsData({
          totalTicketsSold,
          totalRevenue,
          averageAttendance,
          popularEvents: popularEventsWithPercentage
        });
      } else {
        // If no real data, set default analytics
        setAnalyticsData({
          totalTicketsSold: 0,
          totalRevenue: 0,
          averageAttendance: 0,
          popularEvents: []
        });
      }
      
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      // For development purposes, use mock data
      setAnalyticsData({
        totalTicketsSold: 0,
        totalRevenue: 0,
        averageAttendance: 0,
        popularEvents: []
      });
    }
  }, [profile]);
  
  // Initial data loading
  useEffect(() => {
    if (profile) {
      // Set organizer from profile
      setOrganizer({
        id: profile.id,
        username: profile.username || 'user',
        displayName: profile.display_name || 'User',
        avatar: profile.avatar_url || 'https://placehold.co/100?text=User',
        bio: profile.bio || '',
        followers: profile.followers || 0,
        following: profile.following || 0,
        posts: profile.posts || 0,
        isVerified: profile.is_verified || false,
        role: profile.role as 'user' | 'organizer',
      });
      
      // Load events and analytics
      fetchEvents();
      fetchAnalyticsData();
      
      // For development, use mock followers
      setFollowers(mockUsers.slice(2, 5));
    }
  }, [profile, fetchEvents, fetchAnalyticsData]);
  
  // Add real-time listener for tickets and events
  useEffect(() => {
    if (!profile) return;
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        () => {
          // Refresh analytics whenever ticket data changes
          fetchAnalyticsData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'events'
        },
        () => {
          // Refresh events when event data changes
          fetchEvents();
        }
      )
      .subscribe();   

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, fetchEvents, fetchAnalyticsData]);
  
  if (!profile || !organizer) {
    return (
      <div className="app-height bg-darkbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-yellow"></div>
      </div>
    );
  }
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <DashboardHeader />
        
        {/* Organizer info */}
        <OrganizerProfile 
          organizer={organizer} 
          eventsCount={organizerEvents.length} 
        />
        
        {/* Dashboard Tabs */}
        <DashboardTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          organizerEvents={organizerEvents}
          followers={followers}
          analyticsData={analyticsData}
          isLoading={isLoading}
          refreshEvents={fetchEvents}
        />
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default OrganizerDashboard;
