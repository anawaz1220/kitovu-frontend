// src/components/farmer/FarmInfo/hooks/useFarmDrawing.js
import { useState, useCallback } from 'react';
import { 
  calculatePolygonArea,
  checkPolygonOverlap,
  coordsToMultiPolygon
} from './utils/geometryHelpers';

export const useFarmDrawing = ({ 
  existingFarms,
  onGeometryUpdate,
  onAreaUpdate 
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  
  const handleDrawingComplete = useCallback((coordinates) => {
    // Calculate area
    const areaInHectares = calculatePolygonArea(coordinates);
    onAreaUpdate(areaInHectares);

    // Check for overlap
    const hasOverlap = checkPolygonOverlap(coordinates, existingFarms);

    // Create MultiPolygon string
    const multiPolygon = coordsToMultiPolygon(coordinates);
    
    // Update parent component
    onGeometryUpdate(multiPolygon, coordinates, hasOverlap);
    
    // End drawing mode
    setIsDrawing(false);
  }, [existingFarms, onGeometryUpdate, onAreaUpdate]);

  const startDrawing = useCallback(() => {
    setIsDrawing(true);
  }, []);

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  return {
    isDrawing,
    startDrawing,
    cancelDrawing,
    handleDrawingComplete
  };
};