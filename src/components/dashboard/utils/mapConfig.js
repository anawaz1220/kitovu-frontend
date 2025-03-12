// src/components/dashboard/utils/mapConfig.js

// Default center position for Nigeria
export const defaultPosition = [9.0820, 8.6753];
export const defaultZoom = 6;

// Basemap URL configurations
export const basemapUrls = {
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
};

// Format GeoJSON from API response
export const formatGeoJsonFromResponse = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }
  
  return {
    type: 'FeatureCollection',
    features: data.map(item => ({
      type: 'Feature',
      properties: {
        name: item.name,
        farmer_count: item.farmer_count,
        farms_count: item.farms_count,
        crop_area: item.crop_area
      },
      geometry: item.geom ? JSON.parse(item.geom) : null
    })).filter(feature => feature.geometry !== null)
  };
};