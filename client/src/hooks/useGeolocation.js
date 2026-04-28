import { useState, useCallback } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPosition = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please use a modern browser such as Chrome or Firefox.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          coordinates: [position.coords.longitude, position.coords.latitude],
          accuracy: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
        });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(
              'Location access is REQUIRED to submit a log. This verifies your attendance at your training location. ' +
              'Please enable location access in your browser settings, then try again.'
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Your location is currently unavailable. Please check that your device location services are turned on.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please ensure you have a stable connection and try again.');
            break;
          default:
            setError('Failed to get your location. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  const resetLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return { location, error, loading, getPosition, resetLocation };
};

export default useGeolocation;