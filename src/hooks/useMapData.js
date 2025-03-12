// src/hooks/useMapData.js
import { useState, useEffect } from 'react';
import { fetchFarmersCountByLocation, fetchCropsByLocation } from '../services/api/location.service';
import { formatGeoJsonFromResponse } from '../components/dashboard/utils/mapConfig';

/**
 * Custom hook to fetch and manage map data layers
 * @param {Object} activeLayers - Object containing active layer states
 * @returns {Object} Map data and loading states
 */
const useMapData = (activeLayers) => {
  const [farmerStateData, setFarmerStateData] = useState(null);
  const [farmerLGAData, setFarmerLGAData] = useState(null);
  const [commodityStateData, setCommodityStateData] = useState(null);
  const [commodityLGAData, setCommodityLGAData] = useState(null);
  const [stateData, setStateData] = useState(null);
  const [lgaData, setLgaData] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch country boundary GeoJSON
  useEffect(() => {
    const fetchCountryData = async () => {
      // Don't fetch if we already have the data
      if (countryData) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/nigeria_boundary.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setCountryData(data);
      } catch (error) {
        console.error('Error fetching country boundary:', error);
        setError('Failed to load country boundary data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (activeLayers.countryBoundary) {
      fetchCountryData();
    }
  }, [activeLayers.countryBoundary, countryData]);

  // Fetch other data layers
  useEffect(() => {
    const fetchLayers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch farmers by LGA data
        if (activeLayers.farmersByLGA && !farmerLGAData) {
          const data = await fetchFarmersCountByLocation({ type: 'LGA' });
          setFarmerLGAData(formatGeoJsonFromResponse(data));
        }

        // Fetch farmers by state data
        if (activeLayers.farmersByState && !farmerStateData) {
          const data = await fetchFarmersCountByLocation({ type: 'State' });
          setFarmerStateData(formatGeoJsonFromResponse(data));
        }

        // Fetch commodity by LGA data
        if (activeLayers.commodityByLGA && !commodityLGAData) {
          const data = await fetchCropsByLocation({ type: 'LGA' });
          setCommodityLGAData(formatGeoJsonFromResponse(data));
        }

        // Fetch commodity by state data
        if (activeLayers.commodityByState && !commodityStateData) {
          const data = await fetchCropsByLocation({ type: 'State' });
          setCommodityStateData(formatGeoJsonFromResponse(data));
        }
        
        // Fetch state boundaries
        if (activeLayers.stateBoundary && !stateData) {
          const data = await fetchFarmersCountByLocation({ type: 'State' });
          setStateData(formatGeoJsonFromResponse(data));
        }
        
        // Fetch LGA boundaries
        if (activeLayers.lgaBoundary && !lgaData) {
          const data = await fetchFarmersCountByLocation({ type: 'LGA' });
          setLgaData(formatGeoJsonFromResponse(data));
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
        setError('Failed to load map data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const shouldFetchData = 
      (activeLayers.farmersByLGA && !farmerLGAData) || 
      (activeLayers.farmersByState && !farmerStateData) ||
      (activeLayers.commodityByLGA && !commodityLGAData) ||
      (activeLayers.commodityByState && !commodityStateData) ||
      (activeLayers.stateBoundary && !stateData) ||
      (activeLayers.lgaBoundary && !lgaData);
    
    if (shouldFetchData) {
      fetchLayers();
    }
  }, [
    activeLayers, 
    farmerLGAData, 
    farmerStateData, 
    commodityLGAData, 
    commodityStateData, 
    stateData, 
    lgaData
  ]);

  return {
    farmerStateData,
    farmerLGAData,
    commodityStateData,
    commodityLGAData,
    stateData,
    lgaData,
    countryData,
    isLoading,
    error
  };
};

export default useMapData;