// src/services/api/location.service.js
import api from './axios.config';

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
    
    // For testing purposes (comment out or remove in production)
    console.log('API response data:', data);
    
    // Return data in GeoJSON format (assuming backend returns proper format)
    return data;
  } catch (error) {
    console.error('Error fetching farmers count by location:', error);
    // For debugging
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
    
    // For testing purposes
    console.log('API response data:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching crops by location:', error);
    // For debugging
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};