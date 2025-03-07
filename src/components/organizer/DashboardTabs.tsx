
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import EventsTab from "./EventsTab";
import FollowersTab from "./FollowersTab";
import AnalyticsTab from "./AnalyticsTab";
import TicketsTab from "./TicketsTab";
import WalletTab from "./WalletTab";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  organizerEvents: any[];
  followers: any[];
  analyticsData: any;
  isLoading: boolean;
  refreshEvents: () => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  setActiveTab,
  organizerEvents,
  followers,
  analyticsData,
  isLoading,
  refreshEvents,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  React.useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['events', 'followers', 'analytics', 'tickets', 'wallet'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, setActiveTab]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    searchParams.set('tab', value);
    setSearchParams(searchParams);
  };
  
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-5 bg-darkbg-lighter border border-gray-700 rounded-lg p-1 mx-4">
        <TabsTrigger 
          value="events" 
          className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md"
        >
          Events
        </TabsTrigger>
        <TabsTrigger 
          value="followers" 
          className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md"
        >
          Followers
        </TabsTrigger>
        <TabsTrigger 
          value="analytics" 
          className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md"
        >
          Analytics
        </TabsTrigger>
        <TabsTrigger 
          value="tickets" 
          className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md"
        >
          Tickets
        </TabsTrigger>
        <TabsTrigger 
          value="wallet" 
          className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black rounded-md"
        >
          Wallet
        </TabsTrigger>
      </TabsList>
      
      <div className="p-4">
        <TabsContent value="events">
          <EventsTab 
            events={organizerEvents} 
            isLoading={isLoading} 
            onRefresh={refreshEvents}
          />
        </TabsContent>
        
        <TabsContent value="followers">
          <FollowersTab 
            followers={followers}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsTab 
            data={analyticsData}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="tickets">
          <TicketsTab />
        </TabsContent>
        
        <TabsContent value="wallet">
          <WalletTab 
            isLoading={isLoading}
            onRefresh={refreshEvents}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default DashboardTabs;
