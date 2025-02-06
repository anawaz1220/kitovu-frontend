// src/components/farmer/FarmInfo/components/FarmMap/ExistingFarms.jsx
import React from 'react';
import { Polygon } from 'react-leaflet';

const ExistingFarms = ({ farms, currentFarmId }) => {
  return farms.map((farm) => (
    <Polygon
      key={farm.id || farm.tempId}
      positions={farm.geometry.coordinates[0]}
      pathOptions={{
        color: '#7A2F99',
        fillColor: '#7A2F99',
        // Use different styling for previously drawn farms
        fillOpacity: farm.id ? 0.1 : 0.2,
        weight: 2,
        opacity: 0.8,
        // Use dashed line for previously saved farms
        dashArray: farm.id ? '5, 5' : null,
        // Highlight current farm being edited
        weight: farm.id === currentFarmId ? 3 : 2
      }}
    />
  ));
};

export default ExistingFarms;