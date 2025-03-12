// src/components/dashboard/CommodityLayer.jsx
import React, { useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { commodityDensityStyle, onEachCommodityFeature } from './utils/commodityUtils';
import CommodityDensityLegend from './CommodityDensityLegend';

/**
 * Component that renders the commodity density visualization
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the layer should be visible
 * @param {string} props.detailLevel - 'state' or 'lga' to determine which data to show
 * @param {Object} props.stateData - GeoJSON data for states with commodity data
 * @param {Object} props.lgaData - GeoJSON data for LGAs with commodity data
 */
const CommodityLayer = ({ 
  visible,
  detailLevel,
  stateData,
  lgaData 
}) => {
  const map = useMap();
  
  // If the layer is not visible, don't render anything
  if (!visible) return null;
  
  // Select which data to use based on detail level
  const data = detailLevel === 'state' ? stateData : lgaData;
  
  // If no data is available, don't render anything
  if (!data || !data.features || data.features.length === 0) return null;
  
  return (
    <>
      {/* Render the density layer */}
      <GeoJSON 
        key={`commodity-${detailLevel}`}
        data={data}
        style={commodityDensityStyle}
        onEachFeature={onEachCommodityFeature}
      />
      
      {/* Render the legend */}
      <CommodityDensityLegend visible={true} />
    </>
  );
};

export default CommodityLayer;