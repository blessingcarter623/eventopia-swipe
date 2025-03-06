
import React from "react";
import { Loader } from "lucide-react";
import { useGoogleMap } from "./google-map/useGoogleMap";
import { GoogleMapPickerProps } from "./google-map/types";

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  apiKey,
  onSelectLocation,
  defaultLocation = "",
}) => {
  const { isLoading, error, mapRef, searchInputRef } = useGoogleMap(
    apiKey,
    onSelectLocation,
    defaultLocation
  );

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
