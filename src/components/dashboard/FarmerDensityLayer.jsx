// src/components/dashboard/FarmerDensityLayer.jsx
import React, { useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { farmerDensityStyle, onEachDensityFeature } from './utils/densityUtils';
import FarmerDensityLegend from './FarmerDensityLegend';

/**
 * Component that renders the farmer density visualization
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the layer should be visible
 * @param {Object} props.stateData - GeoJSON data for states with farmer counts
 * @param {Object} props.lgaData - GeoJSON data for LGAs with farmer counts
 */
const FarmerDensityLayer = ({ 
  visible,
  stateData,
  lgaData 
}) => {
  // State to track which level of detail to show
  const [detailLevel, setDetailLevel] = useState('state'); // 'state' or 'lga'
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
        key={`farmer-density-${detailLevel}`}
        data={data}
        style={farmerDensityStyle}
        onEachFeature={onEachDensityFeature}
      />
      
      {/* Render the legend */}
      <FarmerDensityLegend visible={true} />
      
      {/* Detail level switcher - positioned at the bottom left */}
      <div 
        className="absolute bottom-4 left-4 bg-white rounded shadow-md z-500 text-sm"
        style={{ zIndex: 999 }}
      >
        <div className="p-2 font-medium border-b">
          Farmers Distribution
        </div>
        <div className="p-2 flex space-x-2">
          <button
            className={`px-2 py-1 rounded text-xs ${
              detailLevel === 'state' 
                ? 'bg-kitovu-purple text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setDetailLevel('state')}
          >
            State Level
          </button>
          <button
            className={`px-2 py-1 rounded text-xs ${
              detailLevel === 'lga' 
                ? 'bg-kitovu-purple text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setDetailLevel('lga')}
          >
            LGA Level
          </button>
        </div>
      </div>
    </>
  );
};

export default FarmerDensityLayer;