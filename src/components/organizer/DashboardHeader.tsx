
import React from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const DashboardHeader = () => {
  const { signOut, profile } = useAuth();

  return (
    <div className="flex items-center justify-between p-4 bg-darkbg-lighter">
      <Link to="/" className="text-white">
        <ArrowLeft className="w-6 h-6" />
      </Link>
      <h1 className="text-xl font-bold text-white">Organizer Dashboard</h1>
      <div className="flex items-center gap-2">
        {profile && (
          <Button variant="ghost" size="sm" onClick={signOut} className="text-white">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
