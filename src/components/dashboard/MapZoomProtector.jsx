// src/components/dashboard/MapZoomProtector.jsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Component that prevents unwanted zoom resets on the map.
 * This is a drastic measure to stop any component from resetting zoom.
 * 
 * This uses a more aggressive approach by:
 * 1. Overriding map navigation methods
 * 2. Setting a protection period after user interaction
 * 3. Providing console logs for debugging
 */
const MapZoomProtector = () => {
  const map = useMap();
  const initialSetupDone = useRef(false);
  const userZoomRef = useRef(null);
  const isUserInteractingRef = useRef(false);
  const originalFitBounds = useRef(null);
  const originalFlyTo = useRef(null);
  const originalFlyToBounds = useRef(null);
  
  // Override problematic map methods to prevent unwanted zoom resets
  useEffect(() => {
    if (initialSetupDone.current) return;
    
    // Used to track the last zoom operation time
    let lastZoomTime = Date.now();
    let userHasInteracted = false;
    const ZOOM_COOLDOWN = 2000; // 2 seconds cooldown between programmatic zooms
    
    // Save original methods
    originalFitBounds.current = map.fitBounds;
    originalFlyTo.current = map.flyTo;
    originalFlyToBounds.current = map.flyToBounds;
    
    // Override methods to check for user interaction
    map.fitBounds = function(...args) {
      const now = Date.now();
      
      // Always block if user is actively interacting
      if (isUserInteractingRef.current) {
        console.log('🛑 Blocked fitBounds - User actively interacting');
        return map;
      }
      
      // Block if the user has ever interacted with the map (drastic)
      if (userHasInteracted) {
        console.log('🛑 Blocked fitBounds - User has previously interacted');
        return map;
      }
      
      // Block if we've recently done a zoom operation
      if (now - lastZoomTime < ZOOM_COOLDOWN) {
        console.log('🛑 Blocked fitBounds - Too soon after last zoom');
        return map;
      }
      
      console.log('✅ Allowing fitBounds');
      lastZoomTime = now;
      return originalFitBounds.current.apply(this, args);
    };
    
    map.flyTo = function(...args) {
      const now = Date.now();
      
      // Always block if user is actively interacting
      if (isUserInteractingRef.current) {
        console.log('🛑 Blocked flyTo - User actively interacting');
        return map;
      }
      
      // Block if the user has ever interacted with the map (drastic)
      if (userHasInteracted) {
        console.log('🛑 Blocked flyTo - User has previously interacted');
        return map;
      }
      
      // Block if we've recently done a zoom operation
      if (now - lastZoomTime < ZOOM_COOLDOWN) {
        console.log('🛑 Blocked flyTo - Too soon after last zoom');
        return map;
      }
      
      console.log('✅ Allowing flyTo');
      lastZoomTime = now;
      return originalFlyTo.current.apply(this, args);
    };
    
    map.flyToBounds = function(...args) {
      const now = Date.now();
      
      // Always block if user is actively interacting
      if (isUserInteractingRef.current) {
        console.log('🛑 Blocked flyToBounds - User actively interacting');
        return map;
      }
      
      // Block if the user has ever interacted with the map (drastic)
      if (userHasInteracted) {
        console.log('🛑 Blocked flyToBounds - User has previously interacted');
        return map;
      }
      
      // Block if we've recently done a zoom operation
      if (now - lastZoomTime < ZOOM_COOLDOWN) {
        console.log('🛑 Blocked flyToBounds - Too soon after last zoom');
        return map;
      }
      
      console.log('✅ Allowing flyToBounds');
      lastZoomTime = now;
      return originalFlyToBounds.current.apply(this, args);
    };

    // Track user interactions
    const handleZoomStart = () => {
      console.log('🔍 User initiated zoom');
      isUserInteractingRef.current = true;
      userHasInteracted = true; // Mark that user has interacted with map
      
      clearTimeout(userZoomRef.current);
      userZoomRef.current = setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 5000); // Protect for 5 seconds after zoom
    };
    
    const handleDragStart = () => {
      console.log('✋ User initiated drag');
      isUserInteractingRef.current = true;
      userHasInteracted = true; // Mark that user has interacted with map
      
      clearTimeout(userZoomRef.current);
      userZoomRef.current = setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 5000); // Protect for 5 seconds after drag
    };
    
    // Track when user clicks on map
    const handleClick = () => {
      console.log('👆 User clicked on map');
      userHasInteracted = true; // Mark that user has interacted with map
    };
    
    map.on('zoomstart', handleZoomStart);
    map.on('dragstart', handleDragStart);
    map.on('click', handleClick);
    
    initialSetupDone.current = true;
    
    // Cleanup
    return () => {
      // Restore original methods
      if (originalFitBounds.current) map.fitBounds = originalFitBounds.current;
      if (originalFlyTo.current) map.flyTo = originalFlyTo.current;
      if (originalFlyToBounds.current) map.flyToBounds = originalFlyToBounds.current;
      
      map.off('zoomstart', handleZoomStart);
      map.off('dragstart', handleDragStart);
      map.off('click', handleClick);
    };
  }, [map]);
  
  return null;
};

export default MapZoomProtector;