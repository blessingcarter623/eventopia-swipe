import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "./integrations/supabase/client";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "./pages/LandingPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import UserDashboard from "./pages/UserDashboard";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import OrganizerProfilePage from "./pages/OrganizerProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import OrganizerTicketsPage from "./pages/OrganizerTicketsPage";
import { useAuth } from "./context/AuthContext";
import OrganizerScannerPage from "./pages/OrganizerScannerPage";
import EventScannerPage from "./pages/EventScannerPage";

function App() {
  const { authUser, profile, loading } = useAuth();
  
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
    if (loading) {
      return <div>Loading...</div>; // Replace with a proper loading indicator
    }
    
    if (!authUser) {
      return <Navigate to="/login" />;
    }
    
    if (profile && !allowedRoles.includes(profile.role)) {
      return <Navigate to="/" />;
    }
    
    return children;
  };
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        <Route path="/profile/:id" element={<UserProfilePage />} />
        <Route path="/organizer/:id" element={<OrganizerProfilePage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        
        <Route
          path="/login"
          element={
            <div className="app-height grid place-items-center">
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'github']}
                redirectTo={`${window.location.origin}/organizer/dashboard`}
              />
            </div>
          }
        />
        
        <Route
          path="/register"
          element={
            <div className="app-height grid place-items-center">
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'github']}
                redirectTo={`${window.location.origin}/organizer/dashboard`}
              />
            </div>
          }
        />
        
        <Route 
          path="/organizer/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <OrganizerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-event" 
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <CreateEventPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-event/:eventId" 
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <EditEventPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tickets" 
          element={
            <ProtectedRoute allowedRoles={["user", "organizer"]}>
              <TicketDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/event/tickets/:eventId" 
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <OrganizerTicketsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Add these new routes for the scanner */}
        <Route 
          path="/organizer/scanner" 
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <OrganizerScannerPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/event/scanner/:eventId" 
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <EventScannerPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
