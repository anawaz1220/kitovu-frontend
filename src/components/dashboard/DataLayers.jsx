// src/components/dashboard/DataLayers.jsx
import React, { useEffect, useRef, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { 
  countryStyle, 
  stateStyle, 
  lgaStyle 
} from './utils/mapStyles';
import {
  onEachStateFeature,
  onEachLGAFeature,
  safelyFitBounds
} from './utils/mapInteractions';
import DistributionLayer from './DistributionLayer';
import useMapData from '../../hooks/useMapData';

/**
 * Component that renders all map data layers based on active selections
 */
const DataLayers = ({ activeLayers }) => {
  // Use our custom hook to fetch and manage all data
  const {
    farmerStateData,
    farmerLGAData,
    commodityStateData,
    commodityLGAData,
    stateData,
    lgaData,
    countryData,
    isLoading,
    error
  } = useMapData(activeLayers);
  
  // References for layer bounds
  const countryLayerRef = useRef(null);
  const stateLayerRef = useRef(null);
  const lgaLayerRef = useRef(null);
  
  // Track whether bounds have been fitted for each layer
  const [boundsFitted, setBoundsFitted] = useState({
    country: false,
    state: false,
    lga: false
  });
  
  // Track if user has interacted with map
  const [userInteracted, setUserInteracted] = useState(false);
  
  const map = useMap();
  
  // Detect user interaction with the map
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
    };
    
    map.on('zoomstart', handleUserInteraction);
    map.on('dragstart', handleUserInteraction);
    map.on('click', handleUserInteraction);
    
    return () => {
      map.off('zoomstart', handleUserInteraction);
      map.off('dragstart', handleUserInteraction);
      map.off('click', handleUserInteraction);
    };
  }, [map]);

  // Handle layer visibility and bounds fitting
  useEffect(() => {
    // Only fit bounds if:
    // 1. The layer is active
    // 2. We have data for that layer
    // 3. The bounds haven't been fitted yet
    // 4. The user hasn't interacted with the map
    
    if (activeLayers.countryBoundary && countryData && countryLayerRef.current && !boundsFitted.country && !userInteracted) {
      safelyFitBounds(map, countryLayerRef);
      setBoundsFitted(prev => ({ ...prev, country: true }));
    }
    
    if (activeLayers.stateBoundary && stateData && stateLayerRef.current && !boundsFitted.state && !userInteracted) {
      safelyFitBounds(map, stateLayerRef);
      setBoundsFitted(prev => ({ ...prev, state: true }));
    }
    
    if (activeLayers.lgaBoundary && lgaData && lgaLayerRef.current && !boundsFitted.lga && !userInteracted) {
      safelyFitBounds(map, lgaLayerRef);
      setBoundsFitted(prev => ({ ...prev, lga: true }));
    }
  }, [activeLayers, countryData, stateData, lgaData, map, boundsFitted, userInteracted]);
  
  // Reset fitted status when layers are turned off
  useEffect(() => {
    if (!activeLayers.countryBoundary) {
      setBoundsFitted(prev => ({ ...prev, country: false }));
    }
    if (!activeLayers.stateBoundary) {
      setBoundsFitted(prev => ({ ...prev, state: false }));
    }
    if (!activeLayers.lgaBoundary) {
      setBoundsFitted(prev => ({ ...prev, lga: false }));
    }
  }, [activeLayers]);

  // Show loading or error state if needed
  if (error) {
    console.error('Error loading map data:', error);
    // Could show an error overlay or message on the map if needed
  }

  return (
    <>
      {/* Country Boundary Layer */}
      {activeLayers.countryBoundary && countryData && (
        <GeoJSON 
          key="country-boundary"
          data={countryData} 
          style={countryStyle}
          ref={countryLayerRef}
          interactive={false}
        />
      )}
      
      {/* State Boundaries Layer */}
      {activeLayers.stateBoundary && stateData && stateData.features && stateData.features.length > 0 && (
        <GeoJSON 
          key="state-boundaries"
          data={stateData} 
          style={stateStyle}
          onEachFeature={onEachStateFeature}
          ref={(el) => {
            stateLayerRef.current = el;
          }}
        />
      )}
      
      {/* LGA Boundaries Layer */}
      {activeLayers.lgaBoundary && lgaData && lgaData.features && lgaData.features.length > 0 && (
        <GeoJSON 
          key="lga-boundaries"
          data={lgaData} 
          style={lgaStyle}
          onEachFeature={onEachLGAFeature}
          ref={(el) => {
            lgaLayerRef.current = el;
          }}
        />
      )}
      
      {/* Distribution Layers */}
      <DistributionLayer 
        activeLayers={activeLayers}
        farmerStateData={farmerStateData}
        farmerLGAData={farmerLGAData}
        commodityStateData={commodityStateData}
        commodityLGAData={commodityLGAData}
      />

      {/* Loading indicator could be added here */}
      {isLoading && (
        <div 
          className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded shadow z-1000 text-sm"
          style={{ zIndex: 1000 }}
        >
          Loading map data...
        </div>
      )}
    </>
  );
};

export default DataLayers;