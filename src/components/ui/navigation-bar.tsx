
import React from "react";
import { Home, Search, Ticket, User, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function NavigationBar() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: null, label: "Create", path: "/create-event" },
    { icon: Ticket, label: "Tickets", path: "/tickets" },
    { icon: User, label: "Profile", path: "/profile" },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-darkbg-lighter border-t border-white/10 px-2 py-1">
      <div className="flex items-center justify-around">
        {navItems.map((item, index) => {
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
