
import React, { useState, useEffect, useRef } from "react";
import { Loader } from "lucide-react";

interface GoogleMapPickerProps {
  apiKey: string;
  onSelectLocation: (address: string, lat: number, lng: number) => void;
  defaultLocation?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  apiKey,
  onSelectLocation,
  defaultLocation = "",
}) => {
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
        placeMarkerAndGetAddress(e.latLng);
      });

      // Add dragend listener to the marker
      if (markerRef.current) {
        markerRef.current.addListener("dragend", () => {
          if (markerRef.current) {
            const position = markerRef.current.getPosition();
            if (position) {
              getAddressFromLatLng(position.lat(), position.lng());
            }
          }
        });
      }

      // If default location is provided, geocode it
      if (defaultLocation) {
        geocodeAddress(defaultLocation);
      }

      // Setup autocomplete if search input is available
      if (searchInputRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          searchInputRef.current,
          { types: ["geocode"] }
        );
        
        if (autocompleteRef.current) {
          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();
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
            }
          });
        }
      }
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  };

  // Geocode an address to get coordinates
  const geocodeAddress = (address: string) => {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(15);
        }
        
        if (markerRef.current) {
          markerRef.current.setPosition(location);
        }
        
        onSelectLocation(results[0].formatted_address, location.lat(), location.lng());
      }
    });
  };

  // Get address from latitude and longitude
  const getAddressFromLatLng = (lat: number, lng: number) => {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };
    
    geocoder.geocode({ location: latlng }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        onSelectLocation(results[0].formatted_address, lat, lng);
      } else {
        onSelectLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng);
      }
    });
  };

  // Place marker and get address
  const placeMarkerAndGetAddress = (latLng: any) => {
    if (markerRef.current) {
      markerRef.current.setPosition(latLng);
      getAddressFromLatLng(latLng.lat(), latLng.lng());
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-darkbg-lighter text-white">
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-darkbg-lighter text-white">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search for a location"
        className="absolute top-2 left-2 right-2 z-10 px-3 py-2 rounded-md bg-darkbg border border-gray-700 text-white text-sm"
      />
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

export default GoogleMapPicker;
