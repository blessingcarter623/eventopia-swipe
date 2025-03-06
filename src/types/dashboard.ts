
import { User, Event } from "@/types";

export interface AnalyticsEvent {
  name: string;
  sales: number;
  percentage: number;
}

export interface AnalyticsData {
  totalTicketsSold: number;
  totalRevenue: number;
  averageAttendance: number;
  popularEvents: AnalyticsEvent[];
}
