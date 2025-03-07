
import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  eventId?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ eventId }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate("/create-event");
  };
  
  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-20 right-4 rounded-full w-14 h-14 bg-neon-yellow text-black hover:bg-neon-yellow/90 shadow-lg flex items-center justify-center"
      aria-label="Create new event"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
};

export default FloatingActionButton;
