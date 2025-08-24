// src/services/api/abiaLGASummary.service.js
import api from './axios.config';

/**
 * Fetch Abia LGA summary data
 * @returns {Promise<Object>} - Abia LGAs summary with geometry and statistics
 */
export const fetchAbiaLGASummary = async () => {
  try {
    console.log('Fetching Abia LGA summary...');
    const { data } = await api.get('/locations/abia-state/lgas/summary');
    
    console.log('Abia LGA summary data:', data);
    
    // Transform to GeoJSON format with summary properties
    const geoJsonData = {
      type: 'FeatureCollection',
      features: data.lgas_summary.map((lga, index) => ({
        type: 'Feature',
        properties: {
          lga_name: lga.lga_name,
          farmers_count: lga.farmers_count,
          farms_count: lga.farms_count,
          total_area_acres: lga.total_area_acres,
          crops_by_count: lga.crops_by_count,
          state_name: data.state_name,
          // Add index for table interaction
          table_index: index
        },
        geometry: JSON.parse(lga.geom)
      }))
    };
    
    return {
      geoJsonData,
      rawSummary: data // Keep raw data for drawer display
    };
  } catch (error) {
    console.error('Error fetching Abia LGA summary:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

/**
 * Create table data from LGA summary for interactive table
 * @param {Array} lgaSummary - Array of LGA summary objects
 * @returns {Array} - Flattened table data with LGA, crop, count, and area
 */
export const createTableData = (lgaSummary) => {
  if (!lgaSummary || lgaSummary.length === 0) {
    return [];
  }

  const tableData = [];
  
  lgaSummary.forEach((lga, lgaIndex) => {
    if (lga.crops_by_count && lga.crops_by_count.length > 0) {
      lga.crops_by_count.forEach((crop, cropIndex) => {
        tableData.push({
          id: `${lgaIndex}-${cropIndex}`,
          lga_name: lga.lga_name,
          lga_index: lgaIndex,
          crop_name: crop.crop,
          crop_count: crop.count,
          crop_area: crop.area,
          farmers_count: lga.farmers_count,
          farms_count: lga.farms_count,
          total_area_acres: lga.total_area_acres
        });
      });
    } else {
      // If no crops, still show LGA entry
      tableData.push({
        id: `${lgaIndex}-0`,
        lga_name: lga.lga_name,
        lga_index: lgaIndex,
        crop_name: 'No crops',
        crop_count: 0,
        crop_area: 0,
        farmers_count: lga.farmers_count,
        farms_count: lga.farms_count,
        total_area_acres: lga.total_area_acres
      });
    }
  });
  
  return tableData;
};