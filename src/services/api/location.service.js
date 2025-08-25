// src/services/api/location.service.js
import api from './axios.config';

/**
 * Fetch Abia state boundary
 * @returns {Promise<Object>} - Abia state boundary data
 */
export const fetchAbiaStateBoundary = async () => {
  try {
    console.log('Fetching Abia state boundary...');
    const { data } = await api.get('/locations/abia-state/boundary');
    
    console.log('Abia state boundary data:', data);
    
    // Transform to GeoJSON format
    const geoJsonData = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {
          name: data.name,
          type: data.type
        },
        geometry: JSON.parse(data.geom)
      }]
    };
    
    return geoJsonData;
  } catch (error) {
    console.error('Error fetching Abia state boundary:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

/**
 * Fetch Abia state LGA boundaries
 * @returns {Promise<Object>} - Abia state LGAs boundary data
 */
export const fetchAbiaLGABoundaries = async () => {
  try {
    console.log('Fetching Abia state LGA boundaries...');
    const { data } = await api.get('/locations/abia-state/lgas/boundaries');
    
    console.log('Abia LGAs boundary data:', data);
    
    // Transform to GeoJSON format
    const geoJsonData = {
      type: 'FeatureCollection',
      features: data.lgas.map(lga => ({
        type: 'Feature',
        properties: {
          name: lga.name,
          type: lga.type,
          state_name: data.state_name
        },
        geometry: JSON.parse(lga.geom)
      }))
    };
    
    return geoJsonData;
  } catch (error) {
    console.error('Error fetching Abia LGA boundaries:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

// Keep existing functions for backward compatibility
/**
 * Fetch farmers count by location
 * @param {Object} params - Query parameters
 * @param {string} params.type - Location type (e.g., 'LGA', 'State')
 * @param {string} [params.name] - Optional location name filter
 * @returns {Promise<Array>} - Array of location data with farmer counts
 */
export const fetchFarmersCountByLocation = async (params) => {
  try {
    console.log('Fetching farmers count with params:', params);
    const { data } = await api.get('/locations/farmers-count', { params });
    
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching farmers count by location:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

/**
 * Fetch crops data by location
 * @param {Object} params - Query parameters
 * @param {string} params.type - Location type (e.g., 'LGA', 'State')
 * @param {string} [params.crop] - Optional crop type filter
 * @returns {Promise<Array>} - Array of location data with crop information
 */
export const fetchCropsByLocation = async (params) => {
  try {
    console.log('Fetching crops with params:', params);
    const { data } = await api.get('/locations/crops', { params });
    
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching crops by location:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

/**
 * Fetch farmers locations for clustering
 * @returns {Promise<Object>} - Farmers location data with coordinates
 */
export const fetchFarmersLocations = async () => {
  try {
    console.log('Fetching farmers locations...');
    const { data } = await api.get('/locations/abia-state/farmers-locations');
    
    console.log('Farmers locations data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching farmers locations:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

/**
 * Fetch farms locations for clustering
 * @returns {Promise<Object>} - Farms location data with coordinates and geometry
 */
export const fetchFarmsLocations = async () => {
  try {
    console.log('Fetching farms locations...');
    const { data } = await api.get('/locations/abia-state/farms-locations');
    
    console.log('Farms locations data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching farms locations:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};
