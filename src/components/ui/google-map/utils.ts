
import { ExtendedMarker } from "./types";

/**
 * Places a marker on the map and retrieves the address for that location
 */
export const placeMarkerAndGetAddress = (
  latLng: google.maps.LatLng,
  markerRef: React.MutableRefObject<google.maps.Marker | null>,
  getAddressFromLatLng: (lat: number, lng: number) => void
) => {
  if (markerRef.current) {
    markerRef.current.setPosition(latLng);
    (markerRef.current as ExtendedMarker).setVisible(true);
    getAddressFromLatLng(latLng.lat(), latLng.lng());
  }
};

/**
 * Gets address from coordinates using the Google Maps Geocoder API
 */
export const getAddressFromLatLng = (
  lat: number, 
  lng: number,
  onSelectLocation: (address: string, lat: number, lng: number) => void
) => {
  if (!window.google || !window.google.maps) {
    console.error("Google Maps not loaded");
    return;
  }
  
  const geocoder = new window.google.maps.Geocoder();
  const latlng = { lat, lng };
  
  geocoder.geocode({ location: latlng }, (results: any, status: any) => {
    if (status === "OK" && results && results.length > 0) {
      onSelectLocation(results[0].formatted_address, lat, lng);
    } else {
      console.warn("Geocoder failed due to: " + status);
      // Fallback to coordinates string when address lookup fails
      onSelectLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng);
    }
  });
};

/**
 * Geocodes an address string to get coordinates
 */
export const geocodeAddress = (
  address: string,
  mapInstanceRef: React.MutableRefObject<google.maps.Map | null>,
  markerRef: React.MutableRefObject<google.maps.Marker | null>,
  onSelectLocation: (address: string, lat: number, lng: number) => void
) => {
  if (!window.google || !window.google.maps) {
    console.error("Google Maps not loaded");
    return;
  }
  
  const geocoder = new window.google.maps.Geocoder();
  geocoder.geocode({ address }, (results: any, status: any) => {
    if (status === "OK" && results && results.length > 0) {
      const location = results[0].geometry.location;
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(15);
      }
      
      if (markerRef.current) {
        markerRef.current.setPosition(location);
        (markerRef.current as ExtendedMarker).setVisible(true);
      }
      
      onSelectLocation(results[0].formatted_address, location.lat(), location.lng());
    } else {
      console.warn("Geocode was not successful for the following reason: " + status);
    }
  });
};
