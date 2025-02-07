import * as turf from '@turf/turf';

export const calculateArea = (coordinates) => {
    try {
      // If coordinates is a MultiPolygon format (array of polygons)
      if (Array.isArray(coordinates[0][0][0])) {
        // Sum up areas of all polygons in the MultiPolygon
        return coordinates.reduce((totalArea, polygonCoords) => {
          const polygon = turf.polygon([polygonCoords[0]]);
          const area = turf.area(polygon);
          return totalArea + area;
        }, 0) / 10000; // Convert to hectares
      }
      
      // If coordinates is a single Polygon format
      const polygon = turf.polygon([coordinates]);
      const area = turf.area(polygon);
      return (area / 10000).toFixed(2); // Convert to hectares
    } catch (error) {
      console.error('Error calculating area:', error);
      return 0;
    }
  };

  export const checkOverlap = (newPolygon, existingFarms) => {
    if (!existingFarms || existingFarms.length === 0) return false;
    
    try {
      const newPoly = turf.polygon([newPolygon.geometry.coordinates[0]]);
      
      return existingFarms.some(farm => {
        if (!farm.geometry || !farm.geometry.coordinates) return false;
        
        try {
          const coordinates = Array.isArray(farm.geometry.coordinates[0][0]) ? 
              farm.geometry.coordinates[0] : [farm.geometry.coordinates[0]];
          const existingPoly = turf.polygon(coordinates);
          const intersection = turf.booleanOverlap(newPoly, existingPoly);
          return intersection;
        } catch (e) {
          console.error('Error processing farm geometry:', e);
          return false;
        }
      });
    } catch (error) {
      console.error('Error checking overlap:', error);
      return false;
    }
  };