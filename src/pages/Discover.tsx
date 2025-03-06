
import React, { useState } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Event } from "@/types";
import MapView from "@/components/discover/MapView";
import FeelingSelector from "@/components/discover/FeelingSelector";
import InviteFriendModal from "@/components/discover/InviteFriendModal";
import EventList from "@/components/discover/EventList";
import { useDiscoverEvents } from "@/hooks/useDiscoverEvents";

const Discover = () => {
  const [selectedFeeling, setSelectedFeeling] = useState<string>("All");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Use our custom hook to manage events and map loading
  const { filteredEvents, isLoading, mapsLoaded } = useDiscoverEvents(selectedFeeling);
  
  // Handle feeling selection
  const handleSelectFeeling = (feeling: string) => {
    setSelectedFeeling(feeling);
  };
  
  // Open the invite modal for a specific event
  const openInviteModal = (event: Event) => {
    setSelectedEvent(event);
    setShowInviteModal(true);
  };
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-4">Discover Events</h1>
          
          {/* Feeling Selector */}
          <FeelingSelector 
            onSelectFeeling={handleSelectFeeling}
            selectedFeeling={selectedFeeling}
          />
          
          {/* Map View */}
          <div className="my-4">
            {mapsLoaded ? (
              <MapView events={filteredEvents} isLoading={isLoading} />
            ) : (
              <div className="h-[80vh] flex items-center justify-center bg-darkbg-lighter rounded-lg">
                <div className="text-neon-yellow animate-pulse">Loading map...</div>
              </div>
            )}
          </div>
          
          {/* Events List */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              {filteredEvents.length === 0
                ? "No events found"
                : `${filteredEvents.length} Events nearby`}
            </h2>
            
            <EventList 
              events={filteredEvents} 
              onInvite={openInviteModal} 
            />
          </div>
        </div>
      </div>
      
      {/* Invite Friend Modal */}
      <InviteFriendModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        event={selectedEvent}
      />
      
      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Discover;
