// src/components/dashboard/utils/dynamicFeatureInteractions.js
import { createFarmerDensityStyle, createCommodityDensityStyle } from './dynamicDensityUtils';

/**
 * Feature interaction when clicking on a state/LGA in the farmer density map
 * @param {Object} geoJsonData - The complete GeoJSON data for styling on hover
 * @returns {Function} - Function to handle feature interactions
 */
export const createDensityFeatureInteraction = (geoJsonData) => {
  // Get the style function for this dataset
  const baseStyle = createFarmerDensityStyle(geoJsonData);
  
  return (feature, layer) => {
    if (feature.properties) {
      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'custom-popup';
      
      popupContent.innerHTML = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #084081; border-bottom: 1px solid #eee; padding-bottom: 5px;">${feature.properties.name}</h4>
          <p style="margin: 0; display: flex; justify-content: space-between;">
            <strong>Farmers Count:</strong> <span>${feature.properties.farmer_count || 0}</span>
          </p>
        </div>
      `;
      
      // Bind popup to layer
      layer.bindPopup(popupContent);
      
      // Highlight on hover
      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.8
          });
          
          layer.bringToFront();
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle(baseStyle(feature));
        }
      });
    }
  };
};

/**
 * Feature interaction when clicking on a state/LGA in the commodity density map
 * @param {Object} geoJsonData - The complete GeoJSON data for styling on hover
 * @returns {Function} - Function to handle feature interactions
 */
export const createCommodityFeatureInteraction = (geoJsonData) => {
  // Get the style function for this dataset
  const baseStyle = createCommodityDensityStyle(geoJsonData);
  
  return (feature, layer) => {
    if (feature.properties) {
      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'custom-popup';
      
      popupContent.innerHTML = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #238b45; border-bottom: 1px solid #eee; padding-bottom: 5px;">${feature.properties.name}</h4>
          <p style="margin: 0; display: flex; justify-content: space-between;">
            <strong>Farms Count:</strong> <span>${feature.properties.farms_count || 0}</span>
          </p>
          <p style="margin: 5px 0 0 0; display: flex; justify-content: space-between;">
            <strong>Crop Area:</strong> <span>${feature.properties.crop_area ? feature.properties.crop_area.toFixed(2) : 0} acres</span>
          </p>
        </div>
      `;
      
      // Bind popup to layer
      layer.bindPopup(popupContent);
      
      // Highlight on hover
      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.8
          });
          
          layer.bringToFront();
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle(baseStyle(feature));
        }
      });
    }
  };
};