// src/components/dashboard/DataLayers.jsx
import React, { useEffect, useState, useRef } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { fetchFarmersCountByLocation, fetchCropsByLocation } from '../../services/api/location.service';
import { formatGeoJsonFromResponse } from './utils/mapConfig';
import { 
  farmersStyle, 
  cropsStyle, 
  countryStyle, 
  stateStyle, 
  lgaStyle 
} from './utils/mapStyles';
import {
  onEachFarmerFeature,
  onEachCropFeature,
  onEachStateFeature,
  onEachLGAFeature,
  safelyFitBounds
} from './utils/mapInteractions';

const DataLayers = ({ activeLayers }) => {
  const [farmersData, setFarmersData] = useState(null);
  const [cropsData, setCropsData] = useState(null);
  const [stateData, setStateData] = useState(null);
  const [lgaData, setLgaData] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const countryLayerRef = useRef(null);
  const stateLayerRef = useRef(null);
  const lgaLayerRef = useRef(null);
  
  const map = useMap();

  // Fetch country boundary GeoJSON
  useEffect(() => {
    const fetchCountryData = async () => {
      // Don't fetch if we already have the data
      if (countryData) return;
      
      try {
        const response = await fetch('/nigeria_boundary.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setCountryData(data);
      } catch (error) {
        console.error('Error fetching country boundary:', error);
      }
    };
    
    if (activeLayers.countryBoundary) {
      fetchCountryData();
    }
  }, [activeLayers.countryBoundary, countryData]);

  // Fetch data layers based on active layers
  useEffect(() => {
    const fetchData = async () => {
      // Fetch farmers data by LGA
      if (activeLayers.farmers && !farmersData) {
        setIsLoading(true);
        try {
          const data = await fetchFarmersCountByLocation({ type: 'LGA' });
          setFarmersData(data);
        } catch (error) {
          console.error('Error fetching farmers data:', error);
        } finally {
          setIsLoading(false);
        }
      }

      // Fetch crop distribution data
      if (activeLayers.cropDistribution && !cropsData) {
        setIsLoading(true);
        try {
          const data = await fetchCropsByLocation({ type: 'LGA' });
          setCropsData(data);
        } catch (error) {
          console.error('Error fetching crops data:', error);
        } finally {
          setIsLoading(false);
        }
      }
      
      // Fetch state boundaries with farmer count
      if (activeLayers.stateBoundary) {
        setIsLoading(true);
        try {
          console.log('Fetching state boundaries...');
          const data = await fetchFarmersCountByLocation({ type: 'State' });
          console.log('State boundaries data:', data);
          
          // Convert data to proper GeoJSON format
          const geoJsonData = formatGeoJsonFromResponse(data);
          setStateData(geoJsonData);
        } catch (error) {
          console.error('Error fetching state boundaries:', error);
        } finally {
          setIsLoading(false);
        }
      }
      
      // Fetch LGA boundaries with farmer count
      if (activeLayers.lgaBoundary) {
        setIsLoading(true);
        try {
          console.log('Fetching LGA boundaries...');
          const data = await fetchFarmersCountByLocation({ type: 'LGA' });
          console.log('LGA boundaries data:', data);
          
          // Convert data to proper GeoJSON format
          const geoJsonData = formatGeoJsonFromResponse(data);
          setLgaData(geoJsonData);
        } catch (error) {
          console.error('Error fetching LGA boundaries:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [activeLayers]);
  
  // Handle layer visibility and bounds fitting
  useEffect(() => {
    if (activeLayers.countryBoundary && countryData && countryLayerRef.current) {
      safelyFitBounds(map, countryLayerRef);
    }
    
    if (activeLayers.stateBoundary && stateData && stateLayerRef.current) {
      safelyFitBounds(map, stateLayerRef);
    }
    
    if (activeLayers.lgaBoundary && lgaData && lgaLayerRef.current) {
      safelyFitBounds(map, lgaLayerRef);
    }
  }, [activeLayers, countryData, stateData, lgaData, map]);

  return (
    <>
      {/* Country Boundary Layer */}
      {activeLayers.countryBoundary && countryData && (
        <GeoJSON 
          key="country-boundary"
          data={countryData} 
          style={countryStyle}
          ref={countryLayerRef}
          interactive={false}
        />
      )}
      
      {/* State Boundaries Layer */}
      {activeLayers.stateBoundary && stateData && stateData.features && stateData.features.length > 0 && (
        <GeoJSON 
          key="state-boundaries"
          data={stateData} 
          style={stateStyle}
          onEachFeature={onEachStateFeature}
          ref={(el) => {
            stateLayerRef.current = el;
            // Try to fit bounds after layer is rendered
            if (el && activeLayers.stateBoundary) {
              safelyFitBounds(map, { current: el });
            }
          }}
        />
      )}
      
      {/* LGA Boundaries Layer */}
      {activeLayers.lgaBoundary && lgaData && lgaData.features && lgaData.features.length > 0 && (
        <GeoJSON 
          key="lga-boundaries"
          data={lgaData} 
          style={lgaStyle}
          onEachFeature={onEachLGAFeature}
          ref={(el) => {
            lgaLayerRef.current = el;
            // Try to fit bounds after layer is rendered
            if (el && activeLayers.lgaBoundary) {
              safelyFitBounds(map, { current: el });
            }
          }}
        />
      )}
      
      {/* Farmers Distribution Layer */}
      {activeLayers.farmers && farmersData && (
        <GeoJSON 
          key="farmers-distribution"
          data={farmersData} 
          style={farmersStyle}
          onEachFeature={onEachFarmerFeature}
        />
      )}
      
      {/* Crop Distribution Layer */}
      {activeLayers.cropDistribution && cropsData && (
        <GeoJSON 
          key="crop-distribution"
          data={cropsData} 
          style={cropsStyle}
          onEachFeature={onEachCropFeature}
        />
      )}
    </>
  );
};

export default DataLayers;