// src/components/dashboard/MapContainer.jsx
import React, { useEffect, useRef, useMemo, memo, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, ZoomControl, Marker, Popup, GeoJSON, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { defaultPosition, defaultZoom, basemapUrls } from './utils/mapConfig';
import { calculateCentroid, getFarmStyle, shouldShowPolygons, getFarmMarkerSize } from './utils/geometryUtils';
import { ZOOM_THRESHOLD } from './FarmsLayer';
import MapZoomProtector from './MapZoomProtector';
import MapUpdater from './MapUpdater';
import DataLayers from './DataLayers';
import MeasurementControl from './MeasurementControl';
import FarmPopupOnClick from './FarmPopupOnClick';
import AdvisoryInputModal from '../advisory/AdvisoryInputModal';

// Memoized controller to prevent unnecessary rerenders
const MapController = memo(({ selectedFarmer, selectedFarm, farmerFarms }) => {
  const map = useMap();
  const prevFarmerRef = useRef(null);
  const prevFarmRef = useRef(null);
  const farmsFittedRef = useRef(false);
  const initialLoadCompletedRef = useRef(false);
  const userZoomingRef = useRef(false);
  
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
  
  // Detect user zooming to prevent automatic zoom resets
  useEffect(() => {
    const handleZoomStart = () => {
      userZoomingRef.current = true;
    };
    
    const handleZoomEnd = () => {
      // Reset after a short delay
      setTimeout(() => {
        userZoomingRef.current = false;
      }, 500);
    };
    
    map.on('zoomstart', handleZoomStart);
    map.on('zoomend', handleZoomEnd);
    
    return () => {
      map.off('zoomstart', handleZoomStart);
      map.off('zoomend', handleZoomEnd);
    };
  }, [map]);
  
  // Handle farmer selection (with debounce)
  useEffect(() => {
    if (!selectedFarmer || !initialLoadCompletedRef.current) return;
    
    // Check if we need to do anything
    if (prevFarmerRef.current && prevFarmerRef.current.id === selectedFarmer.id) return;
    
    // If user is actively zooming, don't interrupt them
    if (userZoomingRef.current) {
      prevFarmerRef.current = selectedFarmer;
      return;
    }
    
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
    
    // If user is actively zooming, don't disrupt them
    if (userZoomingRef.current) {
      farmsFittedRef.current = true;
      return;
    }
    
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
            // Check if user is actively using the map
            if (!userZoomingRef.current) {
              map.fitBounds(bounds, {
                padding: [100, 100],
                animate: true,
                duration: 1
              });
            }
            
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
    
    // If user is actively zooming, don't disrupt them
    if (userZoomingRef.current) {
      prevFarmRef.current = selectedFarm;
      return;
    }
    
    // Debounce to avoid conflicts
    const timer = setTimeout(() => {
      try {
        console.log('Flying to farm:', selectedFarm.farm_id);
        
        // Create a GeoJSON layer to calculate bounds
        const geoJsonLayer = L.geoJSON(selectedFarm.geom);
        const bounds = geoJsonLayer.getBounds();
        
        if (bounds.isValid()) {
          // Only navigate if user isn't interacting with the map
          if (!userZoomingRef.current) {
            map.flyToBounds(bounds, {
              padding: [50, 50],
              animate: true,
              duration: 1
            });
          }
          
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
const StableFarmGeometry = memo(({ farm, isSelected, onClick, currentZoom, onAdvisoryClick }) => {
  // Get farm style based on farm type and selection state
  const farmStyle = useMemo(() => {
    const baseStyle = getFarmStyle(farm);
    
    // If selected, enhance the style
    if (isSelected) {
      return {
        ...baseStyle,
        color: '#ff6b6b',
        weight: 3,
        fillColor: '#ff8787',
        fillOpacity: 0.6
      };
    }
    
    return baseStyle;
  }, [isSelected, farm]);
  
  // Calculate centroid if not already calculated
  const centroid = useMemo(() => {
    if (!farm.centroid && farm.geom) {
      return calculateCentroid(farm.geom);
    }
    return farm.centroid;
  }, [farm]);
  
  // Don't render if no geometry
  if (!farm || !farm.geom) return null;
  
  // Determine if we should show polygons based on zoom level
  const showPolygons = shouldShowPolygons(currentZoom, ZOOM_THRESHOLD);
  const markerRadius = getFarmMarkerSize(currentZoom);
  
  // At low zoom levels, show points
  if (!showPolygons && centroid) {
    return (
      <CircleMarker
        center={centroid}
        radius={markerRadius}
        pathOptions={{
          fillColor: farmStyle.fillColor,
          color: farmStyle.color,
          fillOpacity: 0.8,
          weight: isSelected ? 2 : 1.5
        }}
        eventHandlers={{
          click: () => onClick && onClick(farm)
        }}
      >
        <FarmPopupOnClick farm={farm} onAdvisoryClick={onAdvisoryClick} />
      </CircleMarker>
    );
  }
  
  // At high zoom levels, show polygons
  return (
    <GeoJSON
      data={farm.geom}
      style={() => farmStyle}
      eventHandlers={{
        click: () => onClick && onClick(farm)
      }}
    >
      <FarmPopupOnClick farm={farm} onAdvisoryClick={onAdvisoryClick} />
    </GeoJSON>
  );
});

// ZoomMonitor component to track map zoom level
const ZoomMonitor = ({ onZoomChange }) => {
  const map = useMap();
  const userInitiatedZoomRef = useRef(false);
  
  useEffect(() => {
    const handleZoomStart = () => {
      // Mark that zooming was initiated by user
      userInitiatedZoomRef.current = true;
    };
    
    const handleZoomEnd = () => {
      onZoomChange(map.getZoom());
    };
    
    // Set initial zoom without marking as user-initiated
    onZoomChange(map.getZoom());
    
    // Listen for zoom events
    map.on('zoomstart', handleZoomStart);
    map.on('zoomend', handleZoomEnd);
    
    return () => {
      map.off('zoomstart', handleZoomStart);
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onZoomChange]);
  
  return null;
};

// Main map container component
const MapContainer = ({ 
  basemap = 'streets', 
  activeLayers, 
  selectedFarmer = null,
  selectedFarm = null,
  farmerFarms = [],
  onFarmSelect,
  showFarmersOnMap = false,
  showFarmsOnMap = false,
  onToggleFarmersOnMap,
  onToggleFarmsOnMap,
  children
}) => {
  const [currentZoom, setCurrentZoom] = useState(defaultZoom);
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);
  const [selectedFarmForAdvisory, setSelectedFarmForAdvisory] = useState(null);
  
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

  // Handle advisory button click
  const handleAdvisoryClick = (farm) => {
    console.log('Advisory clicked for farm:', farm);
    setSelectedFarmForAdvisory(farm);
    setShowAdvisoryModal(true);
  };

  // Handle advisory modal close
  const handleAdvisoryModalClose = () => {
    setShowAdvisoryModal(false);
    setSelectedFarmForAdvisory(null);
  };
  
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

  // Handle zoom level change
  const handleZoomChange = (zoom) => {
    setCurrentZoom(zoom);
  };

  return (
    <>
      <div className="w-full h-full absolute inset-0" style={{ zIndex: 1 }}>
        <LeafletMap {...memoizedMapProps}>
          {/* Base layers */}
          <TileLayer {...tileLayerProps} />
          <ZoomControl position="bottomright" />
          <MapUpdater basemap={basemap} />
          <MapZoomProtector />
          
          {/* Zoom monitor */}
          <ZoomMonitor onZoomChange={handleZoomChange} />
          
          {/* Map controller - encapsulated in memo to prevent unnecessary rerenders */}
          <MapController 
            selectedFarmer={selectedFarmer}
            selectedFarm={selectedFarm}
            farmerFarms={farmerFarms}
          />
          
          {/* Optional layers */}
          <DataLayers 
            activeLayers={activeLayers}
            showFarmersOnMap={showFarmersOnMap}
            showFarmsOnMap={showFarmsOnMap}
            onToggleFarmersOnMap={onToggleFarmersOnMap}
            onToggleFarmsOnMap={onToggleFarmsOnMap}
          />
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
              onAdvisoryClick={handleAdvisoryClick}
              currentZoom={currentZoom}
            />
          ))}
          
          {/* Render children components (like FarmsLayer) */}
          {children}
        </LeafletMap>
      </div>

      {/* Advisory Modal - Outside the map container */}
      <AdvisoryInputModal
        isOpen={showAdvisoryModal}
        onClose={handleAdvisoryModalClose}
        farm={selectedFarmForAdvisory}
      />
    </>
  );
};

// Export memoized component to prevent unnecessary rerenders
export default memo(MapContainer);