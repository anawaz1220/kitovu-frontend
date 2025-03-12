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
    const { data } = await api.get('/locations/farmers-count', { params });
    return data;
  } catch (error) {
    console.error('Error fetching farmers count by location:', error);
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
    const { data } = await api.get('/locations/crops', { params });
    return data;
  } catch (error) {
    console.error('Error fetching crops by location:', error);
    throw error;
  }
};