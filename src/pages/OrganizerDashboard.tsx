
import React, { useState } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { mockEvents, mockUsers } from "@/data/index";
import DashboardHeader from "@/components/organizer/DashboardHeader";
import OrganizerProfile from "@/components/organizer/OrganizerProfile";
import DashboardTabs from "@/components/organizer/DashboardTabs";

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
        />
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default OrganizerDashboard;
