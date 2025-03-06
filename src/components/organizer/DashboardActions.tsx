
import React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DashboardActions = () => {
  return (
    <div className="px-4 py-2 flex justify-end">
      <Link to="/create-event">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </Link>
    </div>
  );
};

export default DashboardActions;
