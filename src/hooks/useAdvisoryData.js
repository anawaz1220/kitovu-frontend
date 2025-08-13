// src/hooks/useAdvisoryData.js
import { useState, useCallback } from 'react';
import advisoryService from '../services/api/advisory.service';

/**
 * Custom hook for managing advisory data fetching and state
 * @returns {Object} Hook return object
 */
export const useAdvisoryData = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Fetch all advisory data for a farm
   * @param {string} farmId - Farm ID
   * @param {Object} herbicideParams - Parameters for herbicide/pesticide API
   */
  const fetchAdvisoryData = useCallback(async (farmId, herbicideParams = {}) => {
    if (!farmId) {
      setError('Farm ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching advisory data for farm:', farmId, 'with params:', herbicideParams);
      
      const advisoryData = await advisoryService.getAllAdvisoryData(farmId, herbicideParams);
      
      // Check if we have any successful responses
      const hasAnySuccess = Object.values(advisoryData).some(result => result.success);
      
      if (!hasAnySuccess) {
        setError('Failed to fetch any advisory data. Please try again.');
        setData(null);
      } else {
        setData(advisoryData);
        setError(null);
      }
      
    } catch (err) {
      console.error('Error in fetchAdvisoryData:', err);
      setError('An unexpected error occurred while fetching advisory data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear data and reset state
   */
  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  /**
   * Get success count and error count from current data
   */
  const getDataStatus = useCallback(() => {
    if (!data) return { successCount: 0, errorCount: 0, totalCount: 4 };
    
    const results = Object.values(data);
    const successCount = results.filter(result => result.success).length;
    const errorCount = results.filter(result => !result.success).length;
    
    return {
      successCount,
      errorCount,
      totalCount: results.length,
      hasPartialData: successCount > 0 && errorCount > 0,
      hasCompleteData: successCount === results.length,
      hasNoData: successCount === 0
    };
  }, [data]);

  return {
    loading,
    data,
    error,
    fetchAdvisoryData,
    clearData,
    getDataStatus
  };
};