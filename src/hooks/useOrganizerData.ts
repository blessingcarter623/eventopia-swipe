
import { useState, useEffect, useCallback } from "react";
import { Event, User } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mockUsers, mockEvents } from "@/data/index";

interface AnalyticsData {
  totalTicketsSold: number;
  totalRevenue: number;
  averageAttendance: number;
  popularEvents: {name: string; sales: number; percentage: number}[];
}

export const useOrganizerData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [organizer, setOrganizer] = useState<User | null>(null);
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalTicketsSold: 0,
    totalRevenue: 0,
    averageAttendance: 0,
    popularEvents: []
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

  return {
    isLoading,
    organizer,
    organizerEvents,
    followers,
    analyticsData,
    fetchEvents
  };
};
