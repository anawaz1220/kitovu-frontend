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
    // Create a custom popup for Abia state
    const popupContent = L.DomUtil.create('div', 'custom-popup');
    popupContent.innerHTML = `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 12px; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; font-size: 18px; color: #4a1d96; border-bottom: 2px solid #4a1d96; padding-bottom: 5px;">
          ${feature.properties.name} State
        </h4>
        <p style="margin: 5px 0; display: flex; justify-content: space-between; font-size: 14px;">
          <strong>Type:</strong> <span>${feature.properties.type}</span>
        </p>
        <div style="margin-top: 10px; padding: 8px; background-color: #f8f9fa; border-radius: 4px;">
          <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">
            Click to view more details about this state
          </p>
        </div>
      </div>
    `;
    
    layer.bindPopup(popupContent);
    
    // Add hover effects
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#4a1d96',
          dashArray: '',
          fillOpacity: 0.3
        });
        
        layer.bringToFront();
      },
      mouseout: (e) => {
        const layer = e.target;
        // Reset to default state style
        layer.setStyle({
          fillColor: 'transparent',
          weight: 1.5,
          opacity: 1,
          color: '#8e44ad',
          fillOpacity: 0
        });
      }
    });
  }
};

export const onEachLGAFeature = (feature, layer) => {
  if (feature.properties) {
    // Create a custom popup for LGAs
    const popupContent = L.DomUtil.create('div', 'custom-popup');
    popupContent.innerHTML = `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 10px; min-width: 180px;">
        <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">
          ${feature.properties.name}
        </h4>
        <p style="margin: 5px 0; display: flex; justify-content: space-between; font-size: 13px;">
          <strong>Type:</strong> <span>${feature.properties.type}</span>
        </p>
        <p style="margin: 5px 0; display: flex; justify-content: space-between; font-size: 13px;">
          <strong>State:</strong> <span>${feature.properties.state_name}</span>
        </p>
        <div style="margin-top: 8px; padding: 6px; background-color: #dbeafe; border-radius: 4px;">
          <p style="margin: 0; font-size: 11px; color: #1e40af; text-align: center;">
            Local Government Area
          </p>
        </div>
      </div>
    `;
    
    layer.bindPopup(popupContent);
    
    // Add hover effects for LGAs
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: '#1d4ed8',
          dashArray: '',
          fillOpacity: 0.2
        });
        
        layer.bringToFront();
      },
      mouseout: (e) => {
        const layer = e.target;
        // Reset to default LGA style
        layer.setStyle({
          fillColor: 'transparent',
          weight: 1,
          opacity: 1,
          color: '#2563eb',
          fillOpacity: 0
        });
      }
    });
  }
};

export const safelyFitBounds = (map, layerRef) => {
  try {
    if (layerRef.current && layerRef.current.getBounds) {
      const bounds = layerRef.current.getBounds();
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 10 // Limit zoom level for state/LGA boundaries
        });
      }
    }
  } catch (error) {
    console.warn('Error fitting bounds:', error);
  }
};