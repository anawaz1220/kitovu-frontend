// src/services/api/farmerQuery.service.js
import api from './axios.config';

// Helper function to get token
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Cache for search results and farmer details
const searchCache = new Map();
const farmerCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Search farmers by query string
 * @param {string} query - Search query (minimum 2 characters)
 * @returns {Promise<Array>} - Array of farmer search results
 */
const searchFarmers = async (query) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    // Check cache first
    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = searchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached search results for:', query);
      return cached.data;
    }

    console.log('Searching farmers with query:', query);
    const token = getToken();
    const { data } = await api.get('/farmers/search', { 
      params: { q: query },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Cache the results
    searchCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    console.log(`Found ${data.length} farmers for query:`, query);
    return data;
  } catch (error) {
    console.error('Error searching farmers:', error);
    throw error;
  }
};

/**
 * Get specific farmer details by farmer_id
 * @param {string} farmerId - Farmer ID to fetch details for
 * @returns {Promise<Object>} - Farmer object
 */
const getFarmerById = async (farmerId) => {
  try {
    if (!farmerId) {
      throw new Error('Farmer ID is required');
    }

    // Check cache first
    const cacheKey = `farmer_${farmerId}`;
    const cached = farmerCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached farmer details for:', farmerId);
      return cached.data;
    }

    console.log('Fetching farmer details for ID:', farmerId);
    const token = getToken();
    const { data } = await api.get('/farmers', { 
      params: { farmer_id: farmerId },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // The API returns an array, but we want the single farmer object
    const farmer = Array.isArray(data) ? data[0] : data;
    
    if (!farmer) {
      throw new Error('Farmer not found');
    }

    // Cache the result
    farmerCache.set(cacheKey, {
      data: farmer,
      timestamp: Date.now()
    });

    console.log('Fetched farmer details:', farmer.first_name, farmer.last_name);
    return farmer;
  } catch (error) {
    console.error('Error fetching farmer by ID:', error);
    throw error;
  }
};

/**
 * Get all farmers or a specific farmer (EXISTING FUNCTION - UNCHANGED)
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
    
    console.log('Fetching farms for farmer ID:', farmerId);
    const token = getToken();
    const { data } = await api.get('/farms', { 
      params: { farmer_id: farmerId },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Fetched ${data.length} farms for farmer:`, farmerId);
    return data;
  } catch (error) {
    console.error('Error fetching farms:', error);
    throw error;
  }
};

/**
 * Clear cache (useful for refreshing data)
 */
const clearCache = () => {
  searchCache.clear();
  farmerCache.clear();
  console.log('Farmer search and details cache cleared');
};

// Export as named exports
export { 
  getFarmers, 
  getFarmsByFarmerId, 
  searchFarmers, 
  getFarmerById,
  clearCache
};

// Also export as an object for compatibility with existing code
export const farmerQueryService = {
  getFarmers,
  getFarmsByFarmerId,
  searchFarmers,
  getFarmerById,
  clearCache
};