import { useState, useCallback, useRef } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef(null);

  const getPosition = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please use Chrome or Firefox.');
      setLoading(false);
      return;
    }

    // Use watchPosition with a manual timeout for better reliability
    let settled = false;
    const localTimeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        setLoading(false);
        setError(
          'Location capture timed out. Please try these steps:\n' +
          '1. Ensure Location Services are ON in your device settings.\n' +
          '2. On iOS: Settings → Privacy → Location Services → Safari/Chrome → "While Using".\n' +
          '3. On Android: Settings → Apps → Browser → Permissions → Location → Allow.\n' +
          '4. Make sure you are on HTTPS (not HTTP).\n' +
          '5. Move to an area with better GPS signal and try again.'
        );
      }
    }, 20000); // 20 second manual timeout

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (!settled) {
          settled = true;
          clearTimeout(localTimeout);
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          setLocation({
            coordinates: [position.coords.longitude, position.coords.latitude],
            accuracy: position.coords.accuracy,
            capturedAt: new Date().toISOString(),
          });
          setLoading(false);
        }
      },
      (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(localTimeout);
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          setLoading(false);
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError(
                'Location access was denied. Location is REQUIRED for attendance and log submission.\n\n' +
                'To fix: Click the lock icon in your browser address bar → Allow Location access, then try again.'
              );
              break;
            case err.POSITION_UNAVAILABLE:
              setError('Your location is currently unavailable. Check that GPS and location services are enabled on your device.');
              break;
            case err.TIMEOUT:
              setError('GPS signal is weak. Move to an open area with better signal and try again.');
              break;
            default:
              setError(`Location error: ${err.message}. Please try again.`);
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 18000,
        maximumAge: 0,
      }
    );
  }, []);

  const resetLocation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocation(null);
    setError(null);
    setLoading(false);
  }, []);

  return { location, error, loading, getPosition, resetLocation };
};

export default useGeolocation;