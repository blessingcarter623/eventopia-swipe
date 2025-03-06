
import React from "react";
import { Home, Search, Ticket, User, Plus, LogIn, Video } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function NavigationBar() {
  const location = useLocation();
  const { user } = useAuth();
  
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-darkbg-lighter border-t border-white/10 px-2 py-1">
      <div className="flex items-center justify-around">
        {navItems.map((item, index) => {
          if (item.requiredAuth && !user) return null;
          
          const isActive = location.pathname === item.path;
          const isCreate = item.label === "Create";
          
          return (
            <Link 
              key={index}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-4 ${isActive ? "text-neon-yellow" : "text-gray-400"}`}
            >
              {isCreate ? (
                <div className="w-12 h-12 bg-neon-yellow rounded-full flex items-center justify-center -mt-5 animate-pulse-neon shadow-lg">
                  <Plus className="w-6 h-6 text-black" />
                </div>
              ) : (
                <>
                  <item.icon className={`w-6 h-6 ${isActive ? "text-neon-yellow" : "text-gray-400"}`} />
                  <span className="text-xs mt-1">{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
