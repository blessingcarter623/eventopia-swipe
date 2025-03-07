
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Calendar, DollarSign } from "lucide-react";

// Add AnalyticsTabProps interface with isLoading property
export interface AnalyticsTabProps {
  isLoading?: boolean;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 text-neon-yellow animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-darkbg-lighter border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-neon-yellow" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,234</div>
            <p className="text-xs text-green-400">↑ 12% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-darkbg-lighter border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-sm flex items-center">
              <Users className="w-4 h-4 mr-2 text-neon-yellow" />
              Attendees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">856</div>
            <p className="text-xs text-green-400">↑ 18% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-darkbg-lighter border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-sm flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-neon-yellow" />
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-green-400">↑ 2 more than last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-darkbg-lighter border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-sm flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-neon-yellow" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R 12,345</div>
            <p className="text-xs text-green-400">↑ 15% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-darkbg-lighter border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Analytics data visualization will be available soon</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
