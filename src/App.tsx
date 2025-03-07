
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Tickets from "./pages/Tickets";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateEventPage from "./pages/CreateEventPage";
import ProtectedRoute from "./components/ProtectedRoute";
import EditEventPage from "@/pages/EditEventPage";
import LivestreamsList from "./pages/LivestreamsList";
import LivestreamPage from "./pages/LivestreamPage";
import CreateLivestream from "./pages/CreateLivestream";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/edit" element={
                <ProtectedRoute>
                  <ProfileEdit />
                </ProtectedRoute>
              } />
              <Route path="/tickets" element={
                <ProtectedRoute>
                  <Tickets />
                </ProtectedRoute>
              } />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="/organizer/dashboard" element={
                <ProtectedRoute requiredRole="organizer">
                  <OrganizerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/create-event" element={
                <ProtectedRoute requiredRole="organizer">
                  <CreateEventPage />
                </ProtectedRoute>
              } />
              <Route path="/event/edit/:eventId" element={
                <ProtectedRoute>
                  <EditEventPage />
                </ProtectedRoute>
              } />
              <Route path="/event/tickets/:eventId" element={
                <ProtectedRoute>
                  <EditEventPage />
                </ProtectedRoute>
              } />
              <Route path="/event/tickets" element={
                <ProtectedRoute requiredRole="organizer">
                  <Navigate to="/organizer/dashboard?tab=tickets" replace />
                </ProtectedRoute>
              } />
              <Route path="/livestreams" element={<LivestreamsList />} />
              <Route path="/livestream/:livestreamId" element={<LivestreamPage />} />
              <Route path="/create-livestream" element={
                <ProtectedRoute requiredRole="organizer">
                  <CreateLivestream />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
