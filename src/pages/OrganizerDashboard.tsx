import React, { useState } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockEvents, mockUsers } from "@/data/index";
import { Calendar, Users, BarChart3, PlusCircle, Pencil, ArrowLeft, Video, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VideoCreationStudio } from "@/components/ui/video-creation-studio";

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const organizer = mockUsers[0]; // Using first user as organizer
  
  // Filter events by this organizer
  const organizerEvents = mockEvents.filter(event => event.organizer.id === organizer.id);
  
  // Mock analytics data
  const analyticsData = {
    totalTicketsSold: 432,
    totalRevenue: 38500,
    averageAttendance: 86,
    popularEvents: [
      { name: "Neon Nights Music Festival", sales: 245, percentage: 80 },
      { name: "Tech Innovation Summit", sales: 112, percentage: 40 },
      { name: "Urban Art Exhibition", sales: 75, percentage: 25 },
    ]
  };
  
  // Mock followers
  const followers = mockUsers.slice(2, 5); // Get some users as followers
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-darkbg-lighter">
          <Link to="/" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Organizer Dashboard</h1>
          <div className="w-6"></div> {/* Empty div for spacing */}
        </div>
        
        {/* Organizer info */}
        <div className="bg-gradient-to-b from-darkbg-lighter to-darkbg p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={organizer.avatar} 
                alt={organizer.displayName} 
                className="w-16 h-16 rounded-full object-cover border-2 border-neon-yellow"
              />
              {organizer.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-neon-yellow text-black rounded-full p-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.25 6.75L9.75 17.25L4.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{organizer.displayName}</h2>
              <p className="text-gray-400">@{organizer.username}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-sm text-gray-400">
                  <span className="text-white font-bold">{organizer.followers}</span> followers
                </span>
                <span className="text-sm text-gray-400">
                  <span className="text-white font-bold">{organizerEvents.length}</span> events
                </span>
              </div>
            </div>
          </div>
          
          <Button className="w-full mt-4 bg-neon-yellow hover:bg-neon-yellow/90 text-black">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New Event
          </Button>
        </div>
        
        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 bg-darkbg-lighter border-b border-white/10">
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:text-neon-yellow data-[state=active]:border-b-2 data-[state=active]:border-neon-yellow rounded-none bg-transparent py-3"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="data-[state=active]:text-neon-yellow data-[state=active]:border-b-2 data-[state=active]:border-neon-yellow rounded-none bg-transparent py-3"
            >
              <Video className="w-4 h-4 mr-2" />
              Studio
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:text-neon-yellow data-[state=active]:border-b-2 data-[state=active]:border-neon-yellow rounded-none bg-transparent py-3"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="followers" 
              className="data-[state=active]:text-neon-yellow data-[state=active]:border-b-2 data-[state=active]:border-neon-yellow rounded-none bg-transparent py-3"
            >
              <Users className="w-4 h-4 mr-2" />
              Followers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="events" className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Your Events</h3>
              <Button variant="outline" size="sm" className="border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black">
                <PlusCircle className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
            
            {organizerEvents.length > 0 ? (
              <div className="space-y-4">
                {organizerEvents.map(event => (
                  <div key={event.id} className="bg-darkbg-lighter p-4 rounded-xl">
                    <div className="flex gap-3">
                      <img 
                        src={event.media.url} 
                        alt={event.title} 
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-white font-bold">{event.title}</h4>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex justify-between mt-2">
                          <p className="text-neon-yellow font-bold">
                            R {typeof event.price === 'number' ? event.price.toFixed(2) : event.price}
                          </p>
                          <div className="flex gap-2">
                            <Badge className="bg-neon-blue">{event.stats.views} views</Badge>
                            <Badge className="bg-neon-purple">{analyticsData.totalTicketsSold / organizerEvents.length} tickets</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-4">You haven't created any events yet</p>
                <Button className="bg-neon-yellow hover:bg-neon-yellow/90 text-black">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="video" className="p-0">
            <VideoCreationStudio />
          </TabsContent>
          
          <TabsContent value="analytics" className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Event Analytics</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-darkbg-lighter p-4 rounded-xl">
                <p className="text-gray-400 text-sm">Total Tickets Sold</p>
                <p className="text-2xl font-bold text-white mt-1">{analyticsData.totalTicketsSold}</p>
              </div>
              <div className="bg-darkbg-lighter p-4 rounded-xl">
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-neon-yellow mt-1">R {analyticsData.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-darkbg-lighter p-4 rounded-xl">
                <p className="text-gray-400 text-sm">Avg. Attendance</p>
                <p className="text-2xl font-bold text-white mt-1">{analyticsData.averageAttendance}%</p>
              </div>
              <div className="bg-darkbg-lighter p-4 rounded-xl">
                <p className="text-gray-400 text-sm">Total Events</p>
                <p className="text-2xl font-bold text-white mt-1">{organizerEvents.length}</p>
              </div>
            </div>
            
            <h4 className="text-md font-semibold text-white mb-3">Popular Events</h4>
            <div className="space-y-4">
              {analyticsData.popularEvents.map((event, index) => (
                <div key={index} className="bg-darkbg-lighter p-3 rounded-xl">
                  <div className="flex justify-between mb-1">
                    <p className="text-white">{event.name}</p>
                    <p className="text-neon-yellow font-semibold">{event.sales} sold</p>
                  </div>
                  <Progress value={event.percentage} className="h-2" indicatorClassName="bg-neon-yellow" />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="followers" className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Your Followers</h3>
            
            <div className="space-y-3">
              {followers.map(follower => (
                <div key={follower.id} className="bg-darkbg-lighter p-3 rounded-xl flex items-center gap-3">
                  <img 
                    src={follower.avatar} 
                    alt={follower.displayName} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{follower.displayName}</h4>
                    <p className="text-gray-400 text-sm">@{follower.username}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    Following
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default OrganizerDashboard;
