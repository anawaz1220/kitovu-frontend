// src/components/dashboard/ClusteredPointsLayer.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Marker, Popup, useMap, GeoJSON, CircleMarker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { User, LandPlot } from 'lucide-react';
import { fetchFarmersLocations, fetchFarmsLocations } from '../../services/api/location.service';
import { getFarmerById, getFarmsByFarmerId } from '../../services/api/farmerQuery.service';
import farmService from '../../services/api/farms.service';
import TestFarmPopup from './TestFarmPopup';
import { getFarmStyle, getFarmMarkerSize, calculateCentroid } from './utils/geometryUtils';
import FarmPopupOnClick from './FarmPopupOnClick';

// Custom icons for farmers and farms
const createCustomIcon = (type, isCluster = false) => {
  const iconHtml = type === 'farmer' ? 
    '<div class="bg-blue-500 text-white rounded-full flex items-center justify-center" style="width: 25px; height: 25px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>' :
    '<div class="bg-green-500 text-white rounded-full flex items-center justify-center" style="width: 25px; height: 25px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 14.2 0L21 21"/><path d="M12 13h.01"/><path d="M13 21-1-1"/></svg></div>';

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });
};

// Custom cluster icon
const createClusterCustomIcon = (cluster) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 30 : count < 100 ? 40 : 50;
  
  return L.divIcon({
    html: `<div class="cluster-icon" style="
      width: ${size}px; 
      height: ${size}px; 
      background: linear-gradient(135deg, #6366f1, #8b5cf6); 
      border: 3px solid white; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: white; 
      font-weight: bold; 
      font-size: ${size > 40 ? '14px' : '12px'};
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

/**
 * ClusteredPointsLayer component for displaying farmers and farms as clustered markers
 * @param {Object} props - Component props
 * @param {boolean} props.showFarmers - Whether to show farmer markers
 * @param {boolean} props.showFarms - Whether to show farm markers
 * @param {Object} props.filteredData - Filtered analytics data containing farmers and farms
 * @param {Function} props.onSelectFarmer - Function to call when farmer is selected
 * @param {Function} props.onAdvisoryClick - Function to call when advisory button is clicked
 */
const ClusteredPointsLayer = ({ 
  showFarmers = false, 
  showFarms = false, 
  filteredData = null,
  onSelectFarmer,
  onSelectFarm,
  onAdvisoryClick 
}) => {
  const [farmersData, setFarmersData] = useState(null);
  const [farmsData, setFarmsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFittedBounds, setHasFittedBounds] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(10);
  const map = useMap();
  const clusterGroupRef = useRef(null);
  

  // Zoom threshold for showing polygons vs points - match FarmsLayer
  const POLYGON_ZOOM_THRESHOLD = 11;

  // Handle data loading - use filtered data when available, otherwise fetch all data
  useEffect(() => {
    console.log('ClusteredPointsLayer data loading effect:', {
      showFarmers,
      showFarms,
      hasFilteredData: !!filteredData,
      hasMapData: !!(filteredData?.map_data)
    });
    
    if (filteredData && filteredData.map_data) {
      // Use filtered data from analytics results
      if (showFarmers) {
        const farmersFromFilter = filteredData.map_data.farmers || [];
        console.log('Setting farmers data from filter:', farmersFromFilter.length, 'farmers');
        setFarmersData(farmersFromFilter);
      }
      if (showFarms) {
        const farmsFromFilter = filteredData.map_data.farms || [];
        console.log('Setting farms data from filter:', farmsFromFilter.length, 'farms');
        setFarmsData(farmsFromFilter);
      }
    } else {
      // Fallback to fetching all data when no filtered data is available
      console.log('No filtered data available, using fallback fetch');
      if (showFarmers && !farmersData) {
        fetchFarmersData();
      }
      if (showFarms && !farmsData) {
        fetchFarmsData();
      }
    }
  }, [showFarmers, showFarms, filteredData, farmersData, farmsData]);

  // Reset data when show flags change to false
  useEffect(() => {
    if (!showFarmers) {
      setFarmersData(null);
    }
    if (!showFarms) {
      setFarmsData(null);
    }
  }, [showFarmers, showFarms]);

  // Fit bounds to clustered points when data is available
  useEffect(() => {
    if ((farmersData || farmsData) && !hasFittedBounds && clusterGroupRef.current) {
      setTimeout(() => {
        try {
          const clusterGroup = clusterGroupRef.current;
          if (clusterGroup && clusterGroup.getBounds && clusterGroup.getBounds().isValid()) {
            map.fitBounds(clusterGroup.getBounds(), {
              padding: [50, 50],
              maxZoom: 12
            });
            setHasFittedBounds(true);
          }
        } catch (error) {
          console.error('Error fitting bounds to clustered points:', error);
        }
      }, 500);
    }
  }, [farmersData, farmsData, hasFittedBounds, map]);

  // Reset fitted bounds when layers are turned off
  useEffect(() => {
    if (!showFarmers && !showFarms) {
      setHasFittedBounds(false);
    }
  }, [showFarmers, showFarms]);

  // Create a custom pane for cluster markers with higher z-index
  useEffect(() => {
    if (!map) return;
    
    // Create a custom pane for cluster markers
    if (!map.getPane('clusterPane')) {
      const clusterPane = map.createPane('clusterPane');
      clusterPane.style.zIndex = 1500; // Higher than polygons (default is around 200-600)
    }
  }, [map]);

  // Track zoom changes
  useEffect(() => {
    if (!map) return;

    const handleZoomEnd = () => {
      setCurrentZoom(map.getZoom());
    };

    map.on('zoomend', handleZoomEnd);
    setCurrentZoom(map.getZoom()); // Set initial zoom

    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map]);

  const fetchFarmersData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchFarmersLocations();
      setFarmersData(data);
    } catch (err) {
      console.error('Error fetching farmers locations:', err);
      setError('Failed to load farmers locations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFarmsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchFarmsLocations();
      setFarmsData(data);
    } catch (err) {
      console.error('Error fetching farms locations:', err);
      setError('Failed to load farms locations');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle farmer marker click
  const handleFarmerClick = async (farmerId) => {
    try {
      if (onSelectFarmer) {
        // Fetch farmer details and call the selection handler
        const farmerDetails = await getFarmerById(farmerId);
        if (farmerDetails) {
          onSelectFarmer(farmerDetails);
        }
      }
    } catch (error) {
      console.error('Error selecting farmer:', error);
    }
  };

  // Handle farm marker click - use drawer like farmer clicks
  const handleFarmClick = (farm) => {
    console.log('Farm marker clicked:', farm.farm_id);
    if (onSelectFarm) {
      onSelectFarm(farm);
    }
  };

  // Convert farm geometry to GeoJSON
  const createFarmGeoJSON = (farm) => {
    try {
      // Parse the WKT geometry string to GeoJSON
      const geometry = parseWKTToGeoJSON(farm.geom);
      return {
        type: 'Feature',
        properties: {
          farm_id: farm.farm_id,
          centroid_latitude: farm.centroid_latitude,
          centroid_longitude: farm.centroid_longitude
        },
        geometry
      };
    } catch (error) {
      console.error('Error parsing farm geometry:', error);
      return null;
    }
  };

  // Simple WKT to GeoJSON parser for MULTIPOLYGON
  const parseWKTToGeoJSON = (wkt) => {
    // Remove MULTIPOLYGON wrapper and extract coordinate strings
    const coordinateString = wkt
      .replace(/MULTIPOLYGON\(\(\(/g, '')
      .replace(/\)\)\)/g, '')
      .split(',');
    
    const coordinates = coordinateString.map(coord => {
      const [lng, lat] = coord.trim().split(' ').map(Number);
      return [lng, lat];
    });

    // Close the polygon if not already closed
    if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
        coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
      coordinates.push(coordinates[0]);
    }

    return {
      type: 'Polygon',
      coordinates: [coordinates]
    };
  };

  // Don't render if no layers are active
  if (!showFarmers && !showFarms) {
    console.log('ClusteredPointsLayer not rendering - no layers active');
    return null;
  }

  console.log('ClusteredPointsLayer rendering:', {
    showFarmers,
    showFarms,
    farmersDataLength: Array.isArray(farmersData) ? farmersData.length : 'not array',
    farmsDataLength: Array.isArray(farmsData) ? farmsData.length : 'not array',
    currentZoom,
    threshold: POLYGON_ZOOM_THRESHOLD
  });

  // Show loading state
  if (isLoading) {
    return (
      <div 
        className="absolute top-4 left-4 bg-white px-3 py-2 rounded shadow z-1000 text-sm"
        style={{ pointerEvents: 'none' }}
      >
        Loading clustered points...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div 
        className="absolute top-4 left-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded shadow z-1000 text-sm"
        style={{ pointerEvents: 'none' }}
      >
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Clustered markers at low zoom */}
      <MarkerClusterGroup
        ref={clusterGroupRef}
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={50}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        animate={true}
        pane="clusterPane"
      >
        {/* Farmer Markers - always clustered */}
        {showFarmers && farmersData && Array.isArray(farmersData) && farmersData.map((farmer) => (
          <Marker
            key={`farmer-${farmer.farmer_id}`}
            position={[farmer.latitude, farmer.longitude]}
            icon={createCustomIcon('farmer')}
            eventHandlers={{
              click: () => handleFarmerClick(farmer.farmer_id)
            }}
          />
        ))}
        
        {/* Legacy format support for farmers */}
        {showFarmers && farmersData && farmersData.farmers && Array.isArray(farmersData.farmers) && farmersData.farmers.map((farmer) => (
          <Marker
            key={`farmer-legacy-${farmer.farmer_id}`}
            position={[farmer.latitude, farmer.longitude]}
            icon={createCustomIcon('farmer')}
            eventHandlers={{
              click: () => handleFarmerClick(farmer.farmer_id)
            }}
          />
        ))}

        {/* Farm Markers - only at low zoom (clustered) */}
        {showFarms && farmsData && Array.isArray(farmsData) && currentZoom <= POLYGON_ZOOM_THRESHOLD && farmsData.map((farm) => {
          if (!farm.geom) return null;
          
          // Calculate centroid if not already available  
          const centroid = farm.centroid ? [farm.centroid_latitude, farm.centroid_longitude] : calculateCentroid(farm.geom);
          
          if (!centroid) return null;
          
          return (
            <Marker
              key={`farm-marker-${farm.farm_id}`}
              position={centroid}
              icon={createCustomIcon('farm')}
              eventHandlers={{
                click: () => handleFarmClick(farm)
              }}
            />
          );
        })}
        
        {/* Legacy format support for farms - clustered */}
        {showFarms && farmsData && farmsData.farms && Array.isArray(farmsData.farms) && currentZoom <= POLYGON_ZOOM_THRESHOLD && farmsData.farms.map((farm) => (
            <Marker
              key={`farm-legacy-${farm.farm_id}`}
              position={[farm.centroid_latitude, farm.centroid_longitude]}
              icon={createCustomIcon('farm')}
              eventHandlers={{
                click: () => handleFarmClick(farm)
              }}
            />
        ))}
      </MarkerClusterGroup>

      {/* Farm polygons at high zoom - outside cluster group */}
      {showFarms && farmsData && Array.isArray(farmsData) && currentZoom >= POLYGON_ZOOM_THRESHOLD && farmsData.map((farm) => {
        if (!farm.geom) return null;
        
        return (
          <GeoJSON
            key={`farm-polygon-${farm.farm_id}`}
            data={farm.geom}
            style={() => getFarmStyle(farm)}
            eventHandlers={{
              click: () => handleFarmClick(farm)
            }}
            pane="clusterPane"
          >
            <FarmPopupOnClick farm={farm} />
          </GeoJSON>
        );
      })}
      
      {/* Legacy format farm polygons at high zoom */}
      {showFarms && farmsData && farmsData.farms && Array.isArray(farmsData.farms) && currentZoom >= POLYGON_ZOOM_THRESHOLD && farmsData.farms.map((farm) => {
        const geoJSON = createFarmGeoJSON(farm);
        if (!geoJSON) return null;

        return (
          <GeoJSON
            key={`farm-polygon-legacy-${farm.farm_id}`}
            data={geoJSON}
            style={() => getFarmStyle(farm)}
            eventHandlers={{
              click: (e) => {
                handleFarmClick(farm);
                e.originalEvent?.stopPropagation();
              }
            }}
            pane="clusterPane"
          >
            <FarmPopupOnClick farm={farm} />
          </GeoJSON>
        );
      })}
    </>
  );
};

export default ClusteredPointsLayer;