// src/components/dashboard/FarmsLayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { GeoJSON, useMap, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import farmService from '../../services/api/farms.service';
import communityService from '../../services/api/community.service';
import FarmPopupOnClick from './FarmPopupOnClick';
import { getFarmStyle, getFarmMarkerSize, calculateCentroid } from './utils/geometryUtils';

// Threshold zoom level for switching between points and polygons
export const ZOOM_THRESHOLD = 11;

/**
 * Component that renders farm data on the map
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether layer is visible
 * @param {Object} props.filterParams - Parameters for filtering farms
 * @param {Function} props.onFarmsLoaded - Callback with loaded farms data
 * @param {Function} props.onSelectFarm - Callback when farm is selected
 */
const FarmsLayer = ({ 
  visible = true,
  filterParams = {},
  onFarmsLoaded = () => {},
  onSelectFarm = () => {}
}) => {
  const map = useMap();
  const [allFarms, setAllFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());
  
  // Keep track of the previous filter params to avoid unnecessary re-filtering
  const prevFilterParamsRef = useRef({});
  const boundsSetRef = useRef(false);
  const processingRef = useRef(false);
  const initialLoadRef = useRef(false);
  
  // Monitor zoom level changes
  useEffect(() => {
    const handleZoomChange = () => {
      setCurrentZoom(map.getZoom());
    };
    
    map.on('zoomend', handleZoomChange);
    
    return () => {
      map.off('zoomend', handleZoomChange);
    };
  }, [map]);
  
  // Fetch all farms once on initial mount
  useEffect(() => {
    // Skip if not visible or already loaded
    if (!visible || initialLoadRef.current) return;
    
    const fetchFarms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching all farms...');
        const farms = await farmService.getFarms();
        console.log(`Fetched ${farms.length} farms`);
        
        setAllFarms(farms);
        // For "all" layer, show all farms initially
        if (Object.keys(filterParams).length === 0) {
          setFilteredFarms(farms);
          onFarmsLoaded(farms);
        }
        
        // Mark as loaded
        initialLoadRef.current = true;
      } catch (error) {
        console.error('Error fetching farms:', error);
        setError('Failed to load farms data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFarms();
  }, [visible, onFarmsLoaded, filterParams]);
  
  // Apply filters when allFarms or filterParams change
  useEffect(() => {
    // Skip if not visible, no farms data, or already processing
    if (!visible || allFarms.length === 0 || processingRef.current) return;
    
    const currentFilterString = JSON.stringify(filterParams);
    const prevFilterString = JSON.stringify(prevFilterParamsRef.current);
    
    // Skip if filters haven't changed and we already have filtered farms
    if (currentFilterString === prevFilterString && filteredFarms.length > 0) return;
    
    // Save current filters for comparison next time
    prevFilterParamsRef.current = {...filterParams};
    
    const applyFilters = async () => {
      try {
        processingRef.current = true;
        setIsLoading(true);
        setError(null);
        
        console.log('Applying filters:', filterParams);
        
        // Start with all farms
        let filtered = [...allFarms];
        
        // Apply the specific filter based on the filter type
        if (filterParams.farm_type) {
          // Filter by farm type
          filtered = filtered.filter(farm => farm.farm_type === filterParams.farm_type);
          console.log(`Filtered to ${filtered.length} farms by farm type:`, filterParams.farm_type);
        } 
        else if (filterParams.crop_type) {
          // Filter by crop type
          filtered = filtered.filter(farm => farm.crop_type === filterParams.crop_type);
          console.log(`Filtered to ${filtered.length} farms by crop type:`, filterParams.crop_type);
        } 
        else if (filterParams.livestock_type) {
          // Filter by livestock type
          filtered = filtered.filter(farm => farm.livestock_type === filterParams.livestock_type);
          console.log(`Filtered to ${filtered.length} farms by livestock type:`, filterParams.livestock_type);
        }
        else if (filterParams.community) {
          // Filter by community - use the community service
          console.log('Filtering by community:', filterParams.community);
          try {
            // Get farms for the selected community
            filtered = await communityService.getFarmsByCommunitity(filterParams.community);
            console.log(`Found ${filtered.length} farms for community:`, filterParams.community);
          } catch (error) {
            console.error('Error getting farms by community:', error);
            setError(`Error filtering by community: ${error.message}`);
            filtered = [];
          }
        }
        
        console.log(`Final filtered farms count: ${filtered.length}`);
        
        // Update state with filtered farms
        setFilteredFarms(filtered);
        
        // Call callback with filtered farms
        onFarmsLoaded(filtered);
        
        // Reset the bounds flag when filters change
        if (currentFilterString !== prevFilterString) {
          boundsSetRef.current = false;
        }
      } catch (error) {
        console.error('Error applying filters:', error);
        setError('Failed to filter farms');
        setFilteredFarms([]);
        onFarmsLoaded([]);
      } finally {
        setIsLoading(false);
        processingRef.current = false;
      }
    };
    
    applyFilters();
  }, [visible, allFarms, filterParams, onFarmsLoaded]);
  
  // Fit bounds to filtered farms when needed
  useEffect(() => {
    // Skip if not visible, no farms, or bounds already set
    if (!visible || filteredFarms.length === 0 || boundsSetRef.current) return;
    
    // Create GeoJSON features for each farm
    const validFarms = filteredFarms.filter(farm => farm.geom);
    
    if (validFarms.length === 0) return;
    
    try {
      console.log(`Fitting bounds to ${validFarms.length} farms`);
      
      // Create GeoJSON layers for all farms
      const farmLayers = validFarms.map(farm => {
        return L.geoJSON(farm.geom);
      });
      
      // Create a feature group with all farm layers
      const featureGroup = L.featureGroup(farmLayers);
      const bounds = featureGroup.getBounds();
      
      if (bounds.isValid()) {
        // Fit the map to the bounds with padding
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14
        });
        
        // Mark that we've set bounds
        boundsSetRef.current = true;
      }
    } catch (error) {
      console.error('Error fitting to farm bounds:', error);
    }
  }, [map, visible, filteredFarms]);
  
  // Don't render if not visible
  if (!visible) return null;
  
  // Show loading indicator
  if (isLoading && filteredFarms.length === 0) {
    return (
      <div className="absolute bottom-16 left-4 bg-white p-2 rounded-md shadow-md z-50">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-t-2 border-kitovu-purple rounded-full animate-spin"></div>
          <span className="text-sm">Loading farms...</span>
        </div>
      </div>
    );
  }
  
  // Show error message if any
  if (error && !isLoading && filteredFarms.length === 0) {
    return (
      <div className="absolute bottom-16 left-4 bg-red-50 p-2 rounded-md shadow-md z-50 border-l-4 border-red-500">
        <span className="text-sm text-red-700">{error}</span>
      </div>
    );
  }
  
  // Show message if no farms match the filter
  if (filteredFarms.length === 0 && !isLoading) {
    return (
      <div className="absolute bottom-16 left-4 bg-yellow-50 p-2 rounded-md shadow-md z-50 border-l-4 border-yellow-500">
        <span className="text-sm text-yellow-700">No farms match the selected filter</span>
      </div>
    );
  }
  
  // Calculate if we should show polygons based on zoom level
  const showPolygons = currentZoom >= ZOOM_THRESHOLD;
  const markerSize = getFarmMarkerSize(currentZoom);
  
  // Render farms on the map
  return (
    <>
      {filteredFarms.map(farm => {
        if (!farm.geom) return null;
        
        // Calculate centroid if not already available
        const centroid = farm.centroid || calculateCentroid(farm.geom);
        
        // Show points at low zoom levels
        if (!showPolygons && centroid) {
          return (
            <CircleMarker
              key={`farm-${farm.id}-marker`}
              center={centroid}
              radius={markerSize}
              pathOptions={{
                fillColor: getFarmStyle(farm).fillColor,
                color: getFarmStyle(farm).color,
                fillOpacity: 0.8,
                weight: 1.5
              }}
              eventHandlers={{
                click: () => onSelectFarm(farm)
              }}
            >
              <FarmPopupOnClick farm={farm} />
            </CircleMarker>
          );
        }
        
        // Show polygons at high zoom levels
        return (
          <GeoJSON
            key={`farm-${farm.id}-polygon`}
            data={farm.geom}
            style={() => getFarmStyle(farm)}
            eventHandlers={{
              click: () => onSelectFarm(farm)
            }}
          >
            <FarmPopupOnClick farm={farm} />
          </GeoJSON>
        );
      })}
    </>
  );
};

export default FarmsLayer;