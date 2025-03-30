// src/components/dashboard/utils/dynamicDensityUtils.js
import { calculateJenksBreaks, getColorFromBreaks } from './naturalBreaksUtils';

// Blue color scale for farmer density
const FARMER_COLORS = [
  '#F7FBFF', // Very light blue for zero values
  '#DEEBF7',
  '#C6DBEF',
  '#9ECAE1',
  '#6BAED6',
  '#4292C6',
  '#2171B5',
  '#084594'  // Dark blue for high values
];

// Green color scale for commodity density
const COMMODITY_COLORS = [
  '#F7FCF5', // Very light green for zero values
  '#E5F5E0',
  '#C7E9C0',
  '#A1D99B',
  '#74C476',
  '#41AB5D',
  '#238B45',
  '#005A32'  // Dark green for high values
];

/**
 * Generate color scale function for farmer density based on data distribution
 * @param {Object} geoJsonData - GeoJSON data with farmer counts
 * @returns {Function} - Function that returns color for a given count
 */
export const createFarmerDensityColorScale = (geoJsonData) => {
  // Extract farmer counts
  const farmerCounts = geoJsonData && geoJsonData.features ? 
    geoJsonData.features
      .map(f => f.properties.farmer_count)
      .filter(count => count !== undefined && count !== null && count > 0) :
    [];
  
  // Calculate breaks
  const breaks = [0];
  if (farmerCounts.length > 0) {
    const calculatedBreaks = calculateJenksBreaks(farmerCounts, 5);
    breaks.push(...calculatedBreaks);
  } else {
    // Fallback to default breaks
    breaks.push(1, 10, 20, 30, 40);
  }
  
  // Remove duplicates and ensure ascending order
  const uniqueBreaks = [...new Set(breaks)].sort((a, b) => a - b);
  
  // Return color function
  return (count) => {
    if (count === 0 || count === undefined || count === null) {
      return 'transparent';
    }
    return getColorFromBreaks(count, uniqueBreaks, FARMER_COLORS.slice(1));
  };
};

/**
 * Generate style function for farmer density choropleth
 * @param {Object} geoJsonData - GeoJSON data with farmer counts
 * @returns {Function} - Style function for Leaflet GeoJSON layer
 */
export const createFarmerDensityStyle = (geoJsonData) => {
  const getColor = createFarmerDensityColorScale(geoJsonData);
  
  return (feature) => {
    const count = feature.properties.farmer_count || 0;
    
    return {
      fillColor: getColor(count),
      weight: 1,
      opacity: 1,
      color: count === 0 ? '#CCCCCC' : 'white',
      dashArray: count === 0 ? '3' : '',
      fillOpacity: count === 0 ? 0.1 : 0.7
    };
  };
};

/**
 * Generate color scale function for commodity density based on data distribution
 * @param {Object} geoJsonData - GeoJSON data with crop areas
 * @returns {Function} - Function that returns color for a given area
 */
export const createCommodityDensityColorScale = (geoJsonData) => {
  // Extract crop areas
  const cropAreas = geoJsonData && geoJsonData.features ? 
    geoJsonData.features
      .map(f => f.properties.crop_area)
      .filter(area => area !== undefined && area !== null && area > 0) :
    [];
  
  // Calculate breaks
  const breaks = [0];
  if (cropAreas.length > 0) {
    const calculatedBreaks = calculateJenksBreaks(cropAreas, 5);
    breaks.push(...calculatedBreaks);
  } else {
    // Fallback to default breaks
    breaks.push(1, 100, 200, 500, 1000);
  }
  
  // Remove duplicates and ensure ascending order
  const uniqueBreaks = [...new Set(breaks)].sort((a, b) => a - b);
  
  // Return color function
  return (area) => {
    if (area === 0 || area === undefined || area === null) {
      return 'transparent';
    }
    return getColorFromBreaks(area, uniqueBreaks, COMMODITY_COLORS.slice(1));
  };
};

/**
 * Generate style function for commodity density choropleth
 * @param {Object} geoJsonData - GeoJSON data with crop areas
 * @returns {Function} - Style function for Leaflet GeoJSON layer
 */
export const createCommodityDensityStyle = (geoJsonData) => {
  const getColor = createCommodityDensityColorScale(geoJsonData);
  
  return (feature) => {
    const area = feature.properties.crop_area || 0;
    
    return {
      fillColor: getColor(area),
      weight: 1,
      opacity: 1,
      color: area === 0 ? '#CCCCCC' : 'white',
      dashArray: area === 0 ? '3' : '',
      fillOpacity: area === 0 ? 0.1 : 0.7
    };
  };
};