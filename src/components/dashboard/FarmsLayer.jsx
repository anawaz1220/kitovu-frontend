// src/components/dashboard/FarmsLayer.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GeoJSON, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import farmService from '../../services/api/farms.service';
import FarmPopup from './FarmPopup';
import FarmVisualizationInfo from './FarmVisualizationInfo';
import { calculateCentroid, getFarmStyle, shouldShowPolygons, getFarmMarkerSize } from './utils/geometryUtils';

// Export to make available for direct imports in other components
export { ZOOM_THRESHOLD };

// Zoom threshold for switching between point and polygon rendering
const ZOOM_THRESHOLD = 10; // Adjust this value based on testing

/**
 * Component that renders farms as a layer on the map
 */
const FarmsLayer = ({ 
  visible = false,
  filterParams = {},
  onFarmsLoaded = () => {},
  onSelectFarm = () => {},
  preventAutoZoom = false // New flag to prevent auto-zooming
}) => {
  const [allFarms, setAllFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  
  // Refs to track state without causing re-renders
  const dataFetchedRef = useRef(false);
  const boundsSetRef = useRef(false);
  const prevFilterParamsRef = useRef(null);
  
  // Update zoom level when map is zoomed
  useEffect(() => {
    let userInitiatedZoom = false;
    
    const handleZoomStart = () => {
      userInitiatedZoom = true;
      console.log('User zoom detected');
    };
    
    const handleZoomEnd = () => {
      setCurrentZoom(map.getZoom());
      
      // If this was a user-initiated zoom, set a flag to prevent future auto-zooms
      if (userInitiatedZoom) {
        boundsSetRef.current = true; // Prevent auto-fitting bounds after user zoom
        userInitiatedZoom = false;
      }
    };
    
    map.on('zoomstart', handleZoomStart);
    map.on('zoomend', handleZoomEnd);
    
    return () => {
      map.off('zoomstart', handleZoomStart);
      map.off('zoomend', handleZoomEnd);
    };
  }, [map]);

  // Preprocess farm data to add centroids
  const farmsWithCentroids = useMemo(() => {
    return filteredFarms.map(farm => {
      if (!farm.centroid && farm.geom) {
        const centroid = calculateCentroid(farm.geom);
        return { ...farm, centroid };
      }
      return farm;
    });
  }, [filteredFarms]);
  
  // Fetch all farms data once when component becomes visible
  useEffect(() => {
    // Skip if not visible or already fetched
    if (!visible || dataFetchedRef.current) return;
    
    const fetchFarms = async () => {
      setIsLoading(true);
      try {
        const data = await farmService.getFarms();
        setAllFarms(data);
        dataFetchedRef.current = true;
      } catch (err) {
        console.error('Error fetching farms:', err);
        setError('Failed to load farms data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFarms();
  }, [visible]);
  
  // Apply filters when allFarms or filterParams change
  useEffect(() => {
    // Skip if not visible or no farms data
    if (!visible || allFarms.length === 0) return;
    
    const currentFilterString = JSON.stringify(filterParams);
    const prevFilterString = JSON.stringify(prevFilterParamsRef.current);
    
    // Skip if filters haven't changed and we already have filtered farms
    if (currentFilterString === prevFilterString && filteredFarms.length > 0) return;
    
    // Save current filters for comparison next time
    prevFilterParamsRef.current = {...filterParams};
    
    // Filter farms based on filterParams
    let filtered = [...allFarms];
    
    if (filterParams.farm_type !== undefined) {
      // Filter by farm type if specified
      if (filterParams.farm_type) {
        filtered = filtered.filter(farm => farm.farm_type === filterParams.farm_type);
      }
    } 
    else if (filterParams.crop_type !== undefined) {
      // Filter by crop type if specified
      if (filterParams.crop_type) {
        filtered = filtered.filter(farm => farm.crop_type === filterParams.crop_type);
      }
      // If crop_type is empty string, keep all farms with any crop_type
      else {
        filtered = filtered.filter(farm => farm.crop_type);
      }
    } 
    else if (filterParams.livestock_type !== undefined) {
      // Filter by livestock type if specified
      if (filterParams.livestock_type) {
        filtered = filtered.filter(farm => farm.livestock_type === filterParams.livestock_type);
      }
      // If livestock_type is empty string, keep all farms with any livestock_type
      else {
        filtered = filtered.filter(farm => farm.livestock_type);
      }
    }
    
    // Update state with filtered farms
    setFilteredFarms(filtered);
    
    // Call callback with filtered farms
    onFarmsLoaded(filtered);
    
    // Reset the bounds flag when filters change
    if (currentFilterString !== prevFilterString) {
      boundsSetRef.current = false;
    }
  }, [visible, allFarms, filterParams, onFarmsLoaded]);
  
  // Fit map to bounds when filtered farms change - but only on initial load
  useEffect(() => {
    // Skip if:
    // - Layer is not visible
    // - No filtered farms
    // - Bounds already set
    // - Auto-zoom is explicitly prevented
    if (!visible || filteredFarms.length === 0 || boundsSetRef.current || preventAutoZoom) {
      // Mark as fitted if preventing auto-zoom
      if (preventAutoZoom) {
        boundsSetRef.current = true;
      }
      return;
    }
    
    // Check if this is an initial load or a filter change
    const isFilterChange = prevFilterParamsRef.current && Object.keys(prevFilterParamsRef.current).length > 0;
    
    // Only fit to bounds on initial load, not on manual zooming
    if (isFilterChange) {
      boundsSetRef.current = true;
      return;
    }
    
    console.log("AUTO-FITTING TO BOUNDS NOW");
    
    // Create a feature collection from farm geometries
    const features = filteredFarms
      .filter(farm => farm.geom)
      .map(farm => ({
        type: 'Feature',
        geometry: farm.geom
      }));
    
    if (features.length > 0) {
      try {
        const featureCollection = {
          type: 'FeatureCollection',
          features
        };
        
        // Create a temporary layer and get bounds
        const tempLayer = L.geoJSON(featureCollection);
        const bounds = tempLayer.getBounds();
        
        if (bounds.isValid()) {
          // Add a small delay to ensure map is ready
          setTimeout(() => {
            // Fit bounds with padding
            map.fitBounds(bounds, {
              padding: [50, 50],
              animate: true
            });
          }, 100);
          
          boundsSetRef.current = true;
        }
      } catch (e) {
        console.error('Error fitting to farm bounds:', e);
      }
    }
  }, [visible, filteredFarms, map, preventAutoZoom]);
  
  // Handle farm click
  const handleFarmClick = (farm) => {
    if (onSelectFarm && typeof onSelectFarm === 'function') {
      onSelectFarm(farm);
    }
  };
  
  // Don't render anything if layer is not visible
  if (!visible) return null;
  
  // Determine rendering mode based on zoom level
  const showPolygons = shouldShowPolygons(currentZoom, ZOOM_THRESHOLD);
  const markerRadius = getFarmMarkerSize(currentZoom);
  
  // Render farms layer
  return (
    <>
      {farmsWithCentroids.length > 0 ? (
        farmsWithCentroids.map(farm => {
          // Skip farms without geometry
          if (!farm.geom) return null;
          
          // Get farm style
          const style = getFarmStyle(farm);
          
          // Render as point for low zoom levels
          if (!showPolygons && farm.centroid) {
            return (
              <CircleMarker
                key={farm.id}
                center={farm.centroid}
                radius={markerRadius}
                pathOptions={{
                  fillColor: style.fillColor,
                  color: style.color,
                  fillOpacity: 0.8,
                  weight: 1.5
                }}
                eventHandlers={{
                  click: () => handleFarmClick(farm)
                }}
              >
                <FarmPopup farm={farm} includeFarmerDetails={false} />
              </CircleMarker>
            );
          }
          
          // Render as polygon for high zoom levels
          return (
            <GeoJSON
              key={farm.id}
              data={farm.geom}
              style={() => style}
              eventHandlers={{
                click: () => handleFarmClick(farm)
              }}
            >
              <FarmPopup farm={farm} includeFarmerDetails={false} />
            </GeoJSON>
          );
        })
      ) : !isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-3 rounded-md shadow-md z-[1000]">
          <div className="flex items-center space-x-2 text-gray-600">
            <span className="text-sm">No farms match the selected criteria</span>
          </div>
        </div>
      )}
      
      {/* Farm visualization info panel */}
      {showInfoPanel && filteredFarms.length > 0 && (
        <FarmVisualizationInfo 
          showPolygons={showPolygons}
          currentZoom={currentZoom}
          threshold={ZOOM_THRESHOLD}
        />
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-md shadow-md z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-kitovu-purple border-t-transparent rounded-full"></div>
            <span className="text-sm text-gray-700">Loading farms...</span>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-50 px-4 py-2 rounded-md shadow-md z-[1000]">
          <div className="flex items-center space-x-2 text-red-600">
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default FarmsLayer;