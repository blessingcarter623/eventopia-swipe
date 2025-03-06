
import { useState, useEffect, useRef } from "react";
import { geocodeAddress, getAddressFromLatLng, placeMarkerAndGetAddress } from "./utils";

export const useGoogleMap = (
  apiKey: string,
  onSelectLocation: (address: string, lat: number, lng: number) => void,
  defaultLocation?: string
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load the Google Maps API script
  useEffect(() => {
    // Skip if already loaded
    if (window.google && window.google.maps) {
      setIsLoading(false);
      initMap();
      return;
    }

    const loadGoogleMapsApi = () => {
      // Define a callback function to initialize the map
      window.initMap = () => {
        setIsLoading(false);
        initMap();
      };

      // Create and append the Google Maps script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setError("Failed to load Google Maps API");
        setIsLoading(false);
      };
      document.head.appendChild(script);

      return () => {
        window.initMap = () => {};
        if (script.parentNode) {
          document.head.removeChild(script);
        }
      };
    };

    loadGoogleMapsApi();
  }, [apiKey]);

  const handleAddressFromLatLng = (lat: number, lng: number) => {
    getAddressFromLatLng(lat, lng, onSelectLocation);
  };

  // Initialize the map
  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      // Default location (center of South Africa if no default provided)
      const defaultPos = { lat: -30.5595, lng: 22.9375 };

      // Create the map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: defaultPos,
        zoom: 6,
        styles: [
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
        ],
      });

      // Create a marker
      markerRef.current = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        draggable: true,
        position: defaultPos,
      });

      // Add click listener to the map
      mapInstanceRef.current.addListener("click", (e: any) => {
        placeMarkerAndGetAddress(e.latLng, markerRef, handleAddressFromLatLng);
      });

      // Add dragend listener to the marker
      if (markerRef.current) {
        markerRef.current.addListener("dragend", () => {
          if (markerRef.current) {
            const position = markerRef.current.getPosition();
            if (position) {
              handleAddressFromLatLng(position.lat(), position.lng());
            }
          }
        });
      }

      // If default location is provided, geocode it
      if (defaultLocation) {
        geocodeAddress(defaultLocation, mapInstanceRef, markerRef, onSelectLocation);
      }

      // Setup autocomplete if search input is available
      setupAutocomplete();
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  };

  // Setup places autocomplete
  const setupAutocomplete = () => {
    if (!searchInputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      console.log("Cannot setup autocomplete - missing dependencies");
      return;
    }
    
    try {
      // Create the autocomplete object
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        { 
          types: ["geocode"],
          fields: ["address_components", "formatted_address", "geometry", "name"]
        }
      );
      
      // When a place is selected
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        console.log("Place selected:", place);
        
        if (place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || "";
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(15);
          }
          
          if (markerRef.current) {
            markerRef.current.setPosition({ lat, lng });
          }
          
          onSelectLocation(address, lat, lng);
        } else {
          console.warn("Place selected but no geometry available");
        }
      });
      
      console.log("Autocomplete setup complete");
    } catch (err) {
      console.error("Error setting up autocomplete:", err);
    }
  };

  return {
    isLoading,
    error,
    mapRef,
    searchInputRef,
  };
};

// Add global type declaration for Google Maps API
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}
