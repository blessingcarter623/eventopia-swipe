
import React from "react";
import { ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  eventId?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ eventId }) => {
  const navigate = useNavigate();
  
  const handleScannerClick = () => {
    if (eventId) {
      navigate(`/event/scanner/${eventId}`);
    } else {
      navigate("/organizer/scanner");
    }
  };
  
  return (
    <Button
      onClick={handleScannerClick}
      className="fixed bottom-20 right-4 rounded-full w-14 h-14 bg-neon-yellow text-black hover:bg-neon-yellow/90 shadow-lg flex items-center justify-center"
      aria-label="Scan tickets"
    >
      <ScanLine className="w-6 h-6" />
    </Button>
  );
};

export default FloatingActionButton;
