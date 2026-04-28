import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { formatCoordinates } from '@/lib/utils';

// Leaflet must be loaded client-side only
const LocationMap = ({ coordinates, accuracy, className = '' }) => {
  const [MapComponent, setMapComponent] = useState(null);

  useEffect(() => {
    // Dynamically import Leaflet (SSR-safe)
    import('leaflet').then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    });

    import('react-leaflet').then(({ MapContainer, TileLayer, Marker, Popup, Circle }) => {
      setMapComponent(() => ({ coords }) => {
        const [lng, lat] = coords;
        return (
          <MapContainer
            center={[lat, lng]}
            zoom={15}
            style={{ height: '250px', width: '100%', borderRadius: '8px', zIndex: 0 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={[lat, lng]}>
              <Popup>Log submitted here</Popup>
            </Marker>
            {accuracy && (
              <Circle
                center={[lat, lng]}
                radius={accuracy}
                pathOptions={{ color: '#1a3a5c', fillColor: '#1a3a5c', fillOpacity: 0.1 }}
              />
            )}
          </MapContainer>
        );
      });
    });

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }
  }, []);

  if (!coordinates || coordinates.length < 2) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <MapPin className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">No location data</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formatCoordinates(coordinates)}
        </span>
        {accuracy && (
          <span className="text-xs text-gray-400">±{Math.round(accuracy)}m</span>
        )}
      </div>
      {MapComponent ? (
        <MapComponent coords={coordinates} />
      ) : (
        <div className="h-[250px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-sm text-gray-400">Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default LocationMap;