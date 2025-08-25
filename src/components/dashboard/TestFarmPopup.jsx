import React from 'react';
import { Popup } from 'react-leaflet';

/**
 * Very simple test popup to check if farm polygons are clickable
 */
const TestFarmPopup = ({ farm }) => {
  return (
    <Popup>
      <div style={{ padding: '10px', minWidth: '200px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#059669' }}>
          🎉 FARM CLICKED! 
        </h3>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Farm ID:</strong> {farm?.farm_id || farm?.id || 'No ID'}
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Coordinates:</strong> 
          {farm?.centroid_latitude && farm?.centroid_longitude 
            ? `${farm.centroid_latitude}, ${farm.centroid_longitude}`
            : 'Not available'
          }
        </p>
        <div style={{ 
          marginTop: '10px', 
          padding: '8px', 
          background: '#dcfce7', 
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#166534'
        }}>
          ✅ Farm polygon is clickable!
        </div>
      </div>
    </Popup>
  );
};

export default TestFarmPopup;