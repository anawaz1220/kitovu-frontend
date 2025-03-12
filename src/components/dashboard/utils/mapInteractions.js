// src/components/dashboard/utils/mapInteractions.js
import L from 'leaflet';

export const onEachFarmerFeature = (feature, layer) => {
  if (feature.properties) {
    layer.bindPopup(`
      <div style="font-family: Arial, sans-serif; padding: 5px;">
        <h4 style="margin: 0 0 5px 0;">${feature.properties.name}</h4>
        <p style="margin: 0;"><strong>Farmers:</strong> ${feature.properties.farmer_count}</p>
      </div>
    `);
  }
};

export const onEachCropFeature = (feature, layer) => {
  if (feature.properties) {
    layer.bindPopup(`
      <div style="font-family: Arial, sans-serif; padding: 5px;">
        <h4 style="margin: 0 0 5px 0;">${feature.properties.name}</h4>
        <p style="margin: 0;"><strong>Farms:</strong> ${feature.properties.farms_count}</p>
        <p style="margin: 0;"><strong>Crop Area:</strong> ${feature.properties.crop_area?.toFixed(2) || 0} acres</p>
      </div>
    `);
  }
};

export const onEachStateFeature = (feature, layer) => {
  if (feature.properties) {
    // Create a custom popup
    const popupContent = L.DomUtil.create('div', 'custom-popup');
    popupContent.innerHTML = `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
        <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #4a1d96; border-bottom: 1px solid #eee; padding-bottom: 5px;">${feature.properties.name}</h4>
        <p style="margin: 0; display: flex; justify-content: space-between;">
          <strong>Farmers:</strong> <span>${feature.properties.farmer_count || 0}</span>
        </p>
      </div>
    `;
    
    layer.bindPopup(popupContent);
  }
};

export const onEachLGAFeature = (feature, layer) => {
  if (feature.properties) {
    // Remove tooltip functionality - LGA layer should not be hoverable
    // Only create popup for click
    layer.bindPopup(`
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
        <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #27ae60; border-bottom: 1px solid #eee; padding-bottom: 5px;">${feature.properties.name}</h4>
        <p style="margin: 0; display: flex; justify-content: space-between;">
          <strong>Farmers:</strong> <span>${feature.properties.farmer_count || 0}</span>
        </p>
      </div>
    `);
  }
};

export const safelyFitBounds = (map, layerRef) => {
  try {
    if (layerRef.current && layerRef.current.getBounds) {
      const bounds = layerRef.current.getBounds();
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds);
      }
    }
  } catch (error) {
    console.warn('Error fitting bounds:', error);
  }
};