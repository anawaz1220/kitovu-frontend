// src/components/dashboard/AbiaStateSummaryLayer.jsx
import React, { useState, useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchAbiaStateSummary } from '../../services/api/abiaStateSummary.service';
import AbiaStateSummaryDrawer from './AbiaStateSummaryDrawer';

/**
 * Component that renders the Abia state summary layer
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the layer should be visible
 */
const AbiaStateSummaryLayer = ({ 
  visible,
  showFarmersOnMap = false,
  showFarmsOnMap = false,
  onToggleFarmersOnMap,
  onToggleFarmsOnMap
}) => {
  const map = useMap();
  const [summaryData, setSummaryData] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFittedBounds, setHasFittedBounds] = useState(false);

  // Create analytics pane with lower z-index
  useEffect(() => {
    if (!map) return;
    
    if (!map.getPane('analyticsPane')) {
      const analyticsPane = map.createPane('analyticsPane');
      analyticsPane.style.zIndex = 400; // Lower than farms
    }
  }, [map]);

  // Fetch data and show drawer when layer becomes visible
  useEffect(() => {
    if (!visible) {
      setSummaryData(null);
      setGeoJsonData(null);
      setHasFittedBounds(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching Abia state summary...');
        
        const { geoJsonData, rawSummary } = await fetchAbiaStateSummary();
        setSummaryData(rawSummary);
        setGeoJsonData(geoJsonData);
        
        console.log('Abia state summary loaded successfully');
      } catch (err) {
        console.error('Error fetching Abia state summary:', err);
        setError('Failed to load Abia state summary');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [visible]);

  // Fit bounds to Abia state when data is loaded - EVERY TIME layer is checked
  useEffect(() => {
    if (!visible || !geoJsonData) return;

    try {
      // Create a temporary GeoJSON layer to get bounds
      const tempLayer = L.geoJSON(geoJsonData);
      const bounds = tempLayer.getBounds();
      
      if (bounds.isValid()) {
        console.log('Flying to Abia state bounds...');
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 9
        });
      }
    } catch (error) {
      console.error('Error fitting bounds to Abia state:', error);
    }
  }, [visible, geoJsonData, map]); // Removed hasFittedBounds dependency

  // Simple layer style - no glow effects
  const layerStyle = {
    fillColor: 'rgba(59, 130, 246, 0.2)',
    weight: 2,
    opacity: 1,
    color: '#3b82f6',
    fillOpacity: 0.2,
    dashArray: ''
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    // This should trigger the parent to uncheck the layer
    console.log('Drawer close requested - layer should be unchecked');
  };

  // Don't render if not visible
  if (!visible) return null;

  return (
    <>
      {/* Render the GeoJSON layer if we have data */}
      {geoJsonData && (
        <GeoJSON
          key="abia-state-summary"
          data={geoJsonData}
          style={() => layerStyle}
          interactive={false}
          pane="analyticsPane"
        />
      )}

      {/* Show drawer only when layer is visible */}
      <AbiaStateSummaryDrawer
        isOpen={visible}
        onClose={handleDrawerClose}
        summaryData={summaryData}
        isLoading={isLoading}
        error={error}
        showFarmersOnMap={showFarmersOnMap}
        showFarmsOnMap={showFarmsOnMap}
        onToggleFarmersOnMap={onToggleFarmersOnMap}
        onToggleFarmsOnMap={onToggleFarmsOnMap}
      />
    </>
  );
};

export default AbiaStateSummaryLayer;