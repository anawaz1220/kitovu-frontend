// src/services/api/advisory.service.js
import axiosInstance from './axios.config';

/**
 * Advisory API Service
 * Handles all agricultural advisory API calls
 */
class AdvisoryService {
  constructor() {
    this.baseURL = '/advisory';
  }

  /**
   * Get fertilizer recommendations for a farm
   * @param {string} farmId - Farm ID
   * @returns {Promise<Object>} Fertilizer recommendations
   */
  async getFertilizerRecommendations(farmId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/fertilizer/${farmId}`);
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Error fetching fertilizer recommendations:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Failed to fetch fertilizer recommendations'
      };
    }
  }

  /**
   * Get crop health analysis for a farm
   * @param {string} farmId - Farm ID
   * @returns {Promise<Object>} Crop health analysis
   */
  async getCropHealthAnalysis(farmId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/crop_health/${farmId}`);
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Error fetching crop health analysis:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Failed to fetch crop health analysis'
      };
    }
  }

  /**
   * Get water stress analysis for a farm
   * @param {string} farmId - Farm ID
   * @returns {Promise<Object>} Water stress analysis
   */
  async getWaterStressAnalysis(farmId) {
    try {
      const response = await axiosInstance.get(`/water_stress/${farmId}`);
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Error fetching water stress analysis:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Failed to fetch water stress analysis'
      };
    }
  }

  /**
   * Get herbicide and pesticide recommendations for a farm
   * @param {string} farmId - Farm ID
   * @param {Object} params - Query parameters
   * @param {string} params.planting_date - Planting date (YYYY-MM-DD)
   * @param {string} params.growth_stage - Growth stage
   * @param {string} params.timing_preference - Application timing
   * @param {string} params.weed_pressure - Weed pressure level
   * @param {string} params.pest_pressure - Pest pressure level
   * @returns {Promise<Object>} Herbicide and pesticide recommendations
   */
  async getHerbicidePesticideRecommendations(farmId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add parameters if provided
      Object.entries(params).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${this.baseURL}/herbicide_pesticide/${farmId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axiosInstance.get(url);
      
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Error fetching herbicide/pesticide recommendations:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Failed to fetch herbicide/pesticide recommendations'
      };
    }
  }

  /**
   * Get all advisory data for a farm
   * @param {string} farmId - Farm ID
   * @param {Object} herbicideParams - Parameters for herbicide/pesticide API
   * @returns {Promise<Object>} Complete advisory data
   */
  async getAllAdvisoryData(farmId, herbicideParams = {}) {
    try {
      // Fetch all advisory data in parallel
      const [fertilizer, cropHealth, waterStress, herbicide] = await Promise.allSettled([
        this.getFertilizerRecommendations(farmId),
        this.getCropHealthAnalysis(farmId),
        this.getWaterStressAnalysis(farmId),
        this.getHerbicidePesticideRecommendations(farmId, herbicideParams)
      ]);

      return {
        fertilizer: fertilizer.status === 'fulfilled' ? fertilizer.value : { success: false, error: 'Failed to fetch data' },
        cropHealth: cropHealth.status === 'fulfilled' ? cropHealth.value : { success: false, error: 'Failed to fetch data' },
        waterStress: waterStress.status === 'fulfilled' ? waterStress.value : { success: false, error: 'Failed to fetch data' },
        herbicide: herbicide.status === 'fulfilled' ? herbicide.value : { success: false, error: 'Failed to fetch data' }
      };
    } catch (error) {
      console.error('Error fetching advisory data:', error);
      throw error;
    }
  }
}

// Export singleton instance
const advisoryService = new AdvisoryService();
export default advisoryService;