

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, GeoJSON, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import SearchBox from './SearchBox';
import LayerControls from './LayerControls';
import FarmForm from '../FarmForm';
import { useTraceMode } from '../../hooks/useTraceMode';
import useFarmStore from '../../../../../stores/useFarmStore';
import { farmService } from '../../../../../services/api/farm.service';
import { checkOverlap } from '../../utils/geometryUtils';
import LocationButton from './LocationButton';




delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to access map instance
const MapController = ({ onMapReady }) => {
  const map = useMap();
  React.useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
};

const MapSection = () => {
    const [mapInstance, setMapInstance] = useState(null);
    const editableFG = useRef(null);
    const [center, setCenter] = useState([9.0820, 8.6753]);
    const [existingFarms, setExistingFarms] = useState([]);
    const [mapLayer, setMapLayer] = useState('satellite');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const drawnLayerRef = useRef(null);
    const [isEditingBoundary, setIsEditingBoundary] = useState(false);
    
    const { 
      farms,
      addFarm, 
      updateFarm,
      setDrawnPolygon, 
      drawnPolygon, 
      hasOverlap, 
      setHasOverlap,
      currentFarm,
      editingFarmIndex,
      setEditingFarm,
      resetFarmState
    } = useFarmStore();
  
    const { isTracing, startTracing, stopTracing, coordinates } = useTraceMode(mapInstance);
  
    const handleTraceToggle = () => {
      if (isTracing) {
        const tracedCoords = stopTracing();
        if (tracedCoords.length > 2) {
          const polygon = tracedCoords.map(coord => [coord[1], coord[0]]); // Convert to [lng, lat] format
          setDrawnPolygon(polygon);
          
          // Check for overlap
          const geoJSON = {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [polygon]
            }
          };
          
          const hasOverlap = checkOverlap(geoJSON, existingFarms);
          setHasOverlap(hasOverlap);
          
          // Create visual polygon
          if (drawnLayerRef.current) {
            drawnLayerRef.current.remove();
          }
          drawnLayerRef.current = L.polygon(tracedCoords, {
            color: hasOverlap ? 'red' : '#4CAF50'
          }).addTo(mapInstance);
          
          setIsFormOpen(true);
        }
      } else {
        startTracing();
      }
    };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCenter([position.coords.latitude, position.coords.longitude]),
        (error) => console.error('Error getting location:', error)
      );
    }

    const loadFarms = async () => {
      try {
        const data = await farmService.getFarmGeometries();
        console.log('Received farm geometries:', data.geometries);
        setExistingFarms(data.geometries);
      } catch (error) {
        console.error('Error loading farms:', error);
      }
    };
    loadFarms();
  }, []);

  const handleCreated = (e) => {
    const layer = e.layer;
    drawnLayerRef.current = layer;
    const geoJSON = layer.toGeoJSON();
    
    const hasOverlap = checkOverlap(geoJSON, existingFarms);
    setHasOverlap(hasOverlap);
    
    if (hasOverlap) {
      layer.setStyle({ color: 'red', fillColor: 'red' });
    }
    
    setDrawnPolygon(geoJSON.geometry.coordinates[0]);
    setIsFormOpen(true);
  };

  const handleSubmit = (farmData) => {
    const farmWithGeometry = {
      ...farmData,
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[drawnPolygon]]
      },
      hasOverlap
    };

    if (editingFarmIndex !== null) {
      updateFarm(editingFarmIndex, farmWithGeometry);
    } else {
      addFarm(farmWithGeometry);
    }

    // Clear drawing state
    if (drawnLayerRef.current) {
      drawnLayerRef.current.remove();
      drawnLayerRef.current = null;
    }
    
    resetFormState();
  };

  const resetFormState = () => {
    setDrawnPolygon(null);
    setIsFormOpen(false);
    setHasOverlap(false);
    setIsEditingBoundary(false);
    resetFarmState();
  };

  const startBoundaryEdit = (farmIndex) => {
    const farm = farms[farmIndex];
    if (!farm || !mapInstance) return;

    setIsEditingBoundary(true);
    
    // Fly to farm location
    const bounds = L.geoJSON(farm.geometry).getBounds();
    mapInstance.flyToBounds(bounds);

    // Add farm geometry to edit layer
    if (editableFG.current) {
      const layer = L.geoJSON(farm.geometry);
      drawnLayerRef.current = layer;
      layer.addTo(editableFG.current);

      // Enable edit mode
      const editControl = editableFG.current?.leafletElement?._toolbars?.edit;
      if (editControl) {
        editControl._modes.edit.handler.enable();
      }
    }
  };

  const handleBoundaryEditComplete = (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      const newGeometry = layer.toGeoJSON().geometry;
      if (editingFarmIndex !== null && currentFarm) {
        updateFarm(editingFarmIndex, {
          ...currentFarm,
          geometry: newGeometry
        });
      }
    });
    
    setIsEditingBoundary(false);
    resetFarmState();
  };

  const existingFarmsStyle = {
    color: '#FFA500', // Orange color
    weight: 2,
    opacity: 0.8,
    fillColor: '#FFA500', // Orange fill
    fillOpacity: 0.2
  };

  return (
    <div className="relative h-full" style={{ zIndex: 0 }}>
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
      >
        <MapController onMapReady={setMapInstance} />
        
        {mapLayer === 'satellite' ? (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri"
          />
        ) : (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}

        {/* Existing farms */}
        {farms.map((farm, index) => (
          farm.geometry && editingFarmIndex !== index && (
            <GeoJSON 
              key={farm.id || index}
              data={farm.geometry}
              style={existingFarmsStyle}
            />
          )
        ))}

         {/* Existing farms */}
         {existingFarms.map((farm, index) => (
          farm.geometry && (
            <GeoJSON 
              key={farm.id || index}
              data={farm.geometry}
              style={{
                color: '#FFA500',
                weight: 2,
                opacity: 0.8,
                fillColor: '#FFA500',
                fillOpacity: 0.2
              }}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(`
                  <strong>Farm Info</strong><br/>
                  Area: ${farm.area} Ha<br/>
                  Type: ${farm.farm_type}
                `);
              }}
            />
          )
        ))}

        {/* Draw control - disabled during tracing */}
        {!isTracing && (
          <FeatureGroup ref={editableFG}>
            <EditControl
              position="bottomright"
              onCreated={handleCreated}
              onEdited={handleBoundaryEditComplete}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                  allowIntersection: false,
                  drawError: {
                    color: '#e1e4e8',
                    message: '<strong>Oh snap!<strong> you can\'t draw that!'
                  },
                  shapeOptions: {
                    color: '#4CAF50'
                  }
                }
              }}
              edit={{
                edit: false,
                remove: false,
                featureGroup: editableFG.current
              }}
            />
          </FeatureGroup>
        )}

        {/* Controls */}
        <div className="absolute top-2 right-2 z-[1000]">
          <LayerControls
            currentLayer={mapLayer}
            onLayerChange={setMapLayer}
            isTracing={isTracing}
            onTraceToggle={handleTraceToggle}
          />
        </div>
        
        <div className="absolute top-16 right-4 z-[1000]">
          <LocationButton />
        </div>
      </MapContainer>

      {/* Warnings and Form */}
      {hasOverlap && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
          Warning: Farm boundary overlaps with existing farms
        </div>
      )}

      <FarmForm
        isOpen={isFormOpen}
        onClose={resetFormState}
        onSubmit={handleSubmit}
        onEditBoundary={() => {
          setIsFormOpen(false);
          if (editingFarmIndex !== null) {
            startBoundaryEdit(editingFarmIndex);
          }
        }}
        isEditing={editingFarmIndex !== null}
        farm={currentFarm}
        drawnPolygon={drawnPolygon}
      />
    </div>
  );
};

export default MapSection;