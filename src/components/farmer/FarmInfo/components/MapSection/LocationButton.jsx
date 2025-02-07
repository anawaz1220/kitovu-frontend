// In LocationButton.jsx, update the component:
import React from 'react';
import { useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import { Button } from '../../../../ui/button';

const LocationButton = () => {
  const map = useMap();

  const handleClick = () => {
    map.locate({ 
      setView: true, 
      maxZoom: 18,  // Increased zoom level for street view
      enableHighAccuracy: true 
    });

    // Handle when location is found
    map.on('locationfound', (e) => {
      map.setView(e.latlng, 18);  // Force zoom level 18 for street level view
    });
  };

  return (
    <Button
      onClick={handleClick}
      variant="white"
      size="icon"
      className="bg-white shadow-md hover:bg-gray-100 p-3 rounded-lg h-12 w-12 flex items-center justify-center"
    >
      <MapPin 
        className="h-7 w-7 text-kitovu-purple" 
        strokeWidth={2.5}
      />
    </Button>
  );
};

export default LocationButton;