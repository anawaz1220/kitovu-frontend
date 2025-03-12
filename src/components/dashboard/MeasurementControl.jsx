// src/components/dashboard/MeasurementControl.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from '../../utils/leafletSetup';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MeasurementControl.css';

/**
 * A measurement control for the map that allows measuring distances and areas
 */
const MeasurementControl = () => {
  const map = useMap();
  const [measureType, setMeasureType] = useState(null); // null, 'length', or 'area'
  const activeControlRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const activeMarkers = useRef([]);
  const isDrawingRef = useRef(false);
  
  // Initialize the measurement controls
  useEffect(() => {
    if (!map) return;
    
    // Create a layer group for drawn items if it doesn't exist
    if (!drawnItemsRef.current) {
      drawnItemsRef.current = new L.FeatureGroup();
      map.addLayer(drawnItemsRef.current);
    }
    
    // Define the measurement button control
    const measurementButtonControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control measurement-control');
        
        // Length measurement button
        const lengthButton = L.DomUtil.create('button', 'measurement-button', container);
        lengthButton.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M2 12h20"/><path d="M18 8l4 4-4 4"/><path d="M6 8l-4 4 4 4"/></svg>';
        lengthButton.title = 'Measure distance';
        lengthButton.id = 'measure-length-btn';
        
        // Area measurement button
        const areaButton = L.DomUtil.create('button', 'measurement-button', container);
        areaButton.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/></svg>';
        areaButton.title = 'Measure area';
        areaButton.id = 'measure-area-btn';
        
        // Clear measurements button
        const clearButton = L.DomUtil.create('button', 'measurement-button', container);
        clearButton.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>';
        clearButton.title = 'Clear measurements';
        clearButton.id = 'clear-measure-btn';
        
        // Prevent propagation of click events to map
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
        
        // Add event listeners
        L.DomEvent.on(lengthButton, 'click', function(e) {
          L.DomEvent.preventDefault(e);
          L.DomEvent.stopPropagation(e);
          
          if (isDrawingRef.current) {
            // If already drawing, finish the current drawing
            finishCurrentDrawing();
            return;
          }
          
          if (measureType === 'length') {
            // Toggle off if already selected
            setMeasureType(null);
          } else {
            // Activate length measurement
            setMeasureType('length');
            isDrawingRef.current = true;
          }
        });
        
        L.DomEvent.on(areaButton, 'click', function(e) {
          L.DomEvent.preventDefault(e);
          L.DomEvent.stopPropagation(e);
          
          if (isDrawingRef.current) {
            // If already drawing, finish the current drawing
            finishCurrentDrawing();
            return;
          }
          
          if (measureType === 'area') {
            // Toggle off if already selected
            setMeasureType(null);
          } else {
            // Activate area measurement
            setMeasureType('area');
            isDrawingRef.current = true;
          }
        });
        
        L.DomEvent.on(clearButton, 'click', function(e) {
          L.DomEvent.preventDefault(e);
          L.DomEvent.stopPropagation(e);
          
          // Cancel any active drawing
          if (isDrawingRef.current) {
            try {
              map.fire('draw:cancel');
              isDrawingRef.current = false;
            } catch (err) {
              console.log('Error canceling draw:', err);
            }
          }
          
          // Clear all measurements
          clearMeasurements();
          
          // Reset tool state
          setMeasureType(null);
        });
        
        return container;
      }
    });
    
    // Function to finish current drawing
    const finishCurrentDrawing = () => {
      try {
        // Trigger a click on the map to finish drawing
        map.fire('draw:drawstop');
        isDrawingRef.current = false;
      } catch (e) {
        console.log('Error finishing drawing:', e);
      }
    };
    
    // Add the measurement button control to the map
    const buttonControl = new measurementButtonControl();
    map.addControl(buttonControl);
    
    // Set up the draw controls for measurement
    const drawControl = {
      polyline: {
        shapeOptions: {
          color: '#7a49a5',
          weight: 3
        },
        showLength: true,
        metric: true,
        feet: false
      },
      polygon: {
        shapeOptions: {
          color: '#7a49a5',
          weight: 3
        },
        showArea: true,
        allowIntersection: false,
        metric: true,
        precision: { km: 2 }
      }
    };
    
    // Create separate controls for line and area
    const lineDrawHandler = new L.Draw.Polyline(map, drawControl.polyline);
    const polygonDrawHandler = new L.Draw.Polygon(map, drawControl.polygon);
    
    // Store active controls
    activeControlRef.current = {
      buttonControl,
      lineDrawHandler,
      polygonDrawHandler,
    };
    
    return () => {
      map.removeControl(buttonControl);
      clearMeasurements();
    };
  }, [map]);
  
  // Function to clear all measurements
  const clearMeasurements = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
    
    // Clear vertex markers
    if (activeMarkers.current.length > 0) {
      activeMarkers.current.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
      activeMarkers.current = [];
    }
  };
  
  // Activate/deactivate measurement tools based on measureType
  useEffect(() => {
    if (!map || !activeControlRef.current) return;
    
    // Cancel any active drawing when switching tools
    if (measureType === null) {
      try {
        map.fire('draw:cancel');
        isDrawingRef.current = false;
      } catch (e) {
        console.log('No active drawing to cancel');
      }
      
      // Disable drawing handlers
      if (activeControlRef.current.lineDrawHandler) {
        activeControlRef.current.lineDrawHandler.disable();
      }
      if (activeControlRef.current.polygonDrawHandler) {
        activeControlRef.current.polygonDrawHandler.disable();
      }
    }
    
    // Activate the appropriate drawing handler
    if (measureType === 'length') {
      if (activeControlRef.current.polygonDrawHandler) {
        activeControlRef.current.polygonDrawHandler.disable();
      }
      if (activeControlRef.current.lineDrawHandler) {
        activeControlRef.current.lineDrawHandler.enable();
      }
    } else if (measureType === 'area') {
      if (activeControlRef.current.lineDrawHandler) {
        activeControlRef.current.lineDrawHandler.disable();
      }
      if (activeControlRef.current.polygonDrawHandler) {
        activeControlRef.current.polygonDrawHandler.enable();
      }
    }
    
    // Update button states
    const lengthBtn = document.getElementById('measure-length-btn');
    const areaBtn = document.getElementById('measure-area-btn');
    
    if (lengthBtn) {
      lengthBtn.classList.toggle('active', measureType === 'length');
    }
    if (areaBtn) {
      areaBtn.classList.toggle('active', measureType === 'area');
    }
    
    // Add draw events for measurements
    const handleDrawCreated = (e) => {
      const layer = e.layer;
      
      // Add the completed shape to our feature group
      if (drawnItemsRef.current) {
        drawnItemsRef.current.addLayer(layer);
      }
      
      // Display measurement result
      if (e.layerType === 'polyline') {
        // Get line points
        const latlngs = layer.getLatLngs();
        const totalLengthInMeters = calculatePolylineLength(latlngs);
        const lengthInKm = (totalLengthInMeters / 1000).toFixed(2);
        
        // Create a tooltip at the end of the line
        layer.bindTooltip(`Total: ${lengthInKm} km`, {
          permanent: true,
          direction: 'top',
          className: 'measurement-tooltip'
        }).openTooltip();
        
        // Add segment tooltips if there are multiple segments
        if (latlngs.length > 1) {
          for (let i = 0; i < latlngs.length - 1; i++) {
            const segmentLength = latlngs[i].distanceTo(latlngs[i + 1]);
            const segmentLengthKm = (segmentLength / 1000).toFixed(2);
            
            // Only show segment tooltip if segment is significant
            if (segmentLength > 10) {  // Only show if segment is > 10 meters
              const midPoint = L.latLng(
                (latlngs[i].lat + latlngs[i + 1].lat) / 2,
                (latlngs[i].lng + latlngs[i + 1].lng) / 2
              );
              
              const marker = L.marker(midPoint, {
                icon: L.divIcon({
                  className: 'measurement-vertex-label',
                  html: `<div class="measurement-tooltip segment-tooltip">${segmentLengthKm} km</div>`,
                  iconSize: [80, 30],
                  iconAnchor: [40, 15]
                })
              }).addTo(map);
              
              activeMarkers.current.push(marker);
            }
          }
        }
      } else if (e.layerType === 'polygon') {
        // Calculate area of the polygon
        const latlngs = layer.getLatLngs()[0]; // First ring of coordinates
        const areaInSqMeters = L.GeometryUtil.geodesicArea(latlngs);
        const areaInAcres = (areaInSqMeters * 0.000247105).toFixed(2);
        
        // Create a tooltip in the center of the polygon
        layer.bindTooltip(`Area: ${areaInAcres} acres`, {
          permanent: true,
          direction: 'center',
          className: 'measurement-tooltip'
        }).openTooltip();
      }
      
      // Reset the drawing state but keep the measurement type active
      isDrawingRef.current = false;
    };
    
    map.on('draw:created', handleDrawCreated);
    
    // Add drawing started event
    const handleDrawStart = () => {
      isDrawingRef.current = true;
    };
    
    // Add drawing stopped event
    const handleDrawStop = () => {
      isDrawingRef.current = false;
    };
    
    map.on('draw:drawstart', handleDrawStart);
    map.on('draw:drawstop', handleDrawStop);
    
    // Listen for vertex events to show live measurements
    const handleDrawVertex = (e) => {
      // For polylines, show segment measurements as they're being drawn
      if (measureType === 'length' && e.layers && e.layers.length >= 2) {
        const vertices = e.layers;
        
        // Remove old temporary markers except the last one
        while (activeMarkers.current.length > 1) {
          const marker = activeMarkers.current.shift();
          if (marker && marker.remove) {
            marker.remove();
          }
        }
        
        // Calculate last segment length
        const lastIndex = vertices.length - 1;
        const pt1 = vertices[lastIndex - 1];
        const pt2 = vertices[lastIndex];
        
        // Calculate segment distance
        const segmentDistanceM = pt1.distanceTo(pt2);
        const segmentDistanceKm = (segmentDistanceM / 1000).toFixed(2);
        
        // Create or update marker at midpoint with distance
        const midPoint = L.latLng(
          (pt1.lat + pt2.lat) / 2,
          (pt1.lng + pt2.lng) / 2
        );
        
        const marker = L.marker(midPoint, {
          icon: L.divIcon({
            className: 'measurement-vertex-label',
            html: `<div class="measurement-tooltip segment-tooltip">${segmentDistanceKm} km</div>`,
            iconSize: [80, 30],
            iconAnchor: [40, 15]
          })
        }).addTo(map);
        
        // Keep track of temporary marker
        activeMarkers.current.push(marker);
        
        // Show running total at the last vertex
        let totalLength = 0;
        for (let i = 0; i < vertices.length - 1; i++) {
          totalLength += vertices[i].distanceTo(vertices[i + 1]);
        }
        
        const totalLengthKm = (totalLength / 1000).toFixed(2);
        
        // Only add total marker if it doesn't exist yet
        if (activeMarkers.current.length === 1) {
          const totalMarker = L.marker(pt2, {
            icon: L.divIcon({
              className: 'measurement-vertex-label',
              html: `<div class="measurement-tooltip total-tooltip">Total: ${totalLengthKm} km</div>`,
              iconSize: [100, 30],
              iconAnchor: [50, -10]
            })
          }).addTo(map);
          
          activeMarkers.current.push(totalMarker);
        } else if (activeMarkers.current.length > 1) {
          // Update the existing total marker
          const totalMarker = activeMarkers.current[activeMarkers.current.length - 1];
          totalMarker.setLatLng(pt2);
          totalMarker.setIcon(L.divIcon({
            className: 'measurement-vertex-label',
            html: `<div class="measurement-tooltip total-tooltip">Total: ${totalLengthKm} km</div>`,
            iconSize: [100, 30],
            iconAnchor: [50, -10]
          }));
        }
      }
    };
    
    map.on('draw:drawvertex', handleDrawVertex);
    
    return () => {
      map.off('draw:created', handleDrawCreated);
      map.off('draw:drawstart', handleDrawStart);
      map.off('draw:drawstop', handleDrawStop);
      map.off('draw:drawvertex', handleDrawVertex);
    };
  }, [map, measureType]);
  
  // Helper function to calculate polyline length
  const calculatePolylineLength = (latlngs) => {
    let totalDistance = 0;
    
    if (Array.isArray(latlngs) && latlngs.length > 1) {
      for (let i = 0; i < latlngs.length - 1; i++) {
        if (latlngs[i] && latlngs[i+1] && typeof latlngs[i].distanceTo === 'function') {
          totalDistance += latlngs[i].distanceTo(latlngs[i + 1]);
        }
      }
    }
    
    return totalDistance;
  };
  
  return null; // This component doesn't render anything directly
};

export default MeasurementControl;