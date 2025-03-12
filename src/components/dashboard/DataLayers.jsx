// src/components/dashboard/DataLayers.jsx
import React, { useEffect, useRef } from 'react';
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
  
  const map = useMap();

  // Handle layer visibility and bounds fitting
  useEffect(() => {
    if (activeLayers.countryBoundary && countryData && countryLayerRef.current) {
      safelyFitBounds(map, countryLayerRef);
    }
    
    if (activeLayers.stateBoundary && stateData && stateLayerRef.current) {
      safelyFitBounds(map, stateLayerRef);
    }
    
    if (activeLayers.lgaBoundary && lgaData && lgaLayerRef.current) {
      safelyFitBounds(map, lgaLayerRef);
    }
  }, [activeLayers, countryData, stateData, lgaData, map]);

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
            if (el && activeLayers.stateBoundary) {
              safelyFitBounds(map, { current: el });
            }
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
            if (el && activeLayers.lgaBoundary) {
              safelyFitBounds(map, { current: el });
            }
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