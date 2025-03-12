// src/components/dashboard/MapUpdater.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Component to update the map when props change
const MapUpdater = ({ basemap }) => {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
  }, [map, basemap]);

  return null;
};

export default MapUpdater;