import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Event } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Clock, MapPinIcon, UserCircle } from "lucide-react";

interface MapViewProps {
  events: Event[];
  isLoading: boolean;
}

const MapView: React.FC<MapViewProps> = ({ events, isLoading }) => {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || isLoading || !window.google) return;

    // Get user's location if possible
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userPos);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(userPos);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location access denied",
          description: "Using default map center instead",
          variant: "destructive",
        });
      }
    );

    // Default location (South Africa center if no user location)
    const defaultPos = { lat: -30.5595, lng: 22.9375 };
    const center = userLocation || defaultPos;

    // Create the map
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 10,
      styles: getMapStyles(),
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false
    });

    // Add user location marker if available
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
        title: "Your location"
      });
    }

    return () => {
      // Clean up markers when component unmounts
      clearMarkers();
    };
  }, [isLoading, userLocation]);

  // Add event markers when events data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !events.length) return;
    
    // Clear existing markers
    clearMarkers();
    
    // Create info window for showing event details
    const infoWindow = new window.google.maps.InfoWindow();
    
    // Add markers for each event
    events.forEach(event => {
      if (!event.coordinates?.lat || !event.coordinates?.lng) return;
      
      // Create marker
      const marker = new window.google.maps.Marker({
        position: { 
          lat: event.coordinates.lat, 
          lng: event.coordinates.lng 
        },
        map: mapInstanceRef.current,
        title: event.title,
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: `http://maps.google.com/mapfiles/ms/icons/${getCategoryColor(event.category)}-dot.png`
        }
      });
      
      // Create info window content
      const contentString = `
        <div class="p-3 max-w-xs">
          <h3 class="font-bold text-lg">${event.title}</h3>
          <div class="flex items-center mt-2">
            <img src="${event.organizer.avatar}" class="w-6 h-6 rounded-full mr-2" />
            <span>${event.organizer.name}</span>
            ${event.organizer.isVerified ? '<span class="ml-1 text-xs">✓</span>' : ''}
          </div>
          <div class="mt-2 grid grid-cols-2 gap-1 text-sm">
            <div><span class="font-semibold">Date:</span> ${new Date(event.date).toLocaleDateString()}</div>
            <div><span class="font-semibold">Time:</span> ${event.time}</div>
          </div>
          <a href="/event/${event.id}" class="block text-center bg-neon-yellow text-black font-medium py-2 px-4 rounded-lg mt-3 hover:bg-neon-yellow/90">
            View Details
          </a>
        </div>
      `;
      
      // Add click listener to the marker
      marker.addListener("click", () => {
        infoWindow.setContent(contentString);
        infoWindow.open(mapInstanceRef.current, marker);
      });
      
      // Save marker reference for cleanup
      markersRef.current.push(marker);
    });
    
  }, [events]);

  // Helper function to clear markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  // Helper function to determine marker color based on event category
  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      "Music": "purple",
      "Art": "blue",
      "Food": "orange",
      "Sports": "green",
      "Technology": "red",
      "Business": "yellow",
      "Wellness": "pink",
      "Film": "ltblue"
    };
    
    return categoryColors[category] || "red";
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-neon-yellow animate-pulse">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="h-[80vh] w-full relative rounded-lg overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />
      {events.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center p-4">
            <p className="text-lg font-semibold">No events found</p>
            <p className="text-sm">Try adjusting your filters or exploring a different area</p>
          </div>
        </div>
      )}
    </div>
  );
};

// The map styles function from our existing code
const getMapStyles = () => [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

export default MapView;
