// src/components/dashboard/utils/mapConfig.js
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../../config/mapSettings';

// Export default center position from centralized config
export const defaultPosition = DEFAULT_MAP_CENTER;
export const defaultZoom = DEFAULT_MAP_ZOOM;

// Basemap URL configurations
export const basemapUrls = {
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=AIzaSyDzO4pxK2nMTz5xjpESMYZ0ZysAG1kJuxw',
  // dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
  dark: 'https://cartodb-basemaps-a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

};

/**
 * Format GeoJSON from API response
 * @param {Array} data - Array of location data with geom field
 * @returns {Object|null} GeoJSON FeatureCollection or null if invalid data
 */
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