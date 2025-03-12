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
export const getFarmers = async (params) => {
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

// Export as an object for easier importing
export const farmerQueryService = {
  getFarmers
};