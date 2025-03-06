
import { geocodeAddress } from "./utils";
import { ExtendedMarker } from "./types";

/**
 * Initializes Google Maps with custom styling
 */
export const initializeMap = (
  mapRef: React.RefObject<HTMLDivElement>,
  markerRef: React.MutableRefObject<google.maps.Marker | null>,
  mapInstanceRef: React.MutableRefObject<google.maps.Map | null>,
  handleAddressFromLatLng: (lat: number, lng: number) => void,
  onSelectLocation: (address: string, lat: number, lng: number) => void,
  defaultLocation?: string
) => {
  if (!mapRef.current || !window.google) return false;

  try {
    // Default location (center of South Africa if no default provided)
    const defaultPos = { lat: -30.5595, lng: 22.9375 };

    // Create the map
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultPos,
      zoom: 6,
      styles: getMapStyles(),
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false
    });

    // Create a marker
    markerRef.current = new window.google.maps.Marker({
      map: mapInstanceRef.current,
      draggable: true,
      position: defaultPos,
      visible: false // Start hidden until a location is selected
    });

    // Add click listener to the map
    mapInstanceRef.current.addListener("click", (e: any) => {
      if (markerRef.current) {
        markerRef.current.setPosition(e.latLng);
        (markerRef.current as ExtendedMarker).setVisible(true);
        handleAddressFromLatLng(e.latLng.lat(), e.latLng.lng());
      }
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
    if (defaultLocation && defaultLocation.trim() !== "") {
      geocodeAddress(defaultLocation, mapInstanceRef, markerRef, onSelectLocation);
    }

    return true;
  } catch (err) {
    console.error("Error initializing map:", err);
    return false;
  }
};

/**
 * Returns the custom dark mode styling for Google Maps
 */
export const getMapStyles = () => [
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
