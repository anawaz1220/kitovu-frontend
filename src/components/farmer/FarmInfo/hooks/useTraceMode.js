import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

export const useTraceMode = (map) => {
  const [isTracing, setIsTracing] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const watchIdRef = useRef(null);
  const pathRef = useRef(null);
  const markerRef = useRef(null);

  const startTracing = () => {
    if (!map) return;
    
    setCoordinates([]);
    setIsTracing(true);

    // Create path polyline
    pathRef.current = L.polyline([], {
      color: '#4CAF50',
      weight: 3
    }).addTo(map);

    // Create current position marker
    markerRef.current = L.marker([0, 0], {
      icon: L.divIcon({
        className: 'current-position-marker',
        html: '<div class="w-4 h-4 bg-kitovu-purple rounded-full border-2 border-white shadow-lg"></div>'
      })
    }).addTo(map);

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoord = [latitude, longitude];
        
        setCoordinates(prev => [...prev, newCoord]);
        pathRef.current.addLatLng(newCoord);
        markerRef.current.setLatLng(newCoord);
        map.panTo(newCoord);
      },
      (error) => console.error('Geolocation error:', error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const stopTracing = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Connect start and end points if needed
    if (coordinates.length > 2) {
      const startPoint = coordinates[0];
      const endPoint = coordinates[coordinates.length - 1];
      setCoordinates(prev => [...prev, startPoint]);
      pathRef.current?.addLatLng(startPoint);
    }

    // Cleanup
    pathRef.current?.remove();
    markerRef.current?.remove();
    setIsTracing(false);

    return coordinates;
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      pathRef.current?.remove();
      markerRef.current?.remove();
    };
  }, []);

  return {
    isTracing,
    startTracing,
    stopTracing,
    coordinates
  };
};