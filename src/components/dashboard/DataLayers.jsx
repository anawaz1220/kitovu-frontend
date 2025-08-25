// src/components/dashboard/DataLayers.jsx
import React, { useEffect, useRef, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { 
  countryStyle, 
  stateStyle, 
  lgaStyle 
} from './utils/mapStyles';
import {
  onEachLGAFeature,
  safelyFitBounds
} from './utils/mapInteractions';
import DistributionLayer from './DistributionLayer';
import useMapData from '../../hooks/useMapData';

// Non-interactive state boundary feature handler (no hover, no popup, no click)
const onEachNonInteractiveStateFeature = (feature, layer) => {
  // Do nothing - completely non-interactive
  // No popup, no hover effects, no click handlers
  return;
};

/**
 * Component that renders all map data layers based on active selections
 */
const DataLayers = ({ 
  activeLayers,
  showFarmersOnMap = false,
  showFarmsOnMap = false,
  onToggleFarmersOnMap,
  onToggleFarmsOnMap
}) => {
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
  
  // Track which layers have been auto-fitted
  const [autoFittedLayers, setAutoFittedLayers] = useState(new Set());
  
  // Track previous layer states to detect when layers are toggled ON
  const [prevActiveLayers, setPrevActiveLayers] = useState({});
  
  // Track if user has manually interacted with map
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

  // Auto-fit to boundaries when layers are toggled ON
  useEffect(() => {
    // Check for newly activated boundary layers
    const checkAndFitLayer = (layerId, data, layerRef) => {
      const wasActive = prevActiveLayers[layerId];
      const isNowActive = activeLayers[layerId];
      
      // Only fit if:
      // 1. Layer was just turned ON (false -> true or undefined -> true)
      // 2. We have data for the layer
      // 3. Layer reference exists
      // 4. We haven't auto-fitted this layer before
      if (!wasActive && isNowActive && data && layerRef.current && !autoFittedLayers.has(layerId)) {
        console.log(`Auto-fitting to ${layerId}`);
        
        // Add a small delay to ensure the layer is rendered
        setTimeout(() => {
          try {
            const bounds = layerRef.current.getBounds();
            if (bounds && bounds.isValid()) {
              map.flyToBounds(bounds, {
                padding: [50, 50],
                animate: true,
                duration: 1.5
              });
              
              // Mark this layer as auto-fitted
              setAutoFittedLayers(prev => new Set([...prev, layerId]));
            }
          } catch (error) {
            console.error(`Error fitting to ${layerId}:`, error);
          }
        }, 300);
      }
    };

    // Check each boundary layer
    checkAndFitLayer('countryBoundary', countryData, countryLayerRef);
    checkAndFitLayer('stateBoundary', stateData, stateLayerRef);
    checkAndFitLayer('lgaBoundary', lgaData, lgaLayerRef);

    // Update previous layer states
    setPrevActiveLayers(activeLayers);
  }, [activeLayers, countryData, stateData, lgaData, map, autoFittedLayers]);
  
  // Reset auto-fitted status when layers are turned off
  useEffect(() => {
    const newAutoFitted = new Set(autoFittedLayers);
    
    if (!activeLayers.countryBoundary && autoFittedLayers.has('countryBoundary')) {
      newAutoFitted.delete('countryBoundary');
    }
    if (!activeLayers.stateBoundary && autoFittedLayers.has('stateBoundary')) {
      newAutoFitted.delete('stateBoundary');
    }
    if (!activeLayers.lgaBoundary && autoFittedLayers.has('lgaBoundary')) {
      newAutoFitted.delete('lgaBoundary');
    }
    
    if (newAutoFitted.size !== autoFittedLayers.size) {
      setAutoFittedLayers(newAutoFitted);
    }
  }, [activeLayers, autoFittedLayers]);

  // Show loading or error state if needed
  if (error) {
    console.error('Error loading map data:', error);
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
      
      {/* State Boundaries Layer - FIXED: Non-interactive, no hover, no popup */}
      {activeLayers.stateBoundary && stateData && stateData.features && stateData.features.length > 0 && (
        <GeoJSON 
          key="state-boundaries"
          data={stateData} 
          style={stateStyle}
          onEachFeature={onEachNonInteractiveStateFeature}
          ref={stateLayerRef}
          interactive={false}
        />
      )}
      
      {/* LGA Boundaries Layer */}
      {activeLayers.lgaBoundary && lgaData && lgaData.features && lgaData.features.length > 0 && (
        <GeoJSON 
          key="lga-boundaries"
          data={lgaData} 
          style={lgaStyle}
          onEachFeature={onEachLGAFeature}
          ref={lgaLayerRef}
        />
      )}
      
      {/* Distribution Layers */}
      <DistributionLayer 
        activeLayers={activeLayers}
        farmerStateData={farmerStateData}
        farmerLGAData={farmerLGAData}
        commodityStateData={commodityStateData}
        commodityLGAData={commodityLGAData}
        showFarmersOnMap={showFarmersOnMap}
        showFarmsOnMap={showFarmsOnMap}
        onToggleFarmersOnMap={onToggleFarmersOnMap}
        onToggleFarmsOnMap={onToggleFarmsOnMap}
      />

      {/* Loading indicator */}
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