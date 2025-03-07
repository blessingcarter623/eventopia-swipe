
import React, { useState } from "react";
import { Home, Search, Ticket, User, Plus, LogIn, Video, TicketPlus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { TicketCreationDialog } from "./ticket-creation-dialog";

export function NavigationBar() {
  const location = useLocation();
  const { user } = useAuth();
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: Video, label: "Lives", path: "/livestreams" },
    { icon: null, label: "Create", path: "/create-event", requiredAuth: true },
    { icon: Ticket, label: "Tickets", path: "/tickets", requiredAuth: true },
    user ? 
      { icon: User, label: "Profile", path: "/profile" } : 
      { icon: LogIn, label: "Login", path: "/login" },
  ];
  
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-darkbg-lighter border-t border-white/10 px-2 py-1">
        <div className="flex items-center justify-around">
          {navItems.map((item, index) => {
            if (item.requiredAuth && !user) return null;
            
            const isActive = location.pathname === item.path;
            const isCreate = item.label === "Create";
            
            if (isCreate) {
              return (
                <div key={index} className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <Link to={item.path}>
                      <div className="w-12 h-12 bg-neon-yellow rounded-full flex items-center justify-center -mt-5 shadow-lg">
                        <Plus className="w-6 h-6 text-black" />
                      </div>
                    </Link>
                    
                    {user && (
                      <button 
                        onClick={() => setIsTicketDialogOpen(true)}
                        className="absolute -right-4 -top-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <TicketPlus className="w-4 h-4 text-black" />
                      </button>
                    )}
                  </div>
                  <span className="text-xs mt-1 text-gray-400">{item.label}</span>
                </div>
              );
            }
            
            return (
              <Link 
                key={index}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 px-4 ${isActive ? "text-neon-yellow" : "text-gray-400"}`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? "text-neon-yellow" : "text-gray-400"}`} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      <TicketCreationDialog 
        isOpen={isTicketDialogOpen} 
        onClose={() => setIsTicketDialogOpen(false)} 
      />
    </>
  );
}
