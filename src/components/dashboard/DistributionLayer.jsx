// src/components/dashboard/DistributionLayer.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { createFarmerDensityStyle, createCommodityDensityStyle } from './utils/dynamicDensityUtils';
import { createDensityFeatureInteraction, createCommodityFeatureInteraction } from './utils/dynamicFeatureInteractions';
import FarmerDensityLegend from './FarmerDensityLegend';
import CommodityDensityLegend from './CommodityDensityLegend';

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
  
  // Determine which layer is active
  const showFarmersByState = activeLayers.farmersByState;
  const showFarmersByLGA = activeLayers.farmersByLGA;
  const showCommodityByState = activeLayers.commodityByState;
  const showCommodityByLGA = activeLayers.commodityByLGA;
  
  // Determine which data to use
  const dataToUse = showFarmersByState ? farmerStateData :
                     showFarmersByLGA ? farmerLGAData :
                     showCommodityByState ? commodityStateData :
                     showCommodityByLGA ? commodityLGAData : null;
  
  // Skip rendering if no data or no active layer
  if (!dataToUse || (!showFarmersByState && !showFarmersByLGA && 
      !showCommodityByState && !showCommodityByLGA)) {
    return null;
  }
  
  // Create memoized style function based on active layer and data
  const styleFunction = useMemo(() => {
    if (showFarmersByState || showFarmersByLGA) {
      return createFarmerDensityStyle(dataToUse);
    } else {
      return createCommodityDensityStyle(dataToUse);
    }
  }, [dataToUse, showFarmersByState, showFarmersByLGA, showCommodityByState, showCommodityByLGA]);
  
  // Create memoized interaction function based on active layer and data
  const interactionFunction = useMemo(() => {
    if (showFarmersByState || showFarmersByLGA) {
      return createDensityFeatureInteraction(dataToUse);
    } else {
      return createCommodityFeatureInteraction(dataToUse);
    }
  }, [dataToUse, showFarmersByState, showFarmersByLGA, showCommodityByState, showCommodityByLGA]);
  
  // Create a key for the layer based on which one is active
  const layerKey = showFarmersByState ? 'farmers-state' :
                   showFarmersByLGA ? 'farmers-lga' :
                   showCommodityByState ? 'commodity-state' :
                   'commodity-lga';
  
  return (
    <>
      {/* Distribution Layer */}
      <GeoJSON
        key={layerKey}
        data={dataToUse}
        style={styleFunction}
        onEachFeature={interactionFunction}
      />
      
      {/* Farmer Legend */}
      {(showFarmersByState || showFarmersByLGA) && (
        <FarmerDensityLegend 
          visible={true} 
          data={dataToUse}
        />
      )}
      
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