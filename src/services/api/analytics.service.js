// src/services/api/analytics.service.js
import axios from './axios.config';

/**
 * Analytics service for handling filter operations and analytics data
 */
class AnalyticsService {
  /**
   * Get LGAs for Abia state
   * @returns {Promise<Array>} Array of LGA objects
   */
  async getLGAs(state = 'Abia') {
    try {
      const response = await axios.get(`/dropdowns/lgas?state=${state}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching LGAs:', error);
      throw error;
    }
  }

  /**
   * Get cities for a specific LGA
   * @param {string} state - State name (default: 'Abia')
   * @param {string} lga - LGA identifier
   * @returns {Promise<Array>} Array of city objects
   */
  async getCities(state = 'Abia', lga) {
    if (!lga) {
      return [];
    }
    
    try {
      const response = await axios.get(`/dropdowns/cities?state=${state}&lga=${lga}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }

  /**
   * Get crop options
   * @returns {Promise<Array>} Array of crop objects
   */
  async getCrops() {
    try {
      const response = await axios.get('/dropdowns/crops');
      return response.data;
    } catch (error) {
      console.error('Error fetching crops:', error);
      throw error;
    }
  }

  /**
   * Apply farm filter and get analytics data
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Analytics data with filters, summary, map data, and breakdowns
   */
  async applyFarmFilter(filters) {
    try {
      const response = await axios.post('/analytics/farm-filter', filters);
      return response.data;
    } catch (error) {
      console.error('Error applying farm filter:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();