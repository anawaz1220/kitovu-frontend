// src/components/dashboard/FarmsLayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import farmService from '../../services/api/farms.service';
import FarmPopup from './FarmPopup';

/**
 * Function to style farm polygons based on farm type
 * @param {Object} farm - Farm object
 * @returns {Object} - Leaflet style object
 */
const getFarmStyle = (farm) => {
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

/**
 * Component that renders farms as a layer on the map
 */
const FarmsLayer = ({ 
  visible = false,
  filterParams = {},
  onFarmsLoaded = () => {},
  onSelectFarm = () => {}
}) => {
  const [allFarms, setAllFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const map = useMap();
  
  // Refs to track state without causing re-renders
  const dataFetchedRef = useRef(false);
  const boundsSetRef = useRef(false);
  const prevFilterParamsRef = useRef(null);
  
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
  
  // Fit map to bounds when filtered farms change
  useEffect(() => {
    // Skip if not visible, no filtered farms, or bounds already set
    if (!visible || filteredFarms.length === 0 || boundsSetRef.current) return;
    
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
          // Fit bounds with padding
          map.fitBounds(bounds, {
            padding: [50, 50],
            animate: true
          });
          boundsSetRef.current = true;
        }
      } catch (e) {
        console.error('Error fitting to farm bounds:', e);
      }
    }
  }, [visible, filteredFarms, map]);
  
  // Don't render anything if layer is not visible
  if (!visible) return null;
  
  // Handle farm click
  const handleFarmClick = (farm) => {
    if (onSelectFarm && typeof onSelectFarm === 'function') {
      onSelectFarm(farm);
    }
  };
  
  return (
    <>
      {filteredFarms.length > 0 ? (
        filteredFarms.map(farm => {
          // Skip farms without geometry
          if (!farm.geom) return null;
          
          return (
            <GeoJSON
              key={farm.id}
              data={farm.geom}
              style={() => getFarmStyle(farm)}
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
      
      {isLoading && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-md shadow-md z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-kitovu-purple border-t-transparent rounded-full"></div>
            <span className="text-sm text-gray-700">Loading farms...</span>
          </div>
        </div>
      )}
      
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