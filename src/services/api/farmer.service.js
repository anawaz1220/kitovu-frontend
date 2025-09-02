import api from './axios.config';

// Helper function to get token
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const farmerService = {
  createFarmer: async (farmerData, farmData, affiliationData, farmerPicture, idPicture) => {
    try {
      const formData = new FormData();
      
      // Include location data in farmerData
      const farmerDataWithLocation = {
        ...farmerData,
        user_latitude: farmerData.user_latitude,
        user_longitude: farmerData.user_longitude
      };
      
      // Ensure farmData is an array
      const farmDataArray = Array.isArray(farmData) ? farmData : [farmData];
      
      // Append JSON data
      formData.append('farmer', JSON.stringify(farmerDataWithLocation));
      formData.append('farm', JSON.stringify(farmDataArray));
      formData.append('affiliation', JSON.stringify(affiliationData));
      
      // Append files
      formData.append('farmer_picture', farmerPicture);
      formData.append('id_document_picture', idPicture);
      
      const { data } = await api.post('/farmer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  updateFarmer: async (farmerId, farmerData, farmerPicture = null, idPicture = null) => {
    try {
      const formData = new FormData();
      const token = getToken();
      
      // Add all farmer data fields to FormData
      Object.keys(farmerData).forEach(key => {
        if (farmerData[key] !== null && farmerData[key] !== undefined) {
          formData.append(key, farmerData[key]);
        }
      });
      
      // Append files if provided
      if (farmerPicture) {
        formData.append('farmer_picture', farmerPicture);
      }
      if (idPicture) {
        formData.append('id_document_picture', idPicture);
      }
      
      const { data } = await api.put(`/farmers/${farmerId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error updating farmer:', error);
      throw error;
    }
  },

  updateFarmAffiliation: async (affiliationData) => {
    try {
      const token = getToken();
      const { data } = await api.put('/farmer-affiliation', affiliationData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error updating farmer affiliation:', error);
      throw error;
    }
  }
};