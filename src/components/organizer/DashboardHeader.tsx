
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-darkbg-lighter">
      <Link to="/" className="text-white">
        <ArrowLeft className="w-6 h-6" />
      </Link>
      <h1 className="text-xl font-bold text-white">Organizer Dashboard</h1>
      <div className="w-6"></div> {/* Empty div for spacing */}
    </div>
  );
};

export default DashboardHeader;
