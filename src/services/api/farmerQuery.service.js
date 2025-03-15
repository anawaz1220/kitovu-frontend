// src/services/api/farmerQuery.service.js
import api from './axios.config';

// Helper function to get token
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

/**
 * Get all farmers or a specific farmer
 * @param {Object} params - Query parameters
 * @param {string} [params.farmer_id] - Optional farmer ID to fetch a specific record
 * @returns {Promise<Array|Object>} - Array of farmers or single farmer object
 */
const getFarmers = async (params) => {
  try {
    const token = getToken();
    const { data } = await api.get('/farmers', { 
      params,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  } catch (error) {
    console.error('Error fetching farmers:', error);
    throw error;
  }
};

/**
 * Get farms for a specific farmer
 * @param {string} farmerId - Farmer ID to fetch farms for
 * @returns {Promise<Array>} - Array of farm objects
 */
const getFarmsByFarmerId = async (farmerId) => {
  try {
    if (!farmerId) {
      throw new Error('Farmer ID is required');
    }
    
    const token = getToken();
    const { data } = await api.get('/farms', { 
      params: { farmer_id: farmerId },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching farms:', error);
    throw error;
  }
};

// Export as named exports
export { getFarmers, getFarmsByFarmerId };

// Also export as an object for compatibility with existing code
export const farmerQueryService = {
  getFarmers,
  getFarmsByFarmerId
};