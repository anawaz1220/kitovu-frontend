// src/hooks/useMapData.js
import { useState, useEffect } from 'react';
import { 
  fetchFarmersCountByLocation, 
  fetchCropsByLocation,
  fetchAbiaStateBoundary,
  fetchAbiaLGABoundaries
} from '../services/api/location.service';
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

  // Fetch Abia state boundary
  useEffect(() => {
    const fetchAbiaStateData = async () => {
      if (stateData) return; // Don't fetch if we already have the data
      
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching Abia state boundary...');
        const data = await fetchAbiaStateBoundary();
        setStateData(data);
        console.log('Abia state boundary loaded successfully');
      } catch (error) {
        console.error('Error fetching Abia state boundary:', error);
        setError('Failed to load Abia state boundary');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (activeLayers.stateBoundary) {
      fetchAbiaStateData();
    }
  }, [activeLayers.stateBoundary, stateData]);

  // Fetch Abia LGA boundaries
  useEffect(() => {
    const fetchAbiaLGAData = async () => {
      if (lgaData) return; // Don't fetch if we already have the data
      
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching Abia LGA boundaries...');
        const data = await fetchAbiaLGABoundaries();
        setLgaData(data);
        console.log('Abia LGA boundaries loaded successfully');
      } catch (error) {
        console.error('Error fetching Abia LGA boundaries:', error);
        setError('Failed to load Abia LGA boundaries');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (activeLayers.lgaBoundary) {
      fetchAbiaLGAData();
    }
  }, [activeLayers.lgaBoundary, lgaData]);

  // Fetch other data layers (distribution layers)
  useEffect(() => {
    const fetchDistributionLayers = async () => {
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
      } catch (error) {
        console.error('Error fetching distribution layers:', error);
        setError('Failed to load distribution data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const shouldFetchDistributionData = 
      (activeLayers.farmersByLGA && !farmerLGAData) || 
      (activeLayers.farmersByState && !farmerStateData) ||
      (activeLayers.commodityByLGA && !commodityLGAData) ||
      (activeLayers.commodityByState && !commodityStateData);
    
    if (shouldFetchDistributionData) {
      fetchDistributionLayers();
    }
  }, [
    activeLayers, 
    farmerLGAData, 
    farmerStateData, 
    commodityLGAData, 
    commodityStateData
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