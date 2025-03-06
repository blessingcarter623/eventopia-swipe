
export interface GoogleMapPickerProps {
  apiKey: string;
  onSelectLocation: (address: string, lat: number, lng: number) => void;
  defaultLocation?: string;
}

export interface MapRefs {
  mapInstanceRef: React.MutableRefObject<google.maps.Map | null>;
  markerRef: React.MutableRefObject<google.maps.Marker | null>;
  autocompleteRef: React.MutableRefObject<google.maps.places.Autocomplete | null>;
}

// Extended types to properly support Google Maps API
export interface ExtendedPlaceResult extends google.maps.places.PlaceResult {
  formatted_address?: string;
  geometry?: {
    location: google.maps.LatLng;
  };
  name?: string;
}

export interface ExtendedMarker extends google.maps.Marker {
  setVisible(visible: boolean): void;
}
