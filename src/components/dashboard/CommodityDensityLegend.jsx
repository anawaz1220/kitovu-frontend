// src/components/dashboard/CommodityDensityLegend.jsx
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { createCommodityDensityLegend } from './utils/commodityUtils';

/**
 * Component that displays a legend for the commodity density layer
 * @param {boolean} visible - Whether the legend should be visible
 */
const CommodityDensityLegend = ({ visible }) => {
  const map = useMap();
  
  useEffect(() => {
    // Create legend control if it doesn't exist
    const legendControl = L.control({ position: 'bottomright' });
    
    legendControl.onAdd = function() {
      return createCommodityDensityLegend();
    };
    
    // Add legend when visible
    if (visible) {
      legendControl.addTo(map);
    }
    
    return () => {
      // Remove legend on unmount or when not visible
      if (legendControl) {
        map.removeControl(legendControl);
      }
    };
  }, [map, visible]);
  
  // This component doesn't render anything directly
  return null;
};

export default CommodityDensityLegend;