// src/services/api/farm.service.js
import api from './axios.config';

export const farmService = {
  getFarmGeometries: async () => {
    try {
      const { data } = await api.get('/farms/geometries');
      return data;
    } catch (error) {
      console.error('Error fetching farm geometries:', error);
      throw error;
    }
  }
};