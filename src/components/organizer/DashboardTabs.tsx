
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, BarChart3, Video } from "lucide-react";
import EventsTab from "./EventsTab";
import AnalyticsTab from "./AnalyticsTab";
import FollowersTab from "./FollowersTab";
import { VideoCreationStudio } from "@/components/ui/video-creation-studio";
import { Event, User } from "@/types";

interface AnalyticsData {
  totalTicketsSold: number;
  totalRevenue: number;
  averageAttendance: number;
  popularEvents: {
    name: string;
    sales: number;
    percentage: number;
  }[];
}

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  organizerEvents: Event[];
  followers: User[];
  analyticsData: AnalyticsData;
}

const DashboardTabs = ({
  activeTab,
  setActiveTab,
  organizerEvents,
  followers,
  analyticsData
}: DashboardTabsProps) => {
  return (
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
      
      <TabsContent value="events">
        <EventsTab 
          events={organizerEvents}
          averageTicketsSold={organizerEvents.length > 0 ? Math.floor(analyticsData.totalTicketsSold / organizerEvents.length) : 0}
        />
      </TabsContent>
      
      <TabsContent value="video" className="p-0">
        <VideoCreationStudio />
      </TabsContent>
      
      <TabsContent value="analytics">
        <AnalyticsTab
          totalTicketsSold={analyticsData.totalTicketsSold}
          totalRevenue={analyticsData.totalRevenue}
          averageAttendance={analyticsData.averageAttendance}
          eventsCount={organizerEvents.length}
          popularEvents={analyticsData.popularEvents}
        />
      </TabsContent>
      
      <TabsContent value="followers">
        <FollowersTab followers={followers} />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
