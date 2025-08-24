// src/components/dashboard/DistributionLayer.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createFarmerDensityStyle, createCommodityDensityStyle } from './utils/dynamicDensityUtils';
import { createDensityFeatureInteraction, createCommodityFeatureInteraction } from './utils/dynamicFeatureInteractions';
import FarmerDensityLegend from './FarmerDensityLegend';
import CommodityDensityLegend from './CommodityDensityLegend';
import AbiaStateSummaryLayer from './AbiaStateSummaryLayer';
import AbiaLGASummaryLayer from './AbiaLGASummaryLayer';

/**
 * Component that displays different distribution layers based on active selection
 * with dynamic styling based on actual data distribution
 */
const DistributionLayer = ({ 
  activeLayers,
  farmerStateData,
  farmerLGAData,
  commodityStateData,
  commodityLGAData
}) => {
  const map = useMap();
  const [hasFittedBounds, setHasFittedBounds] = useState({
    farmersByState: false,
    farmersByLGA: false,
    commodityByState: false,
    commodityByLGA: false
  });
  
  // Determine which layer is active
  const showFarmersByState = activeLayers.farmersByState;
  const showFarmersByLGA = activeLayers.farmersByLGA;
  const showCommodityByState = activeLayers.commodityByState;
  const showCommodityByLGA = activeLayers.commodityByLGA;
  
  // Function to fit bounds to layer data
  const fitBoundsToLayer = (data, layerKey) => {
    if (!data || !data.features || data.features.length === 0) return;
    if (hasFittedBounds[layerKey]) return;
    
    try {
      // Create a temporary GeoJSON layer to get bounds
      const tempLayer = L.geoJSON(data);
      const bounds = tempLayer.getBounds();
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 10
        });
        
        // Mark this layer as having fitted bounds
        setHasFittedBounds(prev => ({ ...prev, [layerKey]: true }));
      }
    } catch (error) {
      console.error('Error fitting bounds to layer:', error);
    }
  };
  
  // Reset fitted bounds when layers are turned off
  useEffect(() => {
    setHasFittedBounds({
      farmersByState: showFarmersByState,
      farmersByLGA: showFarmersByLGA, 
      commodityByState: showCommodityByState,
      commodityByLGA: showCommodityByLGA
    });
  }, [showFarmersByState, showFarmersByLGA, showCommodityByState, showCommodityByLGA]);
  
  // Fit bounds when layers become active and data is available
  useEffect(() => {
    if (showFarmersByState && farmerStateData) {
      // For Abia State Summary, we'll handle this in AbiaStateSummaryLayer
      // But we still fit bounds to the data if available
      fitBoundsToLayer(farmerStateData, 'farmersByState');
    }
    if (showFarmersByLGA && farmerLGAData) {
      // For Abia LGA Summary, we'll handle this in AbiaLGASummaryLayer
      // But we still fit bounds to the data if available
      fitBoundsToLayer(farmerLGAData, 'farmersByLGA');
    }
    if (showCommodityByState && commodityStateData) {
      fitBoundsToLayer(commodityStateData, 'commodityByState');
    }
    if (showCommodityByLGA && commodityLGAData) {
      fitBoundsToLayer(commodityLGAData, 'commodityByLGA');
    }
  }, [
    showFarmersByState, farmerStateData,
    showFarmersByLGA, farmerLGAData,
    showCommodityByState, commodityStateData,
    showCommodityByLGA, commodityLGAData,
    map
  ]);
  
  // Check if we should show the new Abia State Summary instead of the old farmer by state
  if (showFarmersByState) {
    return <AbiaStateSummaryLayer visible={true} />;
  }
  
  // Check if we should show the new Abia LGA Summary instead of the old farmer by LGA
  if (showFarmersByLGA) {
    return <AbiaLGASummaryLayer visible={true} />;
  }
  
  // Determine which data to use for other layers
  const dataToUse = showCommodityByState ? commodityStateData :
                     showCommodityByLGA ? commodityLGAData : null;
  
  // Skip rendering if no data or no active layer
  if (!dataToUse || (!showCommodityByState && !showCommodityByLGA)) {
    return null;
  }
  
  // Create memoized style function based on active layer and data
  const styleFunction = useMemo(() => {
    return createCommodityDensityStyle(dataToUse);
  }, [dataToUse, showCommodityByState, showCommodityByLGA]);
  
  // Create memoized interaction function based on active layer and data
  const interactionFunction = useMemo(() => {
    return createCommodityFeatureInteraction(dataToUse);
  }, [dataToUse, showCommodityByState, showCommodityByLGA]);
  
  // Create a key for the layer based on which one is active
  const layerKey = showCommodityByState ? 'commodity-state' : 'commodity-lga';
  
  return (
    <>
      {/* Distribution Layer */}
      <GeoJSON
        key={layerKey}
        data={dataToUse}
        style={styleFunction}
        onEachFeature={interactionFunction}
      />
      
      {/* Commodity Legend */}
      {(showCommodityByState || showCommodityByLGA) && (
        <CommodityDensityLegend 
          visible={true} 
          data={dataToUse}
        />
      )}
    </>
  );
};

export default DistributionLayer;