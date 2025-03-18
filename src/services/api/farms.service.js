// src/services/api/farms.service.js
import api from './axios.config';

// Helper function to get token
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

/**
 * Get all farms with optional filters
 * @param {Object} params - Optional query parameters
 * @param {string} [params.farmer_id] - Filter by farmer ID
 * @param {string} [params.farm_type] - Filter by farm type (crop_farming, livestock_farming, mixed_farming)
 * @param {string} [params.crop_type] - Filter by crop type
 * @param {string} [params.livestock_type] - Filter by livestock type
 * @returns {Promise<Array>} - Array of farm objects
 */
const getFarms = async (params = {}) => {
  try {
    const token = getToken();
    const { data } = await api.get('/farms', { 
      params,
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

/**
 * Get unique values for a specific field from farms data
 * @param {Array} farms - Array of farm objects
 * @param {string} field - Field name to extract unique values from
 * @returns {Array} - Array of unique values
 */
const getUniqueValues = (farms, field) => {
  if (!farms || !Array.isArray(farms) || farms.length === 0) {
    return [];
  }
  
  // Extract values and filter out null/undefined values
  const values = farms
    .map(farm => farm[field])
    .filter(value => value !== null && value !== undefined);
  
  // Return unique values
  return [...new Set(values)];
};

/**
 * Calculate summary statistics for farms
 * @param {Array} farms - Array of farm objects
 * @returns {Object} - Object containing summary statistics
 */
const calculateFarmsSummary = (farms) => {
  if (!farms || !Array.isArray(farms) || farms.length === 0) {
    return {
      totalFarms: 0,
      totalArea: 0,
      uniqueCrops: 0,
      uniqueLivestocks: 0,
      uniqueFarmers: 0,
      ownedFarms: 0,
      leasedFarms: 0
    };
  }
  
  // Get unique farmer IDs
  const uniqueFarmerIds = getUniqueValues(farms, 'farmer_id');
  
  // Get unique crop types
  const uniqueCropTypes = getUniqueValues(farms, 'crop_type');
  
  // Get unique livestock types
  const uniqueLivestockTypes = getUniqueValues(farms, 'livestock_type');
  
  // Calculate total area
  const totalArea = farms.reduce((sum, farm) => {
    const area = parseFloat(farm.calculated_area) || 0;
    return sum + area;
  }, 0);
  
  // Count farms by ownership status
  const ownedFarms = farms.filter(farm => farm.ownership_status === 'owned').length;
  const leasedFarms = farms.filter(farm => farm.ownership_status === 'leased').length;
  
  return {
    totalFarms: farms.length,
    totalArea: totalArea.toFixed(2),
    uniqueCrops: uniqueCropTypes.length,
    uniqueLivestocks: uniqueLivestockTypes.length,
    uniqueFarmers: uniqueFarmerIds.length,
    ownedFarms,
    leasedFarms
  };
};

/**
 * Load unique filter options from farms data
 * @returns {Promise<Object>} - Object containing unique filter options
 */
const loadFilterOptions = async () => {
  try {
    // Fetch all farms to extract unique values
    const farms = await getFarms();
    
    // Extract unique crop types
    const cropTypes = getUniqueValues(farms, 'crop_type');
    
    // Extract unique livestock types
    const livestockTypes = getUniqueValues(farms, 'livestock_type');
    
    return {
      cropTypes,
      livestockTypes
    };
  } catch (error) {
    console.error('Error loading filter options:', error);
    throw error;
  }
};

// Create a service object with all functions
const farmService = {
  getFarms,
  getUniqueValues,
  calculateFarmsSummary,
  loadFilterOptions
};

// Export as default
export default farmService;