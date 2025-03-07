
import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, User, Ticket, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { TicketCreationDialog } from "./ticket-creation-dialog";

interface NavItem {
  label: string;
  icon: JSX.Element;
  href: string;
  activeIcon?: JSX.Element;
  requiredRole?: string;
}

export function NavigationBar() {
  const location = useLocation();
  const { profile } = useAuth();
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  
  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);
  
  const navItems: NavItem[] = [
    {
      label: "Home",
      icon: <Home className="w-6 h-6" />,
      activeIcon: <Home className="w-6 h-6 text-neon-yellow" />,
      href: "/",
    },
    {
      label: "Tickets",
      icon: <Ticket className="w-6 h-6" />,
      activeIcon: <Ticket className="w-6 h-6 text-neon-yellow" />,
      href: "/tickets",
    },
    {
      label: "Profile",
      icon: <User className="w-6 h-6" />,
      activeIcon: <User className="w-6 h-6 text-neon-yellow" />,
      href: "/profile",
    },
  ];
  
  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiredRole) return true;
    if (!profile) return false;
    return profile.role === item.requiredRole;
  });
  
  const handleCreateTicket = () => {
    setIsTicketDialogOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-darkbg-lighter border-t border-gray-800 flex justify-around items-center px-2 z-40">
        {filteredNavItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-1/5 py-1 rounded-lg",
              isActive(item.href) ? "text-neon-yellow" : "text-gray-400"
            )}
          >
            {isActive(item.href) ? item.activeIcon || item.icon : item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        
        <div className="flex flex-col items-center justify-center w-1/5 py-1">
          <Button
            onClick={handleCreateTicket}
            className="w-12 h-12 rounded-full bg-neon-yellow hover:bg-neon-yellow/90 flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-black" />
          </Button>
          <span className="text-xs mt-1 text-gray-400">Create</span>
        </div>
      </div>
      
      <TicketCreationDialog 
        isOpen={isTicketDialogOpen}
        onClose={() => setIsTicketDialogOpen(false)}
      />
    </>
  );
}
