
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsEvent {
  name: string;
  sales: number;
  percentage: number;
}

interface AnalyticsTabProps {
  totalTicketsSold: number;
  totalRevenue: number;
  averageAttendance: number;
  eventsCount: number;
  popularEvents: AnalyticsEvent[];
  isLoading: boolean;
}

const AnalyticsTab = ({ 
  totalTicketsSold, 
  totalRevenue, 
  averageAttendance, 
  eventsCount, 
  popularEvents,
  isLoading
}: AnalyticsTabProps) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Event Analytics</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-darkbg-lighter p-4 rounded-xl">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-darkbg-lighter p-3 rounded-xl">
              <div className="flex justify-between mb-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Event Analytics</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-darkbg-lighter p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Total Tickets Sold</p>
          <p className="text-2xl font-bold text-white mt-1">{totalTicketsSold}</p>
        </div>
        <div className="bg-darkbg-lighter p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-neon-yellow mt-1">R {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-darkbg-lighter p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Avg. Attendance</p>
          <p className="text-2xl font-bold text-white mt-1">{averageAttendance}%</p>
        </div>
        <div className="bg-darkbg-lighter p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Total Events</p>
          <p className="text-2xl font-bold text-white mt-1">{eventsCount}</p>
        </div>
      </div>
      
      <h4 className="text-md font-semibold text-white mb-3">Popular Events</h4>
      {popularEvents.length > 0 ? (
        <div className="space-y-4">
          {popularEvents.map((event, index) => (
            <div key={index} className="bg-darkbg-lighter p-3 rounded-xl">
              <div className="flex justify-between mb-1">
                <p className="text-white">{event.name}</p>
                <p className="text-neon-yellow font-semibold">{event.sales} sold</p>
              </div>
              <Progress value={event.percentage} className="h-2" indicatorClassName="bg-neon-yellow" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-darkbg-lighter p-4 rounded-xl text-center text-gray-400">
          No event data available yet. Start selling tickets to see analytics!
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;
