// src/services/api/abiaStateSummary.service.js
import api from './axios.config';

/**
 * Fetch Abia state summary data
 * @returns {Promise<Object>} - Abia state summary with geometry and statistics
 */
export const fetchAbiaStateSummary = async () => {
  try {
    console.log('Fetching Abia state summary...');
    const { data } = await api.get('/locations/abia-state/summary');
    
    console.log('Abia state summary data:', data);
    
    // Transform to GeoJSON format with summary properties
    const geoJsonData = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {
          name: data.state_name,
          type: 'State',
          farmers_count: data.farmers_count,
          farms_count: data.farms_count,
          total_area_acres: data.total_area_acres,
          crops_by_count: data.crops_by_count,
          // Additional computed properties
          primary_crop: data.crops_by_count && data.crops_by_count.length > 0 
            ? data.crops_by_count[0].crop 
            : null,
          crop_diversity: data.crops_by_count ? data.crops_by_count.length : 0
        },
        geometry: JSON.parse(data.geom)
      }]
    };
    
    return {
      geoJsonData,
      rawSummary: data // Keep raw data for drawer display
    };
  } catch (error) {
    console.error('Error fetching Abia state summary:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

/**
 * Format crops data for display
 * @param {Array} cropsData - Array of crop objects
 * @returns {Object} - Formatted crops information
 */
export const formatCropsData = (cropsData) => {
  if (!cropsData || cropsData.length === 0) {
    return {
      totalCrops: 0,
      topCrop: null,
      cropsList: []
    };
  }

  // Sort by count (descending)
  const sortedCrops = [...cropsData].sort((a, b) => b.count - a.count);
  
  return {
    totalCrops: cropsData.length,
    topCrop: sortedCrops[0],
    cropsList: sortedCrops.map(crop => ({
      ...crop,
      percentage: ((crop.count / cropsData.reduce((sum, c) => sum + c.count, 0)) * 100).toFixed(1)
    }))
  };
};