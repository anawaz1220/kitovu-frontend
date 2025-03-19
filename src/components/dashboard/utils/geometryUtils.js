// src/components/dashboard/utils/geometryUtils.js
import L from 'leaflet';

/**
 * Calculate the centroid of a GeoJSON geometry
 * @param {Object} geometry - GeoJSON geometry object
 * @returns {Array} - [latitude, longitude] coordinates
 */
export const calculateCentroid = (geometry) => {
  try {
    if (!geometry) return null;
    
    // Create a temporary Leaflet GeoJSON layer to calculate the center
    const layer = L.geoJSON(geometry);
    const bounds = layer.getBounds();
    return [bounds.getCenter().lat, bounds.getCenter().lng];
  } catch (error) {
    console.error('Error calculating centroid:', error);
    return null;
  }
};

/**
 * Determine if farms should be displayed as points or polygons based on zoom level
 * @param {number} currentZoom - Current map zoom level
 * @param {number} threshold - Zoom threshold for switching between points and polygons
 * @returns {boolean} - True if polygons should be shown, false for points
 */
export const shouldShowPolygons = (currentZoom, threshold = 10) => {
  return currentZoom >= threshold;
};

/**
 * Get the appropriate farm marker size based on zoom level
 * @param {number} currentZoom - Current map zoom level
 * @returns {number} - Marker radius
 */
export const getFarmMarkerSize = (currentZoom) => {
  // Scale marker size based on zoom level
  if (currentZoom < 6) return 3;
  if (currentZoom < 8) return 4;
  if (currentZoom < 10) return 5;
  return 6;
};

/**
 * Get farm style based on farm type
 * @param {Object} farm - Farm object
 * @returns {Object} - Leaflet style object
 */
export const getFarmStyle = (farm) => {
  // Colors for different farm types
  const farmTypeColors = {
    crop_farming: {
      color: '#4ade80', // Green border for crops
      fillColor: '#4ade80',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    },
    livestock_farming: {
      color: '#f97316', // Orange border for livestock
      fillColor: '#f97316',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    },
    mixed_farming: {
      color: '#8b5cf6', // Purple border for mixed
      fillColor: '#8b5cf6',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  };
  
  // Get style based on farm type or use default
  return farmTypeColors[farm.farm_type] || {
    color: '#3b82f6', // Blue default
    fillColor: '#3b82f6',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
  };
};