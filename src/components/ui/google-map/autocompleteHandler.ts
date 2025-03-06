
/**
 * Sets up Google Places Autocomplete on an input element
 */
export const setupAutocomplete = (
  searchInputRef: React.RefObject<HTMLInputElement>,
  autocompleteRef: React.MutableRefObject<google.maps.places.Autocomplete | null>,
  mapInstanceRef: React.MutableRefObject<google.maps.Map | null>,
  markerRef: React.MutableRefObject<google.maps.Marker | null>,
  onSelectLocation: (address: string, lat: number, lng: number) => void
): boolean => {
  if (!searchInputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
    console.log("Cannot setup autocomplete - missing dependencies");
    return false;
  }
  
  try {
    // Create the autocomplete object
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      searchInputRef.current,
      { 
        types: ["geocode", "establishment"],
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
        const address = place.formatted_address || place.name || "";
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(15);
        }
        
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
          markerRef.current.setVisible(true);
        }
        
        onSelectLocation(address, lat, lng);
      } else {
        console.warn("Place selected but no geometry available");
      }
    });
    
    console.log("Autocomplete setup complete");
    return true;
  } catch (err) {
    console.error("Error setting up autocomplete:", err);
    return false;
  }
};
