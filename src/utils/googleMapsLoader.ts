let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMapsScript = (): Promise<void> => {
  // If already loaded, resolve immediately
  if (isLoaded && window.google) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Start loading
  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.gomaps.pro/maps/api/js?key=AlzaSy_I4Q4LMZ9W3_hRs8IT1S-DVYD5sgjijng&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };
    
    script.onerror = () => {
      isLoading = false;
      loadPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };
    
    document.head.appendChild(script);
  });

  return loadPromise;
};