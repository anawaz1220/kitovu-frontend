// src/components/dashboard/DistributionLayer.jsx
import React, { useState, useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { farmerDensityStyle, onEachDensityFeature } from './utils/densityUtils';
import { commodityDensityStyle, onEachCommodityFeature } from './utils/commodityUtils';
import FarmerDensityLegend from './FarmerDensityLegend';
import CommodityDensityLegend from './CommodityDensityLegend';

/**
 * Component that displays different distribution layers based on active selection
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
  
  // Choose styling and interaction based on layer type
  const styling = (showFarmersByState || showFarmersByLGA) ? 
                  farmerDensityStyle : commodityDensityStyle;
  
  const interaction = (showFarmersByState || showFarmersByLGA) ? 
                      onEachDensityFeature : onEachCommodityFeature;
  
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
        style={styling}
        onEachFeature={interaction}
      />
      
      {/* Farmer Legend */}
      {(showFarmersByState || showFarmersByLGA) && (
        <FarmerDensityLegend visible={true} />
      )}
      
      {/* Commodity Legend */}
      {(showCommodityByState || showCommodityByLGA) && (
        <CommodityDensityLegend visible={true} />
      )}
    </>
  );
};

export default DistributionLayer;