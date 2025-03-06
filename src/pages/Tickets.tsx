
import React, { useState } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { mockEvents } from "@/data/mockData";
import { Ticket, Calendar, MapPin, ArrowRight, QrCode } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for tickets
const mockTickets = mockEvents.slice(0, 3).map(event => ({
  id: `ticket-${event.id}`,
  eventId: event.id,
  eventTitle: event.title,
  eventImage: event.media.url,
  eventDate: event.date,
  eventTime: event.time,
  eventLocation: event.location,
  ticketType: "General Admission",
  ticketPrice: typeof event.price === 'number' ? event.price : 0,
  purchaseDate: "2023-10-30T14:23:00Z",
  status: "active",
}));

const Tickets = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  
  const upcomingTickets = mockTickets.filter(ticket => new Date(ticket.eventDate) >= new Date());
  const pastTickets = mockTickets.filter(ticket => new Date(ticket.eventDate) < new Date());
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-4">My Tickets</h1>
          
          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
            <button 
              className={`flex-1 py-3 text-center font-medium smooth-transition ${activeTab === "upcoming" ? "bg-neon-yellow text-black" : "bg-darkbg-lighter text-gray-300"}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
            <button 
              className={`flex-1 py-3 text-center font-medium smooth-transition ${activeTab === "past" ? "bg-neon-yellow text-black" : "bg-darkbg-lighter text-gray-300"}`}
              onClick={() => setActiveTab("past")}
            >
              Past
            </button>
          </div>
        </div>
        
        {/* Tickets List */}
        <div className="px-4 space-y-4">
          {activeTab === "upcoming" ? (
            upcomingTickets.length > 0 ? (
              upcomingTickets.map(ticket => (
                <div key={ticket.id} className="glass-card rounded-xl overflow-hidden">
                  <div className="relative h-40">
                    <img 
                      src={ticket.eventImage} 
                      alt={ticket.eventTitle} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{ticket.eventTitle}</h3>
                      <div className="flex items-center text-gray-300 text-sm mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(ticket.eventDate).toLocaleDateString()} • {ticket.eventTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center text-gray-300 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{ticket.eventLocation}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{ticket.ticketType}</div>
                        <div className="text-neon-yellow font-bold">${ticket.ticketPrice.toFixed(2)}</div>
                      </div>
                      
                      <Link 
                        to={`/ticket/${ticket.id}`}
                        className="bg-neon-yellow text-black px-4 py-2 rounded-lg font-medium flex items-center"
                      >
                        View Ticket <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-darkbg-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">You don't have any upcoming tickets.</p>
                <p className="text-gray-500 text-sm mt-1">Browse events to find something exciting!</p>
                <Link 
                  to="/discover"
                  className="bg-neon-yellow text-black px-4 py-2 rounded-lg font-medium inline-block mt-4"
                >
                  Discover Events
                </Link>
              </div>
            )
          ) : (
            // Past tickets
            pastTickets.length > 0 ? (
              pastTickets.map(ticket => (
                <div key={ticket.id} className="glass-card rounded-xl overflow-hidden opacity-70">
                  <div className="relative h-40">
                    <img 
                      src={ticket.eventImage} 
                      alt={ticket.eventTitle} 
                      className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{ticket.eventTitle}</h3>
                      <div className="flex items-center text-gray-300 text-sm mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(ticket.eventDate).toLocaleDateString()} • {ticket.eventTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center text-gray-300 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{ticket.eventLocation}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{ticket.ticketType}</div>
                        <div className="text-gray-400">${ticket.ticketPrice.toFixed(2)}</div>
                      </div>
                      
                      <div className="bg-gray-600 text-white px-3 py-1 rounded-lg text-sm">
                        Expired
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-darkbg-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">You don't have any past tickets.</p>
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Tickets;
