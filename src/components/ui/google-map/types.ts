
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
