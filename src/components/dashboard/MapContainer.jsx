// src/components/dashboard/MapContainer.jsx
import React, { useEffect, useRef, useMemo, memo } from 'react';
import { MapContainer as LeafletMap, TileLayer, ZoomControl, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { defaultPosition, defaultZoom, basemapUrls } from './utils/mapConfig';
import MapUpdater from './MapUpdater';
import DataLayers from './DataLayers';
import MeasurementControl from './MeasurementControl';

// Memoized controller to prevent unnecessary rerenders
const MapController = memo(({ selectedFarmer, selectedFarm, farmerFarms }) => {
  const map = useMap();
  const prevFarmerRef = useRef(null);
  const prevFarmRef = useRef(null);
  const farmsFittedRef = useRef(false);
  const initialLoadCompletedRef = useRef(false);
  
  // Wait for initial map load before doing any navigation
  useEffect(() => {
    if (!initialLoadCompletedRef.current) {
      initialLoadCompletedRef.current = true;
      
      // Give the map a moment to initialize before attempting navigation
      const timer = setTimeout(() => {
        // Reset all navigation flags to ensure we can navigate on initial load
        prevFarmerRef.current = null;
        prevFarmRef.current = null;
        farmsFittedRef.current = false;
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Handle farmer selection (with debounce)
  useEffect(() => {
    if (!selectedFarmer || !initialLoadCompletedRef.current) return;
    
    // Check if we need to do anything
    if (prevFarmerRef.current && prevFarmerRef.current.id === selectedFarmer.id) return;
    
    // Create a debounced navigation function
    const timer = setTimeout(() => {
      console.log('Flying to farmer:', selectedFarmer.first_name);
      if (selectedFarmer.user_latitude && selectedFarmer.user_longitude) {
        map.flyTo(
          [selectedFarmer.user_latitude, selectedFarmer.user_longitude],
          14,
          { animate: true, duration: 1 }
        );
      }
      
      // Update the ref
      prevFarmerRef.current = selectedFarmer;
      farmsFittedRef.current = false;
    }, 300);
    
    return () => clearTimeout(timer);
  }, [map, selectedFarmer]);
  
  // Fit to all farms when farms are loaded
  useEffect(() => {
    if (!farmerFarms || farmerFarms.length === 0 || !selectedFarmer || farmsFittedRef.current || !initialLoadCompletedRef.current) return;
    
    // Debounce to avoid competing with other map movements
    const timer = setTimeout(() => {
      try {
        console.log('Fitting to all farms for farmer:', selectedFarmer.first_name);
        
        // Filter farms to only those with valid geometries
        const validFarms = farmerFarms.filter(farm => farm.geom);
        
        if (validFarms.length > 0) {
          // Create a feature collection
          const features = validFarms.map(farm => ({
            type: 'Feature',
            geometry: farm.geom
          }));
          
          const featureCollection = {
            type: 'FeatureCollection',
            features
          };
          
          // Create a GeoJSON layer and fit bounds
          const geoJsonLayer = L.geoJSON(featureCollection);
          const bounds = geoJsonLayer.getBounds();
          
          if (bounds.isValid()) {
            map.fitBounds(bounds, {
              padding: [100, 100],
              animate: true,
              duration: 1
            });
            
            // Mark that we've fitted the farms
            farmsFittedRef.current = true;
          }
        }
      } catch (error) {
        console.error('Error fitting to farm bounds:', error);
      }
    }, 800); // Slightly longer delay to let the map settle
    
    return () => clearTimeout(timer);
  }, [map, farmerFarms, selectedFarmer]);
  
  // Handle individual farm selection
  useEffect(() => {
    if (!selectedFarm || !selectedFarm.geom || !initialLoadCompletedRef.current) return;
    
    // Check if we need to do anything
    if (prevFarmRef.current && prevFarmRef.current.id === selectedFarm.id) return;
    
    // Debounce to avoid conflicts
    const timer = setTimeout(() => {
      try {
        console.log('Flying to farm:', selectedFarm.farm_id);
        
        // Create a GeoJSON layer to calculate bounds
        const geoJsonLayer = L.geoJSON(selectedFarm.geom);
        const bounds = geoJsonLayer.getBounds();
        
        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [50, 50],
            animate: true,
            duration: 1
          });
          
          // Update the ref
          prevFarmRef.current = selectedFarm;
        }
      } catch (error) {
        console.error('Error flying to farm:', error);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [map, selectedFarm]);
  
  return null; // This component doesn't render anything
});

// Memoized GeoJSON component to prevent unnecessary rerenders
const StableFarmGeometry = memo(({ farm, isSelected, onClick }) => {
  // Style function
  const farmStyle = useMemo(() => {
    return {
      color: isSelected ? '#ff6b6b' : '#7a49a5',
      weight: isSelected ? 3 : 2,
      opacity: 1,
      fillColor: isSelected ? '#ff8787' : '#9775b5',
      fillOpacity: 0.5
    };
  }, [isSelected]);
  
  // Don't render if no geometry
  if (!farm || !farm.geom) return null;
  
  return (
    <GeoJSON
      data={farm.geom}
      style={() => farmStyle}
      eventHandlers={{
        click: () => onClick && onClick(farm)
      }}
    >
      <Popup>
        <div className="farm-popup">
          <h3 className="text-lg font-semibold text-kitovu-purple">Farm #{farm.farm_id}</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-sm">
              <span className="font-medium text-gray-600">Type:</span>
              <p>{farm.farm_type?.replace(/_/g, ' ') || 'N/A'}</p>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-600">Status:</span>
              <p>{farm.ownership_status?.replace(/_/g, ' ') || 'N/A'}</p>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-600">Area:</span>
              <p>{farm.calculated_area ? `${farm.calculated_area} acres` : 'Not calculated'}</p>
            </div>
            {farm.farm_type === 'crop_farming' && (
              <div className="text-sm">
                <span className="font-medium text-gray-600">Crop:</span>
                <p>{farm.crop_type || 'Not specified'}</p>
              </div>
            )}
            {farm.farm_type === 'livestock_farming' && (
              <>
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Livestock:</span>
                  <p>{farm.livestock_type || 'Not specified'}</p>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Animals:</span>
                  <p>{farm.number_of_animals || 'Unknown'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </Popup>
    </GeoJSON>
  );
});

// Main map container component
const MapContainer = ({ 
  basemap = 'streets', 
  activeLayers, 
  selectedFarmer = null,
  selectedFarm = null,
  farmerFarms = [],
  onFarmSelect
}) => {
  // Render the map only once (stability)
  const memoizedMapProps = useMemo(() => ({
    center: defaultPosition, 
    zoom: defaultZoom,
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    className: "w-full h-full"
  }), []);
  
  // Memoized TileLayer props
  const tileLayerProps = useMemo(() => ({
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: basemapUrls[basemap]
  }), [basemap]);
  
  // Memoize farm farm click handler
  const handleFarmClick = useMemo(() => {
    return (farm) => {
      if (onFarmSelect && typeof onFarmSelect === 'function') {
        onFarmSelect(farm);
      }
    };
  }, [onFarmSelect]);
  
  // Render marker for selected farmer
  const renderFarmerMarker = useMemo(() => {
    if (!selectedFarmer || !selectedFarmer.user_latitude || !selectedFarmer.user_longitude) {
      return null;
    }
    
    return (
      <Marker position={[selectedFarmer.user_latitude, selectedFarmer.user_longitude]}>
        <Popup>
          <div>
            <strong>{selectedFarmer.first_name} {selectedFarmer.last_name}</strong>
            <p>Location: {selectedFarmer.city}, {selectedFarmer.state}</p>
          </div>
        </Popup>
      </Marker>
    );
  }, [selectedFarmer]);

  return (
    <div className="w-full h-full absolute inset-0" style={{ zIndex: 1 }}>
      <LeafletMap {...memoizedMapProps}>
        {/* Base layers */}
        <TileLayer {...tileLayerProps} />
        <ZoomControl position="bottomright" />
        <MapUpdater basemap={basemap} />
        
        {/* Map controller - encapsulated in memo to prevent unnecessary rerenders */}
        <MapController 
          selectedFarmer={selectedFarmer}
          selectedFarm={selectedFarm}
          farmerFarms={farmerFarms}
        />
        
        {/* Optional layers */}
        <DataLayers activeLayers={activeLayers} />
        <MeasurementControl />
        
        {/* Farmer marker */}
        {renderFarmerMarker}
        
        {/* Farm geometries */}
        {farmerFarms.map(farm => (
          <StableFarmGeometry
            key={farm.id}
            farm={farm}
            isSelected={selectedFarm && selectedFarm.id === farm.id}
            onClick={handleFarmClick}
          />
        ))}
      </LeafletMap>
    </div>
  );
};

// Export memoized component to prevent unnecessary rerenders
export default memo(MapContainer);