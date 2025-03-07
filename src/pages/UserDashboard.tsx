
import React, { useState, useEffect } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, CalendarDays, Heart, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PurchasedTicket {
  id: string;
  eventId: string;
  userId: string;
  purchaseDate: string;
  status: string;
  qrCode?: string;
  price: number;
  currency: string;
  eventTitle?: string;
  eventImage?: string;
  eventDate?: string;
  eventTime?: string;
}

interface LikedEvent {
  id: string;
  title: string;
  description: string;
  media: {
    url: string;
    type: 'image' | 'video';
  };
  date: string;
  price: number | string;
}

interface Organizer {
  id: string;
  name: string;
  avatar: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  media: {
    url: string;
  };
  organizer: Organizer;
  date: string;
  price: number | string;
}

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
  const [likedEvents, setLikedEvents] = useState<LikedEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      fetchUserTickets();
      // In a full implementation, also fetch liked events and upcoming events
      // For now, we'll use empty arrays
      setLikedEvents([]);
      setUpcomingEvents([]);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  const fetchUserTickets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          price,
          status,
          purchase_date,
          qr_code,
          event_id,
          events(title, date, time, media_url)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        const formattedTickets: PurchasedTicket[] = data.map(ticket => ({
          id: ticket.id,
          eventId: ticket.event_id,
          userId: user.id,
          purchaseDate: ticket.purchase_date,
          status: ticket.status || 'active',
          qrCode: ticket.qr_code,
          price: ticket.price,
          currency: 'ZAR',
          eventTitle: ticket.events?.title,
          eventImage: ticket.events?.media_url,
          eventDate: ticket.events?.date,
          eventTime: ticket.events?.time,
        }));
        
        setPurchasedTickets(formattedTickets);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to load your tickets",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-darkbg-lighter">
          <Link to="/" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Your Dashboard</h1>
          <div className="w-6"></div> {/* Empty div for spacing */}
        </div>
        
        {/* User info */}
        <div className="bg-gradient-to-b from-darkbg-lighter to-darkbg p-4">
          {profile ? (
            <div className="flex items-center gap-4">
              <img 
                src={profile.avatar_url} 
                alt={profile.display_name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-neon-yellow"
              />
              <div>
                <h2 className="text-xl font-bold text-white">{profile.display_name}</h2>
                <p className="text-gray-400">@{profile.username}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse"></div>
              <div>
                <div className="h-6 w-32 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 bg-darkbg-lighter border-b border-white/10">
            <TabsTrigger 
              value="tickets" 
              className="data-[state=active]:text-neon-yellow data-[state=active]:border-b-2 data-[state=active]:border-neon-yellow rounded-none bg-transparent py-3"
            >
              <Ticket className="w-4 h-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger 
              value="liked" 
              className="data-[state=active]:text-neon-yellow data-[state=active]:border-b-2 data-[state=active]:border-neon-yellow rounded-none bg-transparent py-3"
            >
              <Heart className="w-4 h-4 mr-2" />
              Liked
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:text-neon-yellow data-[state=active]:border-b-2 data-[state=active]:border-neon-yellow rounded-none bg-transparent py-3"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Upcoming
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tickets" className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Your Tickets</h3>
            {isLoading ? (
              // Loading skeletons
              [...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse bg-darkbg-lighter p-4 rounded-xl">
                  <div className="flex gap-3">
                    <div className="w-24 h-24 bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 w-3/4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-gray-700 rounded mb-2"></div>
                      <div className="h-5 w-1/4 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : purchasedTickets.length > 0 ? (
              purchasedTickets.map(ticket => (
                <div key={ticket.id} className="bg-darkbg-lighter p-4 rounded-xl">
                  <div className="flex gap-3">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={ticket.eventImage || '/placeholder.svg'} alt={ticket.eventTitle} className="w-full h-full object-cover" />
                      <Badge className={`absolute top-2 right-2 ${
                        ticket.status === 'active' ? 'bg-green-500' : 
                        ticket.status === 'used' ? 'bg-gray-500' : 
                        ticket.status === 'expired' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{ticket.eventTitle}</h4>
                      {ticket.eventDate && (
                        <div className="flex items-center text-gray-400 text-sm mt-1">
                          <CalendarDays className="w-4 h-4 mr-1" />
                          {new Date(ticket.eventDate).toLocaleDateString()}
                        </div>
                      )}
                      {ticket.eventTime && (
                        <div className="flex items-center text-gray-400 text-sm mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {ticket.eventTime}
                        </div>
                      )}
                      <p className="text-neon-yellow font-bold mt-2">
                        R {ticket.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-6">You don't have any tickets yet</p>
            )}
          </TabsContent>
          
          <TabsContent value="liked" className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Events You Liked</h3>
            {isLoading ? (
              // Loading skeletons
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse relative rounded-xl overflow-hidden aspect-[3/4] bg-gray-700"></div>
                ))}
              </div>
            ) : likedEvents.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {likedEvents.map(event => (
                  <Link to={`/event/${event.id}`} key={event.id} className="block">
                    <div className="relative rounded-xl overflow-hidden aspect-[3/4]">
                      <img 
                        src={event.media.url} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                        <h4 className="text-white font-bold line-clamp-1">{event.title}</h4>
                        <p className="text-gray-200 text-sm mt-1">{new Date(event.date).toLocaleDateString()}</p>
                        <p className="text-neon-yellow font-bold mt-1">
                          {typeof event.price === 'number' ? `R ${event.price.toFixed(2)}` : event.price}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Heart className="w-5 h-5 text-neon-yellow fill-neon-yellow" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-6">You haven't liked any events yet</p>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Upcoming Events From People You Follow</h3>
            {isLoading ? (
              // Loading skeletons
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-darkbg-lighter rounded-xl p-3">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-5 w-3/4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 w-1/2 bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 w-2/3 bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 w-1/4 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <Link to={`/event/${event.id}`} key={event.id} className="block">
                    <div className="bg-darkbg-lighter rounded-xl p-3">
                      <div className="flex gap-3">
                        <img 
                          src={event.media.url} 
                          alt={event.title} 
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div>
                          <h4 className="text-white font-bold">{event.title}</h4>
                          <div className="flex items-center text-gray-400 text-sm mt-1">
                            <CalendarDays className="w-4 h-4 mr-1" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <p className="text-sm text-gray-400 mt-1 flex items-center">
                            <img src={event.organizer.avatar} alt={event.organizer.name} className="w-4 h-4 rounded-full mr-1" />
                            {event.organizer.name}
                          </p>
                          <p className="text-neon-yellow font-bold mt-1">
                            {typeof event.price === 'number' ? `R ${event.price.toFixed(2)}` : event.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-6">No upcoming events from people you follow</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default UserDashboard;
