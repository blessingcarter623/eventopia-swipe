
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "./integrations/supabase/client";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import UserDashboard from "./pages/UserDashboard";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import { useAuth } from "./context/AuthContext";
import OrganizerScannerPage from "./pages/OrganizerScannerPage";
import EventScannerPage from "./pages/EventScannerPage";

function App() {
  const { user, profile, loading } = useAuth();
  
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
    if (loading) {
      return <div className="app-height bg-darkbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-yellow"></div>
      </div>;
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (profile && !allowedRoles.includes(profile.role)) {
      return <Navigate to="/" />;
    }
    
    return <>{children}</>;
  };
  
  // Check if we're still loading auth state
  if (loading) {
    return <div className="app-height bg-darkbg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-yellow"></div>
    </div>;
  }
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={user ? <OrganizerDashboard /> : <Navigate to="/login" />} />
        
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" /> : (
              <div className="app-height grid place-items-center">
                <Auth
                  supabaseClient={supabase}
                  appearance={{ theme: ThemeSupa }}
                  providers={['google', 'github']}
                  redirectTo={`${window.location.origin}/organizer/dashboard`}
                />
              </div>
            )
          }
        />
        
        <Route
          path="/register"
          element={
            user ? <Navigate to="/" /> : (
              <div className="app-height grid place-items-center">
                <Auth
                  supabaseClient={supabase}
                  appearance={{ theme: ThemeSupa }}
                  providers={['google', 'github']}
                  redirectTo={`${window.location.origin}/organizer/dashboard`}
                />
              </div>
            )
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
        
        {/* QR Scanner Routes */}
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
