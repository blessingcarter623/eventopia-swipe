
import React from "react";
import { Home, Search, LogIn, Video, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AuthNavigationBar() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: Video, label: "Lives", path: "/livestreams" },
    { icon: LogIn, label: "Login", path: "/login" },
    { icon: Plus, label: "Sign Up", path: "/signup" },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-darkbg-lighter border-t border-white/10 px-2 py-1">
      <div className="flex items-center justify-around">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          
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
  );
}
