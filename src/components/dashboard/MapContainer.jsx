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
      
  <Popup className="farm-popup-container">
    <div className="bg-white rounded-lg overflow-hidden shadow-md" style={{ minWidth: "260px", maxWidth: "300px" }}>
      {/* Header */}
      <div className="bg-kitovu-purple text-white p-3 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
        <h3 className="font-bold text-lg">Farm #{farm.farm_id}</h3>
      </div>
      
      {/* Content */}
      <div className="p-3">
        {/* Farm Type & Status row */}
        <div className="flex mb-3">
          <div className="w-1/2 pr-2">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 text-kitovu-purple mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
              <span className="text-xs font-semibold text-gray-500">Type</span>
            </div>
            <p className="font-medium capitalize text-gray-800">{farm.farm_type?.replace(/_/g, ' ') || 'N/A'}</p>
          </div>
          <div className="w-1/2 pl-2">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 text-kitovu-purple mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span className="text-xs font-semibold text-gray-500">Status</span>
            </div>
            <p className="font-medium capitalize text-gray-800">{farm.ownership_status?.replace(/_/g, ' ') || 'N/A'}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-2"></div>
        
        {/* Area & Crop/Livestock row */}
        <div className="flex mb-2">
          <div className="w-1/2 pr-2">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 text-kitovu-purple mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
              <span className="text-xs font-semibold text-gray-500">Area</span>
            </div>
            <p className="font-medium text-gray-800">{farm.calculated_area ? `${farm.calculated_area} acres` : 'Not calculated'}</p>
          </div>
          
          {farm.farm_type === 'crop_farming' && (
            <div className="w-1/2 pl-2">
              <div className="flex items-center mb-1">
                <svg className="w-4 h-4 text-kitovu-purple mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-xs font-semibold text-gray-500">Crop</span>
              </div>
              <p className="font-medium capitalize text-gray-800">{farm.crop_type || 'Not specified'}</p>
            </div>
          )}
          
          {farm.farm_type === 'livestock_farming' && (
            <div className="w-1/2 pl-2">
              <div className="flex items-center mb-1">
                <svg className="w-4 h-4 text-kitovu-purple mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <span className="text-xs font-semibold text-gray-500">Livestock</span>
              </div>
              <p className="font-medium capitalize text-gray-800">{farm.livestock_type || 'Not specified'}</p>
            </div>
          )}
        </div>
        
        {/* Animal count (for livestock only) */}
        {farm.farm_type === 'livestock_farming' && farm.number_of_animals && (
          <div className="mb-2">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 text-kitovu-purple mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              <span className="text-xs font-semibold text-gray-500">Number of Animals</span>
            </div>
            <p className="font-medium text-gray-800">{farm.number_of_animals}</p>
          </div>
        )}
        
        {/* Lease information (if applicable) */}
        {farm.ownership_status === 'leased' && (farm.lease_years || farm.lease_months) && (
          <>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="mb-2">
              <div className="flex items-center mb-1">
                <svg className="w-4 h-4 text-kitovu-purple mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="text-xs font-semibold text-gray-500">Lease Duration</span>
              </div>
              <p className="font-medium text-gray-800">
                {farm.lease_years ? `${farm.lease_years} years ` : ''}
                {farm.lease_months ? `${farm.lease_months} months` : ''}
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-t">
        <div className="flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Added on {new Date(farm.created_at).toLocaleDateString()}
        </div>
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
  onFarmSelect,
  children
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
  const tileLayerProps = useMemo(() => {
    const baseProps = {
      url: basemapUrls[basemap],
      maxZoom: basemap === 'satellite' ? 21 : 19,
      minZoom: 4,
      tileSize: 256
    };
    
    // Set appropriate attribution based on basemap
    if (basemap === 'satellite') {
      baseProps.attribution = '&copy; Google Maps';
    } else {
      baseProps.attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
    
    return baseProps;
  }, [basemap]);
  
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
        
        {/* Render children components (like FarmsLayer) */}
        {children}
      </LeafletMap>
    </div>
  );
};

// Export memoized component to prevent unnecessary rerenders
export default memo(MapContainer);