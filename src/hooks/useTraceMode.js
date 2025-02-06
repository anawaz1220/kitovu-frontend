// src/hooks/useTraceMode.js
import { useState, useEffect, useRef } from 'react';
import * as turf from '@turf/turf';

const MIN_DISTANCE = 2; // Minimum 2 meters between points

// Helper function for distance calculation
const calculateDistance = (point1, point2) => {
  return turf.distance(
    turf.point([point1.lng, point1.lat]),
    turf.point([point2.lng, point2.lat]),
    { units: 'meters' }
  );
};

export const useTraceMode = ({ onTraceComplete }) => {
  const [isTracing, setIsTracing] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [tracePoints, setTracePoints] = useState([]);
  const watchIdRef = useRef(null);
  const lastPointRef = useRef(null);

  const startTracing = () => {
    setIsTracing(true);
    setTracePoints([]);
    
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          setAccuracy(position.coords.accuracy);

          // Check distance from last point
          if (lastPointRef.current) {
            const distance = calculateDistance(lastPointRef.current, newPoint);
            if (distance < MIN_DISTANCE) return;
          }

          setTracePoints(prev => [...prev, newPoint]);
          lastPointRef.current = newPoint;
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Error getting location. Please check your GPS settings.');
          stopTracing();
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  const stopTracing = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTracing(false);

    if (tracePoints.length >= 3) {
      // Close the polygon by adding the first point again
      const closedTrace = [...tracePoints, tracePoints[0]];
      onTraceComplete(closedTrace);
    }

    setTracePoints([]);
    lastPointRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    isTracing,
    accuracy,
    tracePoints,
    startTracing,
    stopTracing
  };
};