// src/components/farmer/FarmInfo/FarmMap.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  FeatureGroup,
  useMap,
  LayersControl,
  ZoomControl,
  Polygon, 
  Polyline,
  CircleMarker
} from 'react-leaflet';
import L from 'leaflet';
import { useTraceMode } from '../../../hooks/useTraceMode';
import DrawControls from './DrawControls';
import { 
  calculateAreaInHectares,
  checkOverlapWithExistingFarms,
  coordsToMultiPolygon,
  simplifyPolygon
} from './mapUtils';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

// Iseyin Central coordinates
const ISEYIN_COORDINATES = [7.96667, 3.60000];
const MIN_ZOOM = 13;
const MAX_ZOOM = 20;
const DEFAULT_ZOOM = 16;

// MapController handles map initialization and draw controls
const MapController = ({ onDrawComplete }) => {
  const map = useMap();
  const drawControlRef = useRef(null);

    useEffect(() => {
      // Initialize map view
      map.setView(ISEYIN_COORDINATES, DEFAULT_ZOOM);
      
      // Add scale control
      L.control.scale({
        imperial: false,
        position: 'bottomleft',
        maxWidth: 200
      }).addTo(map);

      // Initialize draw options
      L.drawLocal.draw.handlers.polygon.tooltip = {
        start: 'Click to start drawing farm',
        cont: 'Click to continue drawing farm',
        end: 'Click first point to close farm boundary'
      };

      // Setup event handlers for drawing
      const handleDrawCreated = (e) => {
        const layer = e.layer;
        const latlngs = layer.getLatLngs()[0];
        const coordinates = latlngs.map(latLng => [latLng.lat, latLng.lng]);
        
        // Remove the temporary drawing layer
        map.removeLayer(layer);
        
        // Pass the coordinates to parent
        onDrawComplete(coordinates);
      };

      map.on(L.Draw.Event.CREATED, handleDrawCreated);

      return () => {
        map.off(L.Draw.Event.CREATED, handleDrawCreated);
        if (drawControlRef.current) {
          map.removeControl(drawControlRef.current);
        }
      };
    }, 
  [map, onDrawComplete]);
};

const FarmMap = ({ 
  onAreaUpdate, 
  existingFarms = [], 
  currentPolygon,
  onPolygonUpdate,
  editMode = false,
  onEditModeChange,
  formData  // Form data context
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const mapRef = useRef(null);
  const [hasOverlap, setHasOverlap] = useState(false);

  // Tracing mode setup
  const {
    isTracing,
    accuracy,
    tracePoints,
    startTracing,
    stopTracing
  } = useTraceMode({
    onTraceComplete: (points) => {
      const simplified = simplifyPolygon(points.map(p => [p.lat, p.lng]));
      handlePolygonComplete(simplified);
    }
  });

  // Format existing farms for rendering
  const formattedFarms = useMemo(() => 
    existingFarms
      .filter(farm => farm.geometry)
      .map(farm => ({
        id: farm.id,
        coordinates: farm.geometry.coordinates[0][0],
      })),
    [existingFarms]
  );

  // Handle completion of polygon drawing/tracing
 const handlePolygonComplete = (coordinates) => {
  // End drawing mode
  setIsDrawingMode(false);

  // Check for overlap with existing farms
  const doesOverlap = checkOverlapWithExistingFarms(coordinates, formattedFarms);
  setHasOverlap(doesOverlap);

  // Calculate area
  const areaInHectares = calculateAreaInHectares(coordinates);
  onAreaUpdate(areaInHectares);

  // Create MultiPolygon string for API
  const multiPolygon = coordsToMultiPolygon(coordinates);
  
  // Update parent with coordinates for display
  onPolygonUpdate({
    multiPolygon,
    coordinates,
    hasOverlap: doesOverlap
  });
};

  // Start drawing mode
  // const startDrawing = () => {
  //   setIsDrawingMode(true);
  //   if (mapRef.current) {
  //     const drawControl = new L.Draw.Polygon(mapRef.current, {
  //       allowIntersection: false,
  //       showArea: true,
  //       shapeOptions: {
  //         color: '#7A2F99',
  //         fillOpacity: 0.2
  //       }
  //     });
  //     drawControl.enable();
  //   }
  // };

  const startDrawing = () => {
    setIsDrawingMode(true);
    if (mapRef.current) {
      const map = mapRef.current;
      
      // Create draw control with proper options
      const drawControl = new L.Draw.Polygon(map, {
        showLength: false,
        showArea: false,  // We'll calculate area ourselves
        allowIntersection: false,
        guidelineDistance: 10,
        shapeOptions: {
          color: '#7A2F99',
          fillColor: '#7A2F99',
          fillOpacity: 0.2,
          weight: 2
        },
        metric: true,
        feet: false,
        nautic: false
      });
      
      // Enable drawing
      drawControl.enable();
    }
  };

  // Update map when editing mode changes
  useEffect(() => {
    if (editMode && currentPolygon) {
      const map = mapRef.current;
      if (map) {
        // Center map on current polygon
        const bounds = L.latLngBounds(currentPolygon);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [editMode, currentPolygon]);

  return (
    <div className="h-[600px] bg-white rounded-lg shadow-sm overflow-hidden relative">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
          <div className="text-kitovu-purple">Loading farms...</div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        </div>
      )}

      {/* Drawing Controls */}
      <DrawControls 
        isDrawing={isDrawingMode}
        isTracing={isTracing}
        onStartDrawing={startDrawing}
        onStartTracing={startTracing}
        onStopTracing={stopTracing}
        accuracy={accuracy}
        hasOverlap={hasOverlap}
      />

      {/* Main Map */}
      <MapContainer
        ref={mapRef}
        center={ISEYIN_COORDINATES}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      >
        <ZoomControl position="topright" />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Satellite (High Res)" checked>
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              attribution="Google Satellite"
              maxZoom={MAX_ZOOM}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite with Labels">
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              attribution="Google Satellite"
              maxZoom={MAX_ZOOM}
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Hybrid">
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
              attribution="Google Hybrid"
              maxZoom={MAX_ZOOM}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapController 
          onDrawComplete={handlePolygonComplete}
        />
        
        {/* Render existing farms */}
        {formattedFarms.map((farm) => (
          <Polygon
            key={farm.id}
            positions={farm.coordinates}
            pathOptions={{
              color: '#7A2F99',
              fillColor: '#7A2F99',
              fillOpacity: 0.1,
              weight: 2,
              opacity: 0.8,
              dashArray: '5, 5'
            }}
          />
        ))}

        {/* Current farm being drawn or edited */}
        {currentPolygon && (
          <Polygon
            positions={currentPolygon}
            pathOptions={{
              color: hasOverlap ? '#EF4444' : '#7A2F99',
              fillColor: hasOverlap ? '#FEE2E2' : '#7A2F99',
              fillOpacity: 0.2,
              weight: 2,
              opacity: 1
            }}
          />
        )}

        {/* Trace mode line */}
        {isTracing && tracePoints.length > 0 && (
          <>
            <Polyline
              positions={tracePoints}
              pathOptions={{
                color: '#7A2F99',
                weight: 3
              }}
            />
            {tracePoints.map((point, index) => (
              <CircleMarker
                key={index}
                center={[point.lat, point.lng]}
                radius={3}
                pathOptions={{
                  color: '#7A2F99',
                  fillColor: '#7A2F99',
                  fillOpacity: 1
                }}
              />
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default FarmMap;