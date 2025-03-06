
import { useState, useEffect, useRef } from "react";
import { getAddressFromLatLng } from "./utils";
import { loadGoogleMapsScript } from "./mapLoader";
import { initializeMap } from "./mapInitializer";
import { setupAutocomplete } from "./autocompleteHandler";

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

  // Handler for getting address from coordinates
  const handleAddressFromLatLng = (lat: number, lng: number) => {
    getAddressFromLatLng(lat, lng, onSelectLocation);
  };

  // Initialize the map
  const initMap = () => {
    const success = initializeMap(
      mapRef,
      markerRef,
      mapInstanceRef,
      handleAddressFromLatLng,
      onSelectLocation,
      defaultLocation
    );
    
    if (!success) {
      setError("Failed to initialize map");
      return;
    }

    // Setup autocomplete after map is initialized
    setupAutocomplete(
      searchInputRef,
      autocompleteRef,
      mapInstanceRef,
      markerRef,
      onSelectLocation
    );
  };

  // Load the Google Maps API script
  useEffect(() => {
    // Define handlers for script loading
    const handleScriptLoad = () => {
      setIsLoading(false);
      initMap();
    };

    const handleScriptError = (errorMessage: string) => {
      setError(errorMessage);
      setIsLoading(false);
    };

    // Load the script
    const cleanup = loadGoogleMapsScript(apiKey, handleScriptLoad, handleScriptError);

    // Cleanup on component unmount
    return cleanup;
  }, [apiKey]);

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
