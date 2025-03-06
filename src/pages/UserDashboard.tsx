
import React, { useState } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockEvents, mockUsers } from "@/data/index";
import { Ticket, CalendarDays, Heart, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const user = mockUsers[2]; // Using a mock user
  
  // Mock data - in a real app, these would come from your backend
  const purchasedTickets = [
    {
      id: "ticket1",
      eventId: "1",
      userId: user.id,
      purchaseDate: "2023-11-10",
      status: "active",
      qrCode: "qr-code-data-1",
      price: 850,
      currency: "ZAR",
    },
    {
      id: "ticket2",
      eventId: "4",
      userId: user.id,
      purchaseDate: "2023-10-25",
      status: "used",
      qrCode: "qr-code-data-2",
      price: 1200,
      currency: "ZAR",
    },
  ];
  
  const savedEvents = ["2", "5"];
  const followedOrganizers = ["1", "4"];
  
  // Filter events based on the saved IDs and followed organizers
  const likedEvents = mockEvents.filter(event => savedEvents.includes(event.id));
  const upcomingEvents = mockEvents.filter(event => 
    followedOrganizers.includes(event.organizer.id) && 
    new Date(event.date) > new Date()
  );
  
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
          <div className="flex items-center gap-4">
            <img 
              src={user.avatar} 
              alt={user.displayName} 
              className="w-16 h-16 rounded-full object-cover border-2 border-neon-yellow"
            />
            <div>
              <h2 className="text-xl font-bold text-white">{user.displayName}</h2>
              <p className="text-gray-400">@{user.username}</p>
            </div>
          </div>
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
            {purchasedTickets.length > 0 ? (
              purchasedTickets.map(ticket => {
                const event = mockEvents.find(e => e.id === ticket.eventId);
                if (!event) return null;
                
                return (
                  <div key={ticket.id} className="bg-darkbg-lighter p-4 rounded-xl">
                    <div className="flex gap-3">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={event.media.url} alt={event.title} className="w-full h-full object-cover" />
                        <Badge className={`absolute top-2 right-2 ${
                          ticket.status === 'active' ? 'bg-green-500' : 
                          ticket.status === 'used' ? 'bg-gray-500' : 
                          ticket.status === 'expired' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{event.title}</h4>
                        <div className="flex items-center text-gray-400 text-sm mt-1">
                          <CalendarDays className="w-4 h-4 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-400 text-sm mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {event.time}
                        </div>
                        <p className="text-neon-yellow font-bold mt-2">
                          R {ticket.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center py-6">You don't have any tickets yet</p>
            )}
          </TabsContent>
          
          <TabsContent value="liked" className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Events You Liked</h3>
            {likedEvents.length > 0 ? (
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
                          R {typeof event.price === 'number' ? event.price.toFixed(2) : event.price}
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
            {upcomingEvents.length > 0 ? (
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
                            R {typeof event.price === 'number' ? event.price.toFixed(2) : event.price}
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
