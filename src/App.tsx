
import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
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
      return <div>Loading...</div>; // Replace with a proper loading indicator
    }
    
    if (!user) {
      return <Navigate to="/" />;
    }
    
    if (profile && !allowedRoles.includes(profile.role)) {
      return <Navigate to="/" />;
    }
    
    return children;
  };
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<OrganizerDashboard />} />
        
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
