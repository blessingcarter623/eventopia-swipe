
import React, { useState } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import DashboardHeader from "@/components/organizer/DashboardHeader";
import OrganizerProfile from "@/components/organizer/OrganizerProfile";
import DashboardTabs from "@/components/organizer/DashboardTabs";
import DashboardActions from "@/components/organizer/DashboardActions";
import DashboardLoading from "@/components/organizer/DashboardLoading";
import { useOrganizerData } from "@/hooks/useOrganizerData";

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const { 
    isLoading, 
    organizer, 
    organizerEvents, 
    followers, 
    analyticsData,
    fetchEvents
  } = useOrganizerData();
  
  if (!organizer) {
    return <DashboardLoading />;
  }
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <DashboardHeader />
        
        {/* Quick action buttons */}
        <DashboardActions />
        
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
