
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
    console.log("Google Maps already loaded, skipping script load");
    onScriptLoad();
    return () => {};
  }

  console.log("Starting Google Maps script load");

  // Define a callback function to initialize the map
  const callbackName = 'initGoogleMaps_' + Math.random().toString(36).substring(2, 9);
  window[callbackName] = () => {
    console.log("Google Maps callback executed");
    onScriptLoad();
    // Clean up the global callback
    delete window[callbackName];
  };

  // Create and append the Google Maps script
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}&loading=async`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    console.error("Failed to load Google Maps API script");
    onScriptError("Failed to load Google Maps API");
  };
  
  console.log("Appending Google Maps script to document head");
  document.head.appendChild(script);

  // Cleanup function
  return () => {
    if (window[callbackName]) {
      delete window[callbackName];
    }
    if (script.parentNode) {
      document.head.removeChild(script);
    }
  };
};
