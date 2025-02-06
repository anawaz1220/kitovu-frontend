// src/components/farmer/FarmInfo/mapUtils.js
import * as turf from '@turf/turf';

/**
 * Ensure polygon is closed by adding first point as last if needed
 */
const ensureClosedPolygon = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return coordinates;
  
  const firstPoint = coordinates[0];
  const lastPoint = coordinates[coordinates.length - 1];
  
  if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
    return [...coordinates, firstPoint];
  }
  
  return coordinates;
};

/**
 * Convert square meters to hectares
 */
export const squareMetersToHectares = (squareMeters) => {
  return squareMeters / 10000;
};

/**
 * Calculate area of a polygon in hectares
 */
export const calculateAreaInHectares = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return 0;
  
  try {
    const closedCoords = ensureClosedPolygon(coordinates);
    const polygon = turf.polygon([closedCoords]);
    const area = turf.area(polygon);
    return parseFloat((squareMetersToHectares(area)).toFixed(1));
  } catch (error) {
    console.error('Error calculating area:', error);
    return 0;
  }
};

/**
 * Check if a polygon overlaps with any existing farms
 */
export const checkOverlapWithExistingFarms = (newPolygon, existingFarms) => {
  if (!newPolygon || newPolygon.length < 3) return false;

  try {
    const closedNewPolygon = ensureClosedPolygon(newPolygon);
    const polygonFeature = turf.polygon([closedNewPolygon]);
    
    return existingFarms.some(farm => {
      if (!farm.geometry || !farm.geometry.coordinates) return false;
      const farmPolygon = turf.polygon([farm.geometry.coordinates[0]]);
      return turf.booleanOverlap(polygonFeature, farmPolygon) || 
             turf.booleanContains(polygonFeature, farmPolygon) ||
             turf.booleanContains(farmPolygon, polygonFeature);
    });
  } catch (error) {
    console.error('Error checking overlap:', error);
    return false;
  }
};

/**
 * Convert to MULTIPOLYGON format for API
 */
export const coordsToMultiPolygon = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return null;

  const closedCoords = ensureClosedPolygon(coordinates);
  return `MULTIPOLYGON(((${closedCoords.map(coord => coord.join(' ')).join(',')})))`;
};

/**
 * Simplify polygon to reduce number of points
 */
export const simplifyPolygon = (coordinates, tolerance = 0.00001) => {
  if (!coordinates || coordinates.length < 3) return coordinates;
  
  try {
    const closedCoords = ensureClosedPolygon(coordinates);
    const polygon = turf.polygon([closedCoords]);
    const simplified = turf.simplify(polygon, { tolerance });
    return simplified.geometry.coordinates[0];
  } catch (error) {
    console.error('Error simplifying polygon:', error);
    return coordinates;
  }
};