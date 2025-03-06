
/**
 * Loads the Google Maps API script
 * @param apiKey The Google Maps API key
 * @param onScriptLoad Callback to execute when the script is loaded
 * @param onScriptError Callback to execute if the script fails to load
 */
export const loadGoogleMapsScript = (
  apiKey: string,
  onScriptLoad: () => void,
  onScriptError: (error: string) => void
): (() => void) => {
  // Skip if already loaded
  if (window.google && window.google.maps) {
    onScriptLoad();
    return () => {};
  }

  // Define a callback function to initialize the map
  window.initMap = () => {
    onScriptLoad();
  };

  // Create and append the Google Maps script
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap&loading=async`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    onScriptError("Failed to load Google Maps API");
  };
  document.head.appendChild(script);

  // Cleanup function
  return () => {
    window.initMap = () => {};
    if (script.parentNode) {
      document.head.removeChild(script);
    }
  };
};
