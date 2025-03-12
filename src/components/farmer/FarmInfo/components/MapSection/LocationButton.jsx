// In LocationButton.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import { Button } from '../../../../ui/button';
import L from 'leaflet';

const LocationButton = () => {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const markerRef = useRef(null);
  const accuracyDisplayRef = useRef(null);

  useEffect(() => {
    // Create accuracy display div
    const accuracyControl = L.control({ position: 'bottomleft' });
    accuracyControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-control accuracy-info');
      div.style.background = 'white';
      div.style.padding = '5px 10px';
      div.style.borderRadius = '4px';
      div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.2)';
      div.style.margin = '10px';
      div.style.fontSize = '12px';
      accuracyDisplayRef.current = div;
      return div;
    };
    accuracyControl.addTo(map);

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map]);

  const handleLocationUpdate = (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    const latlng = [latitude, longitude];

    // Update location dot
    if (!markerRef.current) {
      markerRef.current = L.marker(latlng, {
        icon: L.divIcon({
          className: 'location-dot',
          html: `
            <div class="w-4 h-4 relative">
              <div class="absolute w-4 h-4 bg-kitovu-purple rounded-full border-2 border-white shadow-lg"></div>
              <div class="absolute w-4 h-4 bg-kitovu-purple rounded-full animate-ping opacity-75"></div>
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(map);
    } else {
      markerRef.current.setLatLng(latlng);
    }

    // Update accuracy display
    if (accuracyDisplayRef.current) {
      accuracyDisplayRef.current.innerHTML = `Accuracy: ±${Math.round(accuracy)} meters`;
    }

    // Center map if accuracy has improved significantly
    const lastAccuracy = markerRef.current._prevAccuracy || Infinity;
    if (accuracy < lastAccuracy * 0.7) {
      map.setView(latlng);
      markerRef.current._prevAccuracy = accuracy;
    }

    // console.log('Location updated:', {
    //   lat: latitude,
    //   lng: longitude,
    //   accuracy: `${Math.round(accuracy)} meters`,
    //   timestamp: new Date().toISOString()
    // });
  };

  const handleClick = () => {
    setLocating(true);
    setError(null);

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocating(false);
        handleLocationUpdate(position);
      },
      (err) => {
        setLocating(false);
        setError(err.message);
        console.error('Location error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="white"
        size="icon"
        disabled={locating}
        className="bg-white shadow-md hover:bg-gray-100 p-3 rounded-lg h-12 w-12 flex items-center justify-center"
      >
        {locating ? (
          <div className="animate-spin h-5 w-5 border-2 border-kitovu-purple border-t-transparent rounded-full" />
        ) : (
          <MapPin className="h-7 w-7 text-kitovu-purple" strokeWidth={2.5} />
        )}
      </Button>
      {error && (
        <div className="absolute top-16 right-0 bg-red-100 text-red-600 p-2 rounded-md text-sm max-w-xs">
          {error}
        </div>
      )}
    </>
  );
};

export default LocationButton;